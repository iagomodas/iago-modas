import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout, { type DashboardMenuItem } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import { useSupabaseOrders, useSupabaseProducts } from "@/hooks/useSupabaseAdmin";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";
import { categories, type Category, toMoney } from "@/lib/catalog";
import { storefrontDefaults, type StorefrontSettings } from "@/lib/storefront";
import { hasSupabaseConfiguration, supabase } from "@/lib/supabase";
import type { SupabaseOrder, SupabaseProduct } from "@/lib/supabaseTypes";
import { Boxes, Brush, ClipboardList, LayoutDashboard, Loader2, Megaphone, PackagePlus, Pencil, ReceiptText, Save, ShieldAlert, Trash2 } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

type ProductForm = { name: string; slug: string; category: Category; description: string; price: string; compareAtPrice: string; sizes: string; imageUrl: string; imageUrls: string; badge: string; accentColor: string; stock: string; isActive: boolean };
type StorefrontField = keyof StorefrontSettings;

const emptyForm: ProductForm = { name: "", slug: "", category: "Camisetas", description: "", price: "", compareAtPrice: "", sizes: "P, M, G, GG", imageUrl: "", imageUrls: "", badge: "", accentColor: "#82ffc5", stock: "0", isActive: true };
const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const asCents = (value: string) => Math.round(Number(value.replace(".", "").replace(",", ".")) * 100);

const adminMenu: DashboardMenuItem[] = [
  { icon: LayoutDashboard, label: "Visão geral", target: "overview" },
  { icon: Megaphone, label: "Vitrine", target: "storefront" },
  { icon: Boxes, label: "Produtos", target: "products" },
  { icon: ReceiptText, label: "Pedidos", target: "orders" },
];

const orderLabels: Record<SupabaseOrder["payment_status"], string> = { pending: "Aguardando confirmação", approved: "Confirmado", rejected: "Não aprovado", cancelled: "Cancelado" };

function toForm(product: SupabaseProduct): ProductForm {
  return { name: product.name, slug: product.slug, category: product.category as Category, description: product.description, price: (product.price_cents / 100).toFixed(2).replace(".", ","), compareAtPrice: product.compare_at_price_cents ? (product.compare_at_price_cents / 100).toFixed(2).replace(".", ",") : "", sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : String(product.sizes ?? ""), imageUrl: product.image_url, imageUrls: Array.isArray(product.image_urls) ? product.image_urls.join("\n") : "", badge: product.badge ?? "", accentColor: product.accent_color, stock: String(product.stock), isActive: product.is_active };
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#080909]" />;
  if (!hasSupabaseConfiguration) return <ConfigurationNotice />;
  if (!user) return <LoginNotice />;
  if (user.role !== "admin") return <AccessDenied />;
  return <DashboardLayout brandLabel="Gestão OM" menuItems={adminMenu}><AdminConsole /></DashboardLayout>;
}

function ConfigurationNotice() {
  return <main className="grid min-h-screen place-items-center bg-[#080909] px-5 text-center text-white"><section className="max-w-lg rounded-3xl border border-white/10 bg-white/[.04] p-8"><Boxes className="mx-auto text-[#82ffc5]" size={38} /><p className="mt-5 text-xs font-bold tracking-[.2em] text-[#82ffc5]">PAINEL EM CONFIGURAÇÃO</p><h1 className="mt-2 font-display text-3xl">Conecte o Supabase para administrar a loja</h1><p className="mt-4 text-sm leading-6 text-white/60">Adicione a URL do projeto e a publishable key nas configurações seguras. Nunca use a chave service_role no navegador.</p><Link href="/"><Button className="mt-7 bg-white text-black hover:bg-[#82ffc5]">VOLTAR PARA A LOJA</Button></Link></section></main>;
}

function LoginNotice() {
  return <main className="grid min-h-screen place-items-center bg-[#080909] px-5 text-center text-white"><section className="max-w-md rounded-3xl border border-white/10 bg-white/[.04] p-8"><ShieldAlert className="mx-auto text-[#82ffc5]" size={38} /><h1 className="mt-5 font-display text-3xl">Área administrativa</h1><p className="mt-3 text-sm leading-6 text-white/60">Entre com a conta Google autorizada como administradora no Supabase.</p><Button onClick={() => void startLogin()} className="mt-7 bg-[#82ffc5] text-black hover:bg-white">ENTRAR COM GOOGLE</Button></section></main>;
}

function AccessDenied() {
  return <main className="grid min-h-screen place-items-center bg-[#080909] px-5 text-center text-white"><section className="max-w-md rounded-3xl border border-red-300/20 bg-red-300/[.04] p-8"><ShieldAlert className="mx-auto text-red-300" size={38} /><h1 className="mt-5 font-display text-3xl">Acesso restrito</h1><p className="mt-3 text-sm leading-6 text-white/60">Esta conta não possui a permissão de administrador da Overzied Modas.</p><Link href="/"><Button variant="outline" className="mt-7 border-white/20 text-white hover:bg-white/10">VOLTAR PARA A LOJA</Button></Link></section></main>;
}

function AdminConsole() {
  const catalog = useSupabaseProducts(true);
  const operations = useSupabaseOrders();
  const storefront = useStorefrontSettings();
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingStorefront, setSavingStorefront] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [storefrontDraft, setStorefrontDraft] = useState<StorefrontSettings>(storefrontDefaults);
  const stockCount = useMemo(() => catalog.products.reduce((total, product) => total + product.stock, 0), [catalog.products]);

  useEffect(() => { setStorefrontDraft(storefront.settings); }, [storefront.settings]);
  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setStorefrontField = (key: StorefrontField, value: string | boolean) => setStorefrontDraft((current) => ({ ...current, [key]: value } as StorefrontSettings));
  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setSavingProduct(true); setFeedback(null);
    const product = { name: form.name.trim(), slug: form.slug.trim() || slugify(form.name), category: form.category, description: form.description.trim(), price_cents: asCents(form.price), compare_at_price_cents: form.compareAtPrice ? asCents(form.compareAtPrice) : null, sizes: form.sizes.split(",").map((size) => size.trim()).filter(Boolean), image_url: form.imageUrl.trim(), image_urls: form.imageUrls.split("\n").map((url) => url.trim()).filter(Boolean), badge: form.badge.trim() || null, accent_color: form.accentColor.trim() || "#82ffc5", stock: Math.max(0, Number.parseInt(form.stock, 10) || 0), is_active: form.isActive };
    const { error } = editingId ? await supabase.from("products").update(product).eq("id", editingId) : await supabase.from("products").insert(product);
    if (error) setFeedback(error.message); else { setFeedback(editingId ? "Produto atualizado e visível na loja." : "Produto cadastrado e pronto para aparecer na loja."); reset(); await catalog.refresh(); }
    setSavingProduct(false);
  };

  const saveStorefront = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setSavingStorefront(true); setFeedback(null);
    const { error } = await supabase.from("storefront_settings").update(storefrontDraft).eq("id", true);
    if (error) setFeedback(error.message); else { setFeedback("Vitrine atualizada. Os clientes já verão as novas informações."); await storefront.refresh(); }
    setSavingStorefront(false);
  };

  const remove = async (product: SupabaseProduct) => {
    if (!supabase || !window.confirm(`Remover ${product.name}?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    setFeedback(error ? error.message : "Produto removido da loja."); await catalog.refresh();
  };

  const updateOrder = async (id: number, status: SupabaseOrder["payment_status"]) => {
    if (!supabase) return;
    const { error } = await supabase.from("orders").update({ payment_status: status }).eq("id", id);
    setFeedback(error ? error.message : "Status do pedido atualizado."); await operations.refresh();
  };

  return <div className="mx-auto max-w-7xl space-y-8 pb-10 text-white">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6"><div><p className="text-xs font-bold tracking-[.2em] text-[#82ffc5]">OVERZIED MODAS</p><h1 className="mt-2 font-display text-4xl">Controle da loja</h1><p className="mt-2 max-w-2xl text-sm text-white/55">Edite produtos, preços, estoque, pedidos e todos os textos da vitrine que os clientes veem.</p></div><Link href="/"><Button variant="outline" className="border-white/20 text-white hover:bg-white/10">VER LOJA</Button></Link></header>
    {feedback && <p className="rounded-xl border border-[#82ffc5]/20 bg-[#82ffc5]/[.06] px-4 py-3 text-sm text-white/80">{feedback}</p>}
    <section id="overview" className="scroll-mt-24 space-y-4"><SectionHeading eyebrow="VISÃO GERAL" title="Resumo da operação" icon={<LayoutDashboard size={18} />} /><div className="grid gap-4 md:grid-cols-3"><Stat icon={<Boxes size={18} />} label="PRODUTOS" value={catalog.loading ? "—" : String(catalog.products.length)} /><Stat icon={<ClipboardList size={18} />} label="PEDIDOS AGUARDANDO" value={operations.loading ? "—" : String(operations.orders.filter((order) => order.payment_status === "pending").length)} /><Stat icon={<PackagePlus size={18} />} label="PEÇAS EM ESTOQUE" value={catalog.loading ? "—" : String(stockCount)} /></div></section>
    <section id="storefront" className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/[.035] p-6 md:p-7"><SectionHeading eyebrow="VITRINE PÚBLICA" title="Tudo o que o cliente vê" icon={<Brush size={19} />} description="Controle os avisos, destaques, benefícios, coleções, categorias, promoções, novidades e rodapé sem editar código." /><StorefrontEditor draft={storefrontDraft} onFieldChange={setStorefrontField} onImageChange={(value) => setStorefrontDraft((current) => ({ ...current, hero_image_url: value }))} onSave={saveStorefront} saving={savingStorefront} error={storefront.error} /></section>
    <section id="products" className="scroll-mt-24 grid gap-8 xl:grid-cols-[410px_1fr]"><form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><SectionHeading eyebrow="CATÁLOGO" title={editingId ? "Editar produto" : "Novo produto"} icon={<PackagePlus size={18} />} />{editingId && <Button type="button" onClick={reset} variant="ghost" className="mt-2 text-white hover:bg-white/10">CANCELAR EDIÇÃO</Button>}<div className="mt-6 grid gap-4"><Field label="Nome"><input required value={form.name} onChange={(event) => set("name", event.target.value)} className="admin-input" /></Field><Field label="Slug"><input value={form.slug} onChange={(event) => set("slug", event.target.value)} className="admin-input" placeholder="Gerado pelo nome se vazio" /></Field><Field label="Categoria"><select value={form.category} onChange={(event) => set("category", event.target.value as Category)} className="admin-input">{categories.map((category) => <option className="bg-zinc-950" key={category}>{category}</option>)}</select></Field><Field label="Descrição"><textarea required value={form.description} onChange={(event) => set("description", event.target.value)} className="admin-input min-h-24 py-2" /></Field><div className="grid grid-cols-2 gap-3"><Field label="Preço"><input required value={form.price} onChange={(event) => set("price", event.target.value)} inputMode="decimal" className="admin-input" placeholder="89,90" /></Field><Field label="Preço anterior"><input value={form.compareAtPrice} onChange={(event) => set("compareAtPrice", event.target.value)} inputMode="decimal" className="admin-input" /></Field></div><div className="grid grid-cols-2 gap-3"><Field label="Tamanhos"><input required value={form.sizes} onChange={(event) => set("sizes", event.target.value)} className="admin-input" /></Field><Field label="Estoque"><input required type="number" min="0" value={form.stock} onChange={(event) => set("stock", event.target.value)} className="admin-input" /></Field></div><Field label="URL da imagem principal"><input required type="url" value={form.imageUrl} onChange={(event) => set("imageUrl", event.target.value)} className="admin-input" placeholder="https://..." /></Field><Field label="Fotos adicionais"><textarea value={form.imageUrls} onChange={(event) => set("imageUrls", event.target.value)} className="admin-input min-h-24 py-2" placeholder="Uma URL por linha" /><p className="-mt-2 text-xs leading-5 text-white/45">Adicione uma URL por linha. O cliente poderá deslizar entre todas as fotos.</p></Field><div className="grid grid-cols-2 gap-3"><Field label="Selo"><input value={form.badge} onChange={(event) => set("badge", event.target.value)} className="admin-input" placeholder="NOVO" /></Field><Field label="Cor de destaque"><input value={form.accentColor} onChange={(event) => set("accentColor", event.target.value)} className="admin-input" /></Field></div><label className="flex items-center gap-3 text-sm text-white/70"><input type="checkbox" checked={form.isActive} onChange={(event) => set("isActive", event.target.checked)} /> Produto visível na loja</label><Button disabled={savingProduct} className="bg-[#82ffc5] text-black hover:bg-white">{savingProduct && <Loader2 className="mr-2 animate-spin" size={16} />}{editingId ? "SALVAR ALTERAÇÕES" : "CADASTRAR PRODUTO"}</Button></div></form><section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]"><div className="border-b border-white/10 px-6 py-5"><p className="text-xs font-bold tracking-[.18em] text-[#82ffc5]">PRODUTOS CADASTRADOS</p><h2 className="mt-1 font-display text-2xl">Catálogo visível</h2></div>{catalog.error ? <ErrorText message={catalog.error} /> : <div className="divide-y divide-white/10">{catalog.products.map((product) => <div key={product.id} className="flex flex-wrap items-center gap-4 px-6 py-4"><img src={product.image_url} alt="" className="h-14 w-12 rounded-lg bg-black/30 object-cover" /><div className="min-w-40 flex-1"><p className="font-medium">{product.name}</p><p className="mt-1 text-xs text-white/45">{product.category} · {product.stock} em estoque · {product.is_active ? "Ativo" : "Oculto"}</p></div><p className="text-sm">{toMoney(product.price_cents / 100)}</p><Button type="button" onClick={() => { setForm(toForm(product)); setEditingId(product.id); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }} variant="ghost" size="icon" className="text-white hover:bg-white/10"><Pencil size={16} /></Button><Button type="button" onClick={() => void remove(product)} variant="ghost" size="icon" className="text-red-300 hover:bg-red-300/10 hover:text-red-200"><Trash2 size={16} /></Button></div>)}{!catalog.loading && catalog.products.length === 0 && <Empty message="Nenhum produto cadastrado no Supabase." />}</div>}</section></section>
    <section id="orders" className="scroll-mt-24 overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]"><div className="border-b border-white/10 px-6 py-5"><SectionHeading eyebrow="PEDIDOS" title="Acompanhamento" icon={<ClipboardList size={18} />} description="Pedidos iniciados pelo Instagram são confirmados na conversa. Atualize o status depois de conferir o Pix." /></div>{operations.error ? <ErrorText message={operations.error} /> : <div className="divide-y divide-white/10">{operations.orders.map((order) => <div key={order.id} className="flex flex-wrap items-center gap-x-5 gap-y-3 px-6 py-4 text-sm"><div className="min-w-36"><p className="font-medium">{order.order_number}</p><p className="mt-1 text-xs text-white/45">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p></div><p className="min-w-40 flex-1 text-white/65">{order.customer_name}</p><select value={order.payment_status} onChange={(event) => void updateOrder(order.id, event.target.value as SupabaseOrder["payment_status"])} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none"><option value="pending">{orderLabels.pending}</option><option value="approved">{orderLabels.approved}</option><option value="rejected">{orderLabels.rejected}</option><option value="cancelled">{orderLabels.cancelled}</option></select><p>{toMoney(order.total_cents / 100)}</p></div>)}{!operations.loading && operations.orders.length === 0 && <Empty message="Ainda não há pedido registrado. Os clientes iniciarão o pedido pela conversa no Instagram." />}</div>}</section>
  </div>;
}

function StorefrontEditor({ draft, onFieldChange, onImageChange, onSave, saving, error }: { draft: StorefrontSettings; onFieldChange: (key: StorefrontField, value: string | boolean) => void; onImageChange: (value: string | null) => void; onSave: (event: FormEvent) => void; saving: boolean; error: string | null }) {
  const groups: { title: string; fields: { key: StorefrontField; label: string; multiline?: boolean }[] }[] = [
    { title: "AVISO E DESTAQUE PRINCIPAL", fields: [{ key: "announcement_text", label: "Aviso no topo", multiline: true }, { key: "hero_eyebrow", label: "Etiqueta acima do título" }, { key: "hero_title", label: "Título principal", multiline: true }, { key: "hero_accent", label: "Palavra ou frase em verde" }, { key: "hero_description", label: "Texto principal", multiline: true }, { key: "hero_cta_label", label: "Texto do botão principal" }, { key: "hero_cta_path", label: "Destino interno do botão" }] },
    { title: "PROMOÇÃO DA SEMANA", fields: [{ key: "promotion_eyebrow", label: "Etiqueta" }, { key: "promotion_title", label: "Título" }, { key: "promotion_accent", label: "Linha de destaque" }, { key: "promotion_description", label: "Descrição", multiline: true }, { key: "promotion_cta_label", label: "Texto do botão" }, { key: "promotion_cta_path", label: "Destino interno do botão" }] },
    { title: "COLEÇÃO E CATEGORIAS", fields: [{ key: "highlights_eyebrow", label: "Etiqueta dos destaques" }, { key: "highlights_title", label: "Título dos destaques" }, { key: "highlights_description", label: "Descrição dos destaques", multiline: true }, { key: "highlights_cta_label", label: "Botão dos destaques" }, { key: "highlights_cta_path", label: "Destino do botão dos destaques" }, { key: "categories_eyebrow", label: "Etiqueta das categorias" }, { key: "categories_title", label: "Título das categorias" }, { key: "categories_description", label: "Descrição das categorias", multiline: true }] },
    { title: "BENEFÍCIOS", fields: [{ key: "benefit_one_title", label: "Benefício 1 — título" }, { key: "benefit_one_caption", label: "Benefício 1 — texto" }, { key: "benefit_two_title", label: "Benefício 2 — título" }, { key: "benefit_two_caption", label: "Benefício 2 — texto" }, { key: "benefit_three_title", label: "Benefício 3 — título" }, { key: "benefit_three_caption", label: "Benefício 3 — texto" }, { key: "benefit_four_title", label: "Benefício 4 — título" }, { key: "benefit_four_caption", label: "Benefício 4 — texto" }] },
    { title: "NOVIDADES E RODAPÉ", fields: [{ key: "newsletter_title", label: "Título de novidades" }, { key: "newsletter_description", label: "Texto de novidades", multiline: true }, { key: "footer_description", label: "Descrição do rodapé", multiline: true }, { key: "footer_location", label: "Localização e entrega", multiline: true }, { key: "footer_hours", label: "Horário de atendimento" }] },
  ];
  return <form onSubmit={onSave} className="mt-7 grid gap-5">{groups.map((group) => <fieldset key={group.title} className="grid gap-4 rounded-2xl border border-white/10 p-5"><legend className="px-2 text-xs font-bold tracking-[.16em] text-[#82ffc5]">{group.title}</legend>{group.title === "AVISO E DESTAQUE PRINCIPAL" && <><Field label="Imagem principal (URL opcional)"><input type="url" value={draft.hero_image_url ?? ""} onChange={(event) => onImageChange(event.target.value.trim() || null)} className="admin-input" placeholder="https://..." /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="Cor principal"><input type="color" value={draft.primary_color} onChange={(event) => onFieldChange("primary_color", event.target.value)} className="h-11 w-full cursor-pointer rounded-lg border border-white/10 bg-black/30 p-1" /></Field><Field label="Cor de fundo"><input type="color" value={draft.background_color} onChange={(event) => onFieldChange("background_color", event.target.value)} className="h-11 w-full cursor-pointer rounded-lg border border-white/10 bg-black/30 p-1" /></Field></div><div className="grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2"><p className="text-xs font-bold tracking-[.16em] text-[#82ffc5] sm:col-span-2">SEÇÕES VISÍVEIS NA HOME</p>{([['hero_visible','Banner principal'],['promotion_visible','Promoção da semana'],['highlights_visible','Destaques'],['benefits_visible','Benefícios'],['newsletter_visible','Novidades']] as const).map(([key, label]) => <label key={key} className="flex items-center gap-3 text-sm text-white/70"><input type="checkbox" checked={draft[key]} onChange={(event) => onFieldChange(key, event.target.checked)} />{label}</label>)}</div></>}<div className="grid gap-4 md:grid-cols-2">{group.fields.map((field) => <Field key={field.key} label={field.label}>{field.multiline ? <textarea required value={String(draft[field.key] ?? "")} onChange={(event) => onFieldChange(field.key, event.target.value)} className="admin-input min-h-20 py-2" /> : <input required value={String(draft[field.key] ?? "")} onChange={(event) => onFieldChange(field.key, event.target.value)} className="admin-input" />}</Field>)}</div></fieldset>)}{error && <ErrorText message={error} />}<div><Button disabled={saving} className="bg-[#82ffc5] text-black hover:bg-white">{saving ? <Loader2 className="mr-2 animate-spin" size={16} /> : <Save className="mr-2" size={16} />}SALVAR VITRINE</Button></div></form>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-1.5 text-sm text-white/70"><span>{label}</span>{children}</label>; }
function SectionHeading({ eyebrow, title, icon, description }: { eyebrow: string; title: string; icon: ReactNode; description?: string }) { return <div><div className="flex items-center gap-2 text-[#82ffc5]"><span>{icon}</span><p className="text-xs font-bold tracking-[.18em]">{eyebrow}</p></div><h2 className="mt-2 font-display text-2xl">{title}</h2>{description && <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">{description}</p>}</div>; }
function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><div className="flex items-center gap-3 text-[#82ffc5]">{icon}<p className="text-xs font-bold tracking-[.16em]">{label}</p></div><p className="mt-4 font-display text-4xl">{value}</p></div>; }
function Empty({ message }: { message: string }) { return <p className="p-6 text-sm text-white/50">{message}</p>; }
function ErrorText({ message }: { message: string }) { return <div className="m-5 flex items-start gap-3 rounded-xl border border-red-300/20 bg-red-300/[.06] p-4 text-sm text-red-100"><ShieldAlert className="shrink-0" size={17} />{message}</div>; }
