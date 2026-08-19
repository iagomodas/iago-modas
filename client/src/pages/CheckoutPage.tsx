import { useStore } from "@/contexts/StoreContext";
import { useCatalog } from "@/hooks/useCatalog";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";
import { toMoney } from "@/lib/catalog";
import { formatInstagramOrder, getInstagramOpenUrl, getWhatsAppChatUrl, openInstagramApp, openWhatsAppChat } from "@/lib/instagramOrder";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Banknote, Check, Clipboard, ExternalLink, Info, ShoppingBag } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const element = document.createElement("textarea");
  element.value = text;
  element.style.position = "fixed";
  element.style.opacity = "0";
  document.body.appendChild(element);
  element.select();
  const copied = document.execCommand("copy");
  element.remove();
  if (!copied) throw new Error("Não foi possível copiar o pedido");
}

function orderErrorMessage(error: unknown) {
  const raw = error instanceof Error
    ? error.message
    : typeof error === "object" && error && "message" in error && typeof error.message === "string"
      ? error.message
      : "";

  if (/produto.*(não está disponível|indisponível)|quantidade.*(não está disponível|estoque)/i.test(raw)) {
    return "Este modelo ainda não está cadastrado ou não está disponível no painel da loja.";
  }
  if (/dados do cliente inválidos/i.test(raw)) return "Revise os dados do seu perfil antes de enviar o pedido.";
  if (/entrar com google/i.test(raw)) return "Entre com Google antes de enviar o pedido.";
  return "Não foi possível salvar este pedido no painel agora.";
}

export default function CheckoutPage() {
  const { cart, subtotal } = useStore();
  const { products: publishedProducts, isLoading: isCatalogLoading } = useCatalog();
  const { settings } = useStorefrontSettings();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [profileState, setProfileState] = useState<"checking" | "missing" | "ready">("checking");
  const [deliveryKind, setDeliveryKind] = useState<"local_pickup" | "city_delivery" | "outside">("local_pickup");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cash" | null>(null);
  const [address, setAddress] = useState({ cep: "", street: "", number: "", complement: "", district: "", city: "", state: "" });
  const [profilePhone, setProfilePhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [contactRetryHref, setContactRetryHref] = useState<string | null>(null);
  const localAreaLabel = `${settings.local_city} — ${settings.local_state}`;
  const localPickupOption = `${settings.local_pickup_label} ${localAreaLabel}`;
  const localDeliveryOption = `${settings.local_delivery_label} ${localAreaLabel}`;
  type ContactChannel = "instagram" | "whatsapp";

  useEffect(() => {
    if (deliveryKind === "local_pickup" && !settings.local_pickup_enabled) setDeliveryKind(settings.local_delivery_enabled ? "city_delivery" : "outside");
    if (deliveryKind === "city_delivery" && !settings.local_delivery_enabled) setDeliveryKind(settings.local_pickup_enabled ? "local_pickup" : "outside");
  }, [deliveryKind, settings.local_delivery_enabled, settings.local_pickup_enabled]);

  useEffect(() => {
    if (deliveryKind === "outside" && paymentMethod === "cash") setPaymentMethod(null);
  }, [deliveryKind, paymentMethod]);

  useEffect(() => {
    void (async () => {
      if (!supabase) return setProfileState("missing");
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return setProfileState("missing");
      const { data } = await supabase.from("profiles").select("display_name, delivery_phone, delivery_postal_code, delivery_street, delivery_number, delivery_complement, delivery_district, delivery_city, delivery_state").eq("id", auth.user.id).maybeSingle();
      if (data?.display_name?.trim()) {
        setName(data.display_name);
        setProfilePhone(data.delivery_phone ?? "");
        setAddress({
          cep: data.delivery_postal_code ?? "",
          street: data.delivery_street ?? "",
          number: data.delivery_number ?? "",
          complement: data.delivery_complement ?? "",
          district: data.delivery_district ?? "",
          city: data.delivery_city ?? "",
          state: data.delivery_state ?? "",
        });
        setProfileState("ready");
      } else {
        setProfileState("missing");
      }
    })();
  }, []);

  const summary = useMemo(() => {
    const delivery = deliveryKind === "local_pickup"
      ? `Recebimento: ${localPickupOption} (combinar pelo Instagram)`
      : deliveryKind === "city_delivery"
        ? `Recebimento: ${localDeliveryOption} (combinar pelo Instagram)`
        : `Correios: ${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ""} — ${address.district} — ${address.city}/${address.state} — CEP ${address.cep}\nFrete: ${settings.outside_delivery_notice}`;
    const payment = paymentMethod === "pix"
      ? `Pagamento: Pix — chave ${settings.pix_key}. Enviarei o comprovante pelo Instagram.`
      : paymentMethod === "cash"
        ? "Pagamento: Dinheiro em espécie na retirada ou entrega local."
        : "Pagamento: forma de pagamento ainda não selecionada.";
    return `${formatInstagramOrder(cart, subtotal)}\n\nCliente: ${name || "(nome a confirmar)"}\n${delivery}\n${payment}`;
  }, [address, cart, deliveryKind, localDeliveryOption, localPickupOption, name, paymentMethod, settings.outside_delivery_notice, settings.pix_key, subtotal]);

  function openConfiguredContact(channel: ContactChannel) {
    if (channel === "whatsapp" && settings.whatsapp_enabled && settings.whatsapp_number) {
      setContactRetryHref(getWhatsAppChatUrl(settings.whatsapp_number, summary));
      openWhatsAppChat(settings.whatsapp_number, summary);
      return;
    }
    if (settings.instagram_enabled) {
      setContactRetryHref(getInstagramOpenUrl(settings.instagram_handle));
      openInstagramApp(settings.instagram_handle);
    }
  }

  async function submit(contactChannel: ContactChannel | null) {
    const contactName = contactChannel === "whatsapp" ? "WhatsApp" : "Instagram";
    if (profileState !== "ready") {
      setMessage("Entre com Google e informe seu nome completo antes de enviar o pedido.");
      window.setTimeout(() => { window.location.hash = "#/perfil"; }, 850);
      return;
    }
    if (deliveryKind === "outside" && (!address.cep || !address.street || !address.number || !address.district || !address.city || !address.state)) {
      setMessage("Complete o endereço para pedidos enviados pelos Correios.");
      return;
    }
    if (!paymentMethod) {
      setMessage("Escolha Pix ou dinheiro antes de finalizar o pedido.");
      return;
    }
    if (deliveryKind === "outside" && paymentMethod === "cash") {
      setMessage("Para pedidos de outra cidade, escolha Pix após combinar o frete pelo Instagram.");
      return;
    }
    if (isCatalogLoading) {
      setMessage("Aguarde enquanto a loja confirma os produtos publicados.");
      return;
    }
    const hasUnpublishedCartItem = cart.some((item) => !publishedProducts.some((product) => product.id === item.id));
    if (hasUnpublishedCartItem) {
      let copied = false;
      try {
        await copyText(summary);
        copied = true;
      } catch {
        // O resumo continua visível abaixo quando a cópia não for permitida.
      }
      setMessage(`Um item do seu carrinho ainda não está publicado pela loja. ${copied ? `O resumo foi copiado; confirme a disponibilidade pelo ${contactName}.` : `Confirme a disponibilidade pelo ${contactName} usando o resumo abaixo.`}`);
      if (contactChannel) {
        openConfiguredContact(contactChannel);
      }
      return;
    }
    if (!supabase) {
      setMessage("O pedido não pode ser registrado agora. Tente novamente mais tarde.");
      return;
    }

    try {
      setSubmitting(true);
      setContactRetryHref(null);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user?.email) throw new Error("Entre com Google para registrar o pedido.");
      const { data, error } = await supabase.rpc("create_manual_delivery_order" as never, {
        p_customer_name: name.trim(),
        p_customer_email: auth.user.email,
        p_customer_phone: profilePhone,
        p_delivery_mode: deliveryKind === "local_pickup" ? "local" : deliveryKind === "city_delivery" ? "city_delivery" : "correios",
        p_postal_code: address.cep,
        p_address: address.street,
        p_delivery_number: address.number,
        p_delivery_complement: address.complement,
        p_delivery_neighborhood: address.district,
        p_delivery_city: address.city,
        p_delivery_state: address.state,
        p_payment_method: paymentMethod,
        p_items: cart.map((item) => ({ productId: item.id, size: item.size, quantity: item.quantity })),
      } as never);
      if (error) throw error;
      await copyText(summary);
      const number = Array.isArray(data) ? (data[0] as { order_number?: string })?.order_number : undefined;
      setMessage(`Pedido${number ? ` ${number}` : ""} registrado. O resumo foi copiado; no ${contactName}, cole e envie.`);
      if (contactChannel) openConfiguredContact(contactChannel);
    } catch (error) {
      let copied = false;
      try {
        await copyText(summary);
        copied = true;
      } catch {
        // O botão de tentativa manual continua disponível quando a cópia não for permitida pelo navegador.
      }
      const recovery = copied
        ? ` O resumo foi copiado; envie-o para a loja pelo ${contactName}.`
        : ` Use o resumo exibido abaixo ao falar com a loja pelo ${contactName}.`;
      setMessage(`${orderErrorMessage(error)}${recovery}`);
      if (contactChannel) {
        openConfiguredContact(contactChannel);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart.length) {
    return <main className="container flex min-h-[65vh] flex-col items-center justify-center py-12 text-center"><ShoppingBag size={35} className="text-[#7affb9]" /><h1 className="mt-4 text-2xl font-bold">Sua sacola está vazia</h1><p className="mt-2 text-sm text-white/55">Adicione produtos para montar seu pedido.</p><Link href="/" className="button-primary mt-6">CONTINUAR COMPRANDO</Link></main>;
  }

  return <main className="container py-8 md:py-12">
    <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-[#7affb9]"><ArrowLeft size={16} />Voltar para a loja</Link>
    <div className="mt-8 grid gap-8 lg:grid-cols-[.92fr_1.08fr] lg:gap-12">
      <section className="rounded-[1.5rem] border border-white/10 bg-white/[.025] p-5 sm:p-7">
        <p className="eyebrow">PEDIDO PELO INSTAGRAM</p>
        <h1 className="mt-2 text-3xl font-black">FINALIZAR PEDIDO</h1>
        <p className="mt-4 text-sm leading-6 text-white/60">A IAGO MODAS envia para todo o Brasil. A loja confirma disponibilidade, frete e pagamento diretamente no Instagram.</p>
        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="rounded-xl border border-white/10 p-3 text-sm"><p className="font-semibold">Nome do pedido</p><p className="mt-1 text-white/60">{profileState === "ready" ? name : "Complete seu cadastro com Google e informe seu nome completo para continuar."}</p><Link href="/perfil" className="mt-2 inline-block text-xs font-bold text-[#7affb9]">REVISAR MEU CADASTRO</Link></div>
          <fieldset><legend className="text-sm font-semibold">Onde você vai receber?</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">{settings.local_pickup_enabled && <label className="rounded-xl border border-white/10 p-3 text-sm"><input type="radio" checked={deliveryKind === "local_pickup"} onChange={() => setDeliveryKind("local_pickup")} className="mr-2 accent-[#7affb9]" />{localPickupOption}</label>}{settings.local_delivery_enabled && <label className="rounded-xl border border-white/10 p-3 text-sm"><input type="radio" checked={deliveryKind === "city_delivery"} onChange={() => setDeliveryKind("city_delivery")} className="mr-2 accent-[#7affb9]" />{localDeliveryOption}</label>}<label className="rounded-xl border border-white/10 p-3 text-sm"><input type="radio" checked={deliveryKind === "outside"} onChange={() => setDeliveryKind("outside")} className="mr-2 accent-[#7affb9]" />{settings.outside_delivery_label}</label></div></fieldset>
          {deliveryKind === "outside" && <div className="grid gap-3 sm:grid-cols-2">{([['cep', 'CEP'], ['street', 'Rua ou avenida'], ['number', 'Número'], ['complement', 'Complemento (opcional)'], ['district', 'Bairro'], ['city', 'Cidade'], ['state', 'UF']] as const).map(([key, label]) => <input key={key} value={address[key]} onChange={(event) => setAddress({ ...address, [key]: key === "state" ? event.target.value.toUpperCase().slice(0, 2) : event.target.value })} placeholder={label} className="field" />)}</div>}
          <p className="text-xs leading-5 text-white/50">{settings.outside_delivery_notice}</p>
          <fieldset><legend className="text-sm font-semibold">Como você quer pagar?</legend><div className="mt-2 grid gap-2 sm:grid-cols-2"><label className={`payment-option ${paymentMethod === "pix" ? "active" : ""}`}><input type="radio" name="payment-method" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} className="sr-only" /><Clipboard size={18} /><span><strong>Pix</strong><small>Pagamento pelo celular após combinar o pedido.</small></span></label>{deliveryKind !== "outside" && <label className={`payment-option ${paymentMethod === "cash" ? "active" : ""}`}><input type="radio" name="payment-method" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} className="sr-only" /><Banknote size={18} /><span><strong>Dinheiro</strong><small>Pagamento em espécie na retirada ou entrega local.</small></span></label>}</div></fieldset>
          {paymentMethod === "pix" && <p className="rounded-xl border border-[#7affb9]/25 bg-[#7affb9]/[.06] p-3 text-xs leading-5 text-white/75">Chave Pix da loja: <strong className="text-[#82ffc5]">{settings.pix_key}</strong>. Após pagar, envie o comprovante pelo Instagram para confirmação manual.</p>}
        </div>
        {settings.instagram_enabled && <button disabled={submitting} onClick={() => void submit("instagram")} className="button-instagram mt-8 w-full disabled:opacity-60"><FaInstagram size={19} />{submitting ? "REGISTRANDO..." : "ENVIAR PEDIDO E ABRIR INSTAGRAM"}<ExternalLink size={16} /></button>}
        {settings.whatsapp_enabled && settings.whatsapp_number && <button disabled={submitting} onClick={() => void submit("whatsapp")} className="button-secondary mt-3 w-full border-[#37d67a]/40 text-[#63e998] disabled:opacity-60"><FaWhatsapp size={19} />{submitting ? "REGISTRANDO..." : "ENVIAR PEDIDO E ABRIR WHATSAPP"}<ExternalLink size={16} /></button>}
        {contactRetryHref && <a href={contactRetryHref} className="button-secondary mt-3 w-full"><ExternalLink size={16} />TENTAR ABRIR O ATENDIMENTO NOVAMENTE</a>}
        <button disabled={submitting} onClick={() => void submit(null)} className="button-secondary mt-3 w-full"><Clipboard size={16} />REGISTRAR E COPIAR RESUMO</button>
        {message && <p role="status" className="mt-4 flex gap-2 rounded-xl border border-white/10 bg-white/[.035] p-3 text-xs text-white/65"><Check size={16} className="text-[#7affb9]" />{message}</p>}
      </section>
      <aside className="h-fit rounded-[1.5rem] border border-white/10 bg-[#11161b] p-5 sm:p-7"><h2 className="text-lg font-bold">Resumo do pedido</h2><div className="mt-5 divide-y divide-white/10">{cart.map((item) => <div key={`${item.id}-${item.size}`} className="flex gap-3 py-4"><img src={item.image} alt="" className="h-16 w-14 rounded-lg object-cover object-right" /><div className="flex-1"><p className="text-sm font-semibold">{item.name}</p><p className="mt-1 text-xs text-white/45">Tam. {item.size} · Qtd. {item.quantity}</p></div><strong className="text-sm">{toMoney(item.price * item.quantity)}</strong></div>)}</div><div className="mt-5 border-t border-white/10 pt-5"><div className="flex justify-between text-sm text-white/55"><span>Subtotal dos produtos</span><span>{toMoney(subtotal)}</span></div><div className="mt-3 flex justify-between text-sm text-white/55"><span>Frete</span><span>A combinar</span></div><div className="mt-5 flex justify-between text-lg font-bold"><span>Total inicial</span><span>{toMoney(subtotal)}</span></div></div><div className="mt-6 flex gap-2 rounded-xl bg-white/[.035] p-3 text-xs leading-5 text-white/50"><Info size={15} className="text-[#7affb9]" />{settings.outside_delivery_notice}</div><pre className="mt-5 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 font-sans text-xs leading-5 text-white/60">{summary}</pre></aside>
    </div>
  </main>;
}
