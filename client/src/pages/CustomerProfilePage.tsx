import React, { type ChangeEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, ImagePlus, LogIn, MapPin, Phone, Save, Trash2, UserRound } from "lucide-react";
import { ImageCropDialog } from "@/components/ImageCropDialog";
import { supabase } from "@/lib/supabase";
import { getOAuthReturnUrl } from "@/lib/oauthReturn";
import { createPrivateProfilePhotoUrl } from "@/lib/profilePhoto";
import { formatProfilePhotoBytes, isAcceptedProfilePhoto, optimizeProfilePhoto, PROFILE_PHOTO_MAX_INPUT_BYTES } from "@/lib/profilePhotoOptimization";

type DeliveryDraft = { phone: string; cep: string; street: string; number: string; complement: string; district: string; city: string; state: string };

const blankDelivery: DeliveryDraft = { phone: "", cep: "", street: "", number: "", complement: "", district: "", city: "", state: "" };
const PROFILE_PHOTO_HINT = "Use JPG, PNG ou WEBP. Antes do envio, você pode enquadrar a foto sem deixar a imagem esticada.";

function profilePhotoUploadError(message?: string) {
  const detail = (message ?? "").toLowerCase();
  if (detail.includes("size") || detail.includes("large") || detail.includes("limit")) return "A foto não pôde ser reduzida para o tamanho seguro. Escolha outra imagem e tente novamente.";
  if (detail.includes("mime") || detail.includes("type") || detail.includes("format")) return "Escolha uma foto em JPG, PNG ou WEBP.";
  return "Não foi possível enviar a foto agora. Verifique sua conexão e tente novamente.";
}

export default function CustomerProfilePage() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [name, setName] = useState("");
  const [delivery, setDelivery] = useState<DeliveryDraft>(blankDelivery);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState("");
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const client = supabase;
      if (!client) { if (active) setLoading(false); return; }
      try {
        const { data, error: sessionError } = await client.auth.getUser();
        if (sessionError) throw sessionError;
        if (!data.user) return;
        const { data: profile, error: profileError } = await client.from("profiles").select("display_name, profile_photo_path, delivery_phone, delivery_postal_code, delivery_street, delivery_number, delivery_complement, delivery_district, delivery_city, delivery_state, role").eq("id", data.user.id).maybeSingle();
        if (profileError) throw profileError;
        if (profile?.role === "admin") { navigate("/admin", { replace: true }); return; }
        const nextPhotoUrl = await createPrivateProfilePhotoUrl(client, profile?.profile_photo_path);
        if (!active) return;
        setSignedIn(true);
        setUserId(data.user.id);
        setName(profile?.display_name ?? "");
        setPhotoPath(profile?.profile_photo_path ?? null);
        setPhotoUrl(nextPhotoUrl);
        setDelivery({ phone: profile?.delivery_phone ?? "", cep: profile?.delivery_postal_code ?? "", street: profile?.delivery_street ?? "", number: profile?.delivery_number ?? "", complement: profile?.delivery_complement ?? "", district: profile?.delivery_district ?? "", city: profile?.delivery_city ?? "", state: profile?.delivery_state ?? "" });
      } catch {
        if (active) { setSignedIn(false); setUserId(""); setPhotoPath(null); setPhotoUrl(null); setNotice("Não foi possível carregar seu cadastro agora. Verifique a conexão e tente novamente."); }
      } finally { if (active) setLoading(false); }
    };
    void loadProfile();
    return () => { active = false; };
  }, [navigate]);

  async function signIn() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: getOAuthReturnUrl("/perfil") } });
  }

  async function save() {
    const client = supabase;
    if (!client || !name.trim()) return;
    const { data } = await client.auth.getUser();
    if (!data.user) return;
    try {
      setSaving(true);
      const { error } = await client.rpc("update_own_customer_profile" as never, { p_display_name: name.trim(), p_delivery_phone: delivery.phone, p_delivery_postal_code: delivery.cep, p_delivery_street: delivery.street, p_delivery_number: delivery.number, p_delivery_complement: delivery.complement, p_delivery_district: delivery.district, p_delivery_city: delivery.city, p_delivery_state: delivery.state } as never);
      setNotice(error ? "Não foi possível salvar agora. Tente novamente." : "Cadastro salvo. Seu endereço poderá ser usado no checkout e continua editável antes do pedido.");
    } finally { setSaving(false); }
  }

  async function uploadProfilePhoto(file: File) {
    const client = supabase;
    if (!client || !userId) return;
    const previousPhotoUrl = photoUrl;
    let localPreviewUrl: string | null = null;
    try {
      setPhotoBusy(true);
      setNotice("Otimizando sua foto para enviar com qualidade e ocupar menos espaço…");
      const optimized = await optimizeProfilePhoto(file);
      const nextPath = `${userId}/avatar.webp`;
      localPreviewUrl = URL.createObjectURL(optimized.file);
      setPhotoUrl(localPreviewUrl);
      setNotice(`Foto otimizada de ${formatProfilePhotoBytes(optimized.originalBytes)} para ${formatProfilePhotoBytes(optimized.optimizedBytes)}. Enviando…`);
      const { error: uploadError } = await client.storage.from("customer-profile-photos").upload(nextPath, optimized.file, { upsert: true, contentType: "image/webp", cacheControl: "3600" });
      if (uploadError) { URL.revokeObjectURL(localPreviewUrl); setPhotoUrl(previousPhotoUrl); setNotice(profilePhotoUploadError(uploadError.message)); return; }
      const { error: profileError } = await client.rpc("update_own_profile_photo" as never, { p_profile_photo_path: nextPath } as never);
      if (profileError) { URL.revokeObjectURL(localPreviewUrl); setPhotoUrl(previousPhotoUrl); setNotice("A imagem foi enviada, mas não foi possível vinculá-la ao seu perfil agora. Tente novamente."); return; }
      if (photoPath && photoPath !== nextPath) await client.storage.from("customer-profile-photos").remove([photoPath]);
      setPhotoPath(nextPath);
      const storedPhotoUrl = await createPrivateProfilePhotoUrl(client, nextPath);
      if (storedPhotoUrl) { URL.revokeObjectURL(localPreviewUrl); setPhotoUrl(storedPhotoUrl); }
      setNotice(storedPhotoUrl ? `Foto de perfil atualizada e otimizada para ${formatProfilePhotoBytes(optimized.optimizedBytes)}.` : "Foto salva. Atualize a página para carregar sua imagem privada novamente.");
    } catch (error) {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      setPhotoUrl(previousPhotoUrl);
      setNotice(profilePhotoUploadError(error instanceof Error ? error.message : undefined));
    } finally { setPhotoBusy(false); }
  }

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isAcceptedProfilePhoto(file)) { setNotice("Escolha uma imagem JPG, PNG ou WEBP."); return; }
    if (file.size > PROFILE_PHOTO_MAX_INPUT_BYTES) { setNotice("A foto é maior que 8 MB. Escolha uma imagem menor e tente novamente."); return; }
    setPendingPhoto(file);
  }

  async function removePhoto() {
    const client = supabase;
    if (!client || !photoPath) return;
    try {
      setPhotoBusy(true);
      const { error } = await client.rpc("update_own_profile_photo" as never, { p_profile_photo_path: null } as never);
      if (error) { setNotice("Não foi possível remover a foto agora."); return; }
      await client.storage.from("customer-profile-photos").remove([photoPath]);
      setPhotoPath(null); setPhotoUrl(null); setNotice("Foto de perfil removida.");
    } finally { setPhotoBusy(false); }
  }

  if (loading) return <main className="container py-16 text-white/60">Carregando seu cadastro…</main>;
  return (
    <main className="container max-w-2xl py-10 md:py-16">
      <Link href="/" className="text-sm text-white/55 hover:text-[#7affb9]">← Voltar para a loja</Link>
      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[.025] p-6 sm:p-8">
        <p className="eyebrow">MINHA CONTA</p><h1 className="mt-2 text-3xl font-black">SEU CADASTRO</h1>
        <p className="mt-3 text-sm leading-6 text-white/60">O Google serve apenas para entrar com segurança. Seu nome, foto e dados de entrega ficam vinculados somente à sua conta e você pode atualizá-los quando quiser.</p>
        {!signedIn ? <button onClick={() => void signIn()} className="button-primary mt-7 w-full"><LogIn size={17} /> ENTRAR COM GOOGLE</button> : <div className="mt-7 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5"><div className="flex items-center gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.04]">{photoUrl ? <img src={photoUrl} alt="Sua foto de perfil" className="h-full w-full object-cover" /> : <UserRound size={30} className="text-[#7affb9]" />}</div><div className="min-w-0"><h2 className="font-bold">Foto de perfil <span className="text-xs font-normal text-white/45">(opcional)</span></h2><p className="mt-1 text-xs leading-5 text-white/55">Escolha uma foto sua da galeria. A foto do Google não é usada automaticamente. {PROFILE_PHOTO_HINT}</p><div className="mt-3 flex flex-wrap gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#7affb9]/35 px-3 py-2 text-xs font-bold text-[#7affb9] transition hover:bg-[#7affb9]/10"><ImagePlus size={15} />{photoBusy ? "AGUARDE..." : photoUrl ? "TROCAR FOTO" : "ESCOLHER FOTO"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={photoBusy} onChange={choosePhoto} className="sr-only" /></label>{photoUrl && <button type="button" onClick={() => void removePhoto()} disabled={photoBusy} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-white/65 transition hover:border-red-300/50 hover:text-red-300"><Trash2 size={15} /> REMOVER</button>}</div></div></div></div>
          <div><label className="text-sm font-semibold" htmlFor="fullName">Nome completo</label><input id="fullName" value={name} onChange={event => setName(event.target.value)} placeholder="Digite seu nome completo" className="field mt-2 w-full" /></div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5"><div className="flex items-center gap-2"><MapPin size={17} className="text-[#7affb9]" /><h2 className="font-bold">Dados de entrega <span className="text-xs font-normal text-white/45">(opcional)</span></h2></div><p className="mt-2 text-xs leading-5 text-white/55">Se você comprar para entrega pelos Correios, o checkout já preenche estes dados. Confirme e corrija o endereço antes de enviar o pedido.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="sm:col-span-2"><span className="sr-only">Telefone</span><div className="relative"><Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input value={delivery.phone} onChange={event => setDelivery({ ...delivery, phone: event.target.value })} placeholder="Telefone (opcional)" className="field w-full pl-10" /></div></label>{([['cep', 'CEP'], ['street', 'Rua ou avenida'], ['number', 'Número'], ['complement', 'Complemento (opcional)'], ['district', 'Bairro'], ['city', 'Cidade'], ['state', 'UF']] as const).map(([key, label]) => <input key={key} value={delivery[key]} onChange={event => setDelivery({ ...delivery, [key]: key === "state" ? event.target.value.toUpperCase().slice(0, 2) : event.target.value })} placeholder={label} className="field" />)}</div></div>
          <button onClick={() => void save()} disabled={!name.trim() || saving} className="button-primary w-full"><Save size={17} />{saving ? "SALVANDO..." : "SALVAR MEU CADASTRO"}</button>{notice && <p role="status" className="flex gap-2 text-sm text-[#7affb9]"><CheckCircle2 size={17} />{notice}</p>}
        </div>}
      </section>
      <ImageCropDialog open={Boolean(pendingPhoto)} file={pendingPhoto} aspectRatio={1} title="Enquadrar foto de perfil" onCancel={() => setPendingPhoto(null)} onConfirm={async file => { await uploadProfilePhoto(file); setPendingPhoto(null); }} />
    </main>
  );
}
