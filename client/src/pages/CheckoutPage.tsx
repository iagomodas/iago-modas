import { useStore } from "@/contexts/StoreContext";
import { useCatalog } from "@/hooks/useCatalog";
import { useStorefrontSettings } from "@/hooks/useStorefrontSettings";
import { toMoney } from "@/lib/catalog";
import { formatInstagramOrder, formatOrderDeliveryDetails, formatPixPayment, getInstagramOpenUrl, getWhatsAppChatUrl, openInstagramApp, openWhatsAppChat } from "@/lib/instagramOrder";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Banknote, Check, Clipboard, CreditCard, ExternalLink, Info, ShoppingBag } from "lucide-react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";

type RegisteredOrder = { number?: string; channel: "instagram"; paymentMethod: "pix" | "cash" | "credit"; summary: string; cartFingerprint: string };

const REGISTERED_ORDER_STORAGE_KEY = "iago-registered-order";
const CHECKOUT_REQUEST_TOKEN_STORAGE_KEY = "iago-checkout-request-token";

function getCartFingerprint(cart: Array<{ id: number; size: string; quantity: number }>) {
  return cart.map((item) => `${item.id}:${item.size}:${item.quantity}`).sort().join("|");
}

function readRegisteredOrder(cartFingerprint: string, hasCart: boolean): RegisteredOrder | null {
  try {
    const raw = window.sessionStorage.getItem(REGISTERED_ORDER_STORAGE_KEY);
    if (!raw) return null;
    const order = JSON.parse(raw) as RegisteredOrder;
    if (hasCart) {
      window.sessionStorage.removeItem(REGISTERED_ORDER_STORAGE_KEY);
      return null;
    }
    return order;
  } catch {
    return null;
  }
}

function createCheckoutRequestToken(cartFingerprint: string) {
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_REQUEST_TOKEN_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) as { cartFingerprint?: string; token?: string } : null;
    if (existing?.cartFingerprint === cartFingerprint && existing.token) return existing.token;
    const token = crypto.randomUUID();
    window.sessionStorage.setItem(CHECKOUT_REQUEST_TOKEN_STORAGE_KEY, JSON.stringify({ cartFingerprint, token }));
    return token;
  } catch {
    return `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

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
  const { cart, clearCart, subtotal } = useStore();
  const cartFingerprint = getCartFingerprint(cart);
  const { products: publishedProducts, isLoading: isCatalogLoading } = useCatalog();
  const { settings } = useStorefrontSettings();
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [profileState, setProfileState] = useState<"checking" | "missing" | "ready">("checking");
  const [deliveryKind, setDeliveryKind] = useState<"local_pickup" | "city_delivery" | "outside">("local_pickup");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cash" | "credit" | "mercado_pago" | null>(null);
  const [address, setAddress] = useState({ cep: "", street: "", number: "", complement: "", district: "", city: "", state: "" });
  const [profilePhone, setProfilePhone] = useState("");
  const [installments, setInstallments] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [registeredOrder, setRegisteredOrder] = useState<RegisteredOrder | null>(() => readRegisteredOrder(cartFingerprint, cart.length > 0));
  const [requestToken] = useState(() => createCheckoutRequestToken(cartFingerprint));
  const submitLockRef = useRef(false);
  const localAreaLabel = `${settings.local_city} — ${settings.local_state}`;
  const localPickupOption = `${settings.local_pickup_label} ${localAreaLabel}`;
  const localDeliveryOption = `${settings.local_delivery_label} ${localAreaLabel}`;
  type ContactChannel = "instagram" | "whatsapp";
  const supportChannelLabel = settings.whatsapp_enabled && settings.whatsapp_number && !settings.instagram_enabled
    ? "WhatsApp"
    : settings.instagram_enabled && !(settings.whatsapp_enabled && settings.whatsapp_number)
      ? "Instagram"
      : "atendimento";
  const automaticPaymentEnabled = settings.future_payment_provider === "mercado_pago" && settings.future_payments_enabled && settings.future_webhook_enabled;

  useEffect(() => {
    if (registeredOrder) window.sessionStorage.setItem(REGISTERED_ORDER_STORAGE_KEY, JSON.stringify(registeredOrder));
  }, [registeredOrder]);

  useEffect(() => {
    if (deliveryKind === "local_pickup" && !settings.local_pickup_enabled) setDeliveryKind(settings.local_delivery_enabled ? "city_delivery" : "outside");
    if (deliveryKind === "city_delivery" && !settings.local_delivery_enabled) setDeliveryKind(settings.local_pickup_enabled ? "local_pickup" : "outside");
  }, [deliveryKind, settings.local_delivery_enabled, settings.local_pickup_enabled]);

  useEffect(() => {
    if (deliveryKind === "outside" && (paymentMethod === "cash" || paymentMethod === "credit")) setPaymentMethod(null);
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
    const orderDeliveryKind = deliveryKind === "outside" ? "outside" : deliveryKind === "city_delivery" ? "local" : "pickup";
    const delivery = formatOrderDeliveryDetails({
      deliveryKind: orderDeliveryKind,
      localPickupOption,
      localDeliveryOption,
      outsideDeliveryNotice: settings.outside_delivery_notice,
      supportChannelLabel,
      address,
    });
    const payment = paymentMethod === "pix"
      ? formatPixPayment(settings.pix_key, supportChannelLabel)
        : paymentMethod === "cash"
        ? "Pagamento: Dinheiro em espécie na retirada ou entrega local."
        : paymentMethod === "credit"
          ? `Pagamento: Maquininha — ${installments}x de ${toMoney(subtotal / installments)}. Confirmar as parcelas com a loja no atendimento.`
          : paymentMethod === "mercado_pago"
          ? "Pagamento: checkout protegido do Mercado Pago. A confirmação é automática somente após a notificação oficial do provedor."
          : "Pagamento: forma de pagamento ainda não selecionada.";
    return `${formatInstagramOrder(cart, subtotal, orderDeliveryKind)}\n\nCliente: ${name || "(nome a confirmar)"}\n${delivery}\n${payment}`;
  }, [address, cart, cartFingerprint, deliveryKind, installments, localDeliveryOption, localPickupOption, name, paymentMethod, settings.outside_delivery_notice, settings.pix_key, subtotal, supportChannelLabel]);

  function openConfiguredContact(channel: ContactChannel, orderSummary = summary) {
    if (channel === "whatsapp" && settings.whatsapp_enabled && settings.whatsapp_number) {
      getWhatsAppChatUrl(settings.whatsapp_number, orderSummary);
      openWhatsAppChat(settings.whatsapp_number, orderSummary);
      return;
    }
    if (settings.instagram_enabled) {
      getInstagramOpenUrl(settings.instagram_handle);
      openInstagramApp(settings.instagram_handle);
    }
  }

  async function copyPixKey() {
    try {
      await copyText(settings.pix_key);
      setMessage("Chave Pix copiada. Faça o pagamento no seu banco e envie o comprovante pelo atendimento para a confirmação manual.");
    } catch {
      setMessage("Não foi possível copiar a chave Pix automaticamente. Selecione a chave exibida e copie pelo seu aparelho.");
    }
  }

  async function copyOrderMessage() {
    try {
      await copyText(registeredOrder?.summary ?? summary);
      setMessage("Mensagem do pedido copiada. Volte para o Direct da IAGO MODAS, cole e toque em Enviar.");
    } catch {
      setMessage("Não foi possível copiar automaticamente. Selecione a mensagem do pedido e copie pelo seu aparelho antes de enviá-la no Direct.");
    }
  }

  async function submit(contactChannel: ContactChannel | null) {
    const contactName = contactChannel === "whatsapp" ? "WhatsApp" : contactChannel === "instagram" ? "Instagram" : "atendimento";
    if (submitting || submitLockRef.current || registeredOrder) {
      setMessage("Este pedido já foi registrado. Use os botões abaixo para copiar a mensagem ou abrir o atendimento, sem criar outro pedido.");
      return;
    }
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
      setMessage("Escolha uma forma de pagamento antes de finalizar o pedido.");
      return;
    }
    if (paymentMethod === "mercado_pago") {
      setMessage("Use o botão PAGAR COM MERCADO PAGO para abrir o checkout protegido.");
      return;
    }
    const selectedPaymentMethod = paymentMethod;
    if (deliveryKind === "outside" && (paymentMethod === "cash" || paymentMethod === "credit")) {
      setMessage(`Para pedidos de outra cidade, escolha Pix após combinar o frete pelo ${supportChannelLabel}.`);
      return;
    }
    if (isCatalogLoading) {
      setMessage("Aguarde enquanto a loja confirma os produtos publicados.");
      return;
    }
    if (contactChannel && typeof window !== "undefined" && !window.confirm(`Confirmar o pedido e abrir o atendimento pelo ${contactName}?`)) {
      setMessage("Pedido não enviado. Confirme quando quiser para abrir o atendimento.");
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
      return;
    }
    if (!supabase) {
      setMessage("O pedido não pode ser registrado agora. Tente novamente mais tarde.");
      return;
    }

    submitLockRef.current = true;
    try {
      setSubmitting(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user?.email) throw new Error("Entre com Google para registrar o pedido.");
      const { data, error } = await supabase.rpc("create_manual_delivery_order_once" as never, {
        p_request_token: requestToken,
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
        p_payment_method: selectedPaymentMethod,
        p_items: cart.map((item) => ({ productId: item.id, size: item.size, quantity: item.quantity })),
      } as never);
      if (error) throw error;
      const registeredSummary = summary;
      const number = Array.isArray(data) ? (data[0] as { order_number?: string })?.order_number : undefined;
      setRegisteredOrder({ number, channel: "instagram", paymentMethod: selectedPaymentMethod as "pix" | "cash" | "credit", summary: registeredSummary, cartFingerprint });
      window.sessionStorage.removeItem(CHECKOUT_REQUEST_TOKEN_STORAGE_KEY);
      clearCart();
      try {
        await copyText(registeredSummary);
        setMessage(`Pedido${number ? ` ${number}` : ""} registrado. O resumo foi copiado; toque em abrir o Instagram quando estiver pronto.`);
      } catch {
        setMessage(`Pedido${number ? ` ${number}` : ""} registrado. O resumo ficou disponível nesta tela para copiar manualmente.`);
      }
    } catch (error) {
      submitLockRef.current = false;
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
    } finally {
      setSubmitting(false);
    }
  }

  async function startAutomaticPayment() {
    if (!automaticPaymentEnabled || paymentMethod !== "mercado_pago") {
      setMessage("O checkout automático ainda não foi liberado pela loja.");
      return;
    }
    if (submitting || submitLockRef.current) return;
    if (profileState !== "ready") {
      setMessage("Entre com Google e informe seu nome completo antes de pagar.");
      window.setTimeout(() => { window.location.hash = "#/perfil"; }, 850);
      return;
    }
    if (!address.cep || !address.street || !address.number || !address.district || !address.city || !address.state) {
      setMessage("Para segurança do pagamento automático, complete o endereço de entrega no seu perfil antes de continuar.");
      window.setTimeout(() => { window.location.hash = "#/perfil"; }, 850);
      return;
    }
    if (!supabase) {
      setMessage("O checkout automático não está disponível agora. Tente novamente mais tarde.");
      return;
    }
    submitLockRef.current = true;
    setSubmitting(true);
    try {
      const fullAddress = `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ""} — ${address.district} — ${address.city}/${address.state}`;
      const { data, error } = await supabase.functions.invoke("future-payment-preference", {
        body: {
          customerName: name.trim(), customerPhone: profilePhone, postalCode: address.cep, address: fullAddress,
          items: cart.map((item) => ({ productId: item.id, size: item.size, quantity: item.quantity })),
        },
      });
      if (error || !data?.checkoutUrl) throw error ?? new Error("Resposta inválida do checkout automático.");
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      submitLockRef.current = false;
      const remoteMessage = typeof error === "object" && error && "message" in error ? String(error.message) : "";
      setMessage(remoteMessage || "Não foi possível abrir o checkout protegido agora. Nenhum pagamento foi confirmado.");
    } finally {
      setSubmitting(false);
    }
  }

  if (registeredOrder) {
    const isInstagramOrder = registeredOrder.channel === "instagram";
    const isPixOrder = registeredOrder.paymentMethod === "pix";
    return <main className="container flex min-h-[65vh] flex-col items-center justify-center py-12 text-center">
      <Check size={35} className="text-[#7affb9]" />
      <p className="eyebrow mt-4">PEDIDO REGISTRADO UMA ÚNICA VEZ</p>
      <h1 className="mt-2 text-2xl font-bold">Pedido{registeredOrder.number ? ` ${registeredOrder.number}` : ""} enviado para a loja</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">O pedido foi enviado para a loja.</p>
      {message && <p role="status" className="mt-3 max-w-lg text-sm text-[#7affb9]">{message}</p>}
      {isPixOrder && <section aria-label="Chave Pix da loja" className="mt-6 w-full max-w-lg rounded-2xl border border-[#7affb9]/40 bg-[#7affb9]/[.08] p-4 text-left">
        <p className="text-sm font-black text-[#7affb9]">CHAVE PIX DA LOJA</p>
        <p className="mt-2 text-xs leading-5 text-white/75">Se o pagamento for por Pix, use a chave abaixo e envie o comprovante para a IAGO MODAS pelo atendimento.</p>
        <p className="mt-3 break-all rounded-xl border border-white/10 bg-black/20 px-3 py-3 font-mono text-sm text-white">{settings.pix_key}</p>
        <button type="button" onClick={() => void copyPixKey()} className="button-primary mt-3 w-full text-xs"><Clipboard size={16} />COPIAR CHAVE PIX</button>
      </section>}
      {isInstagramOrder && <section aria-label="Como enviar o pedido no Instagram" className="mt-6 w-full max-w-lg rounded-2xl border border-[#7affb9]/40 bg-[#7affb9]/[.08] p-4 text-left">
        <p className="text-sm font-black text-[#7affb9]">PRÓXIMO PASSO: ENVIE A MENSAGEM NO DIRECT</p>
        <p className="mt-2 text-xs leading-5 text-white/75">Copie a mensagem e toque no botão para abrir o Instagram; depois, cole no Direct e toque em enviar.</p>
        <button type="button" onClick={() => void copyOrderMessage()} className="button-primary mt-3 w-full text-xs"><Clipboard size={16} />COPIAR MENSAGEM DO PEDIDO</button>
      </section>}
      <button type="button" onClick={() => openConfiguredContact(registeredOrder.channel, registeredOrder.summary)} className={isInstagramOrder ? "button-instagram mt-3" : "button-whatsapp mt-3"}>{isInstagramOrder ? <FaInstagram size={17} /> : <FaWhatsapp size={17} />}{isInstagramOrder ? "ABRIR CONVERSA NO INSTAGRAM" : "ABRIR CONVERSA NO WHATSAPP"}<ExternalLink size={15} /></button>
      <Link href="/" className="button-secondary mt-3">CONTINUAR COMPRANDO</Link>
    </main>;
  }

  if (!cart.length) {
    return <main className="container flex min-h-[65vh] flex-col items-center justify-center py-12 text-center"><ShoppingBag size={35} className="text-[#7affb9]" /><h1 className="mt-4 text-2xl font-bold">Sua sacola está vazia</h1><p className="mt-2 text-sm text-white/55">Adicione produtos para montar seu pedido.</p><Link href="/" className="button-primary mt-6">CONTINUAR COMPRANDO</Link></main>;
  }

  return <main className="container py-8 md:py-12">
    <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-[#7affb9]"><ArrowLeft size={16} />Voltar para a loja</Link>
    <div className="mt-8 grid gap-8 lg:grid-cols-[.92fr_1.08fr] lg:gap-12">
      <section className="order-2 rounded-[1.5rem] border border-white/10 bg-white/[.025] p-5 sm:p-7 lg:order-1">
        <p className="eyebrow">SEU PEDIDO</p>
        <h1 className="mt-2 text-3xl font-black">FINALIZAR PEDIDO</h1>
        <p className="mt-4 text-sm leading-6 text-white/60">A IAGO MODAS envia para todo o Brasil. Primeiro escolha onde vai receber, depois a forma de pagamento e, por fim, envie o pedido pelo atendimento. A loja confirma disponibilidade, frete e pagamento.</p>
        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="rounded-xl border border-white/10 p-3 text-sm"><p className="font-semibold">Nome do pedido</p><p className="mt-1 text-white/60">{profileState === "ready" ? name : "Complete seu cadastro com Google e informe seu nome completo para continuar."}</p><Link href="/perfil" className="mt-2 inline-block text-xs font-bold text-[#7affb9]">REVISAR MEU CADASTRO</Link></div>
          <fieldset><legend className="text-sm font-semibold">Onde você vai receber?</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">{settings.local_pickup_enabled && <label className="rounded-xl border border-white/10 p-3 text-sm"><input type="radio" checked={deliveryKind === "local_pickup"} onChange={() => setDeliveryKind("local_pickup")} className="mr-2 accent-[#7affb9]" />{localPickupOption}</label>}{settings.local_delivery_enabled && <label className="rounded-xl border border-white/10 p-3 text-sm"><input type="radio" checked={deliveryKind === "city_delivery"} onChange={() => setDeliveryKind("city_delivery")} className="mr-2 accent-[#7affb9]" />{localDeliveryOption}</label>}<label className="rounded-xl border border-white/10 p-3 text-sm"><input type="radio" checked={deliveryKind === "outside"} onChange={() => setDeliveryKind("outside")} className="mr-2 accent-[#7affb9]" />{settings.outside_delivery_label}</label></div></fieldset>
          {deliveryKind === "outside" && <div className="grid gap-3 sm:grid-cols-2">{([['cep', 'CEP'], ['street', 'Rua ou avenida'], ['number', 'Número'], ['complement', 'Complemento (opcional)'], ['district', 'Bairro'], ['city', 'Cidade'], ['state', 'UF']] as const).map(([key, label]) => <input key={key} value={address[key]} onChange={(event) => setAddress({ ...address, [key]: key === "state" ? event.target.value.toUpperCase().slice(0, 2) : event.target.value })} placeholder={label} className="field-input" />)}</div>}
          {deliveryKind === "outside" && <p className="text-xs leading-5 text-white/50">{settings.outside_delivery_notice}</p>}
          <fieldset><legend className="text-sm font-semibold">Como você quer pagar?</legend><div className="mt-2 grid gap-2 sm:grid-cols-2"><label className={`payment-option ${paymentMethod === "pix" ? "active" : ""}`}><input type="radio" name="payment-method" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} className="sr-only" /><Clipboard size={18} /><span><strong>Pix</strong><small>Pagamento pelo celular após combinar o pedido.</small></span></label>{deliveryKind !== "outside" && <label className={`payment-option ${paymentMethod === "cash" ? "active" : ""}`}><input type="radio" name="payment-method" checked={paymentMethod === "cash"} onChange={() => setPaymentMethod("cash")} className="sr-only" /><Banknote size={18} /><span><strong>Dinheiro</strong><small>Pagamento em espécie na retirada ou entrega local.</small></span></label>}{deliveryKind !== "outside" && <label className={`payment-option ${paymentMethod === "credit" ? "active" : ""}`}><input type="radio" name="payment-method" checked={paymentMethod === "credit"} onChange={() => setPaymentMethod("credit")} className="sr-only" /><CreditCard size={18} /><span><strong>Maquininha</strong><small>Informe em quantas vezes deseja pagar.</small></span></label>}{automaticPaymentEnabled && <label className={`payment-option ${paymentMethod === "mercado_pago" ? "active" : ""}`}><input type="radio" name="payment-method" checked={paymentMethod === "mercado_pago"} onChange={() => setPaymentMethod("mercado_pago")} className="sr-only" /><CreditCard size={18} /><span><strong>Mercado Pago</strong><small>Checkout protegido; confirmação automática após o retorno oficial.</small></span></label>}</div></fieldset>
          {paymentMethod === "credit" && <div className="rounded-xl border border-[#7affb9]/25 bg-[#7affb9]/[.06] p-3 text-xs leading-5 text-white/75"><label className="flex items-center justify-between gap-3"><span className="font-bold text-[#82ffc5]">Quantas vezes?</span><select value={installments} onChange={event => setInstallments(Number(event.target.value))} className="rounded-lg border border-[#7affb9]/35 bg-black/30 px-3 py-2 font-bold text-white">{Array.from({ length: 12 }, (_, index) => index + 1).map(value => <option key={value} value={value}>{value}x</option>)}</select></label><p className="mt-2">A opção de maquininha e as parcelas serão enviadas no resumo para a loja confirmar.</p></div>}
          {paymentMethod === "pix" && <div className="rounded-xl border border-[#7affb9]/25 bg-[#7affb9]/[.06] p-3 text-xs leading-5 text-white/75"><p>Chave Pix da loja: <strong className="text-[#82ffc5]">{settings.pix_key}</strong>.</p><p className="mt-1">1. Copie a chave. 2. Faça o pagamento no seu banco. 3. Envie o comprovante pelo atendimento para a confirmação manual.</p><button type="button" onClick={() => void copyPixKey()} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#7affb9]/35 px-3 py-2 text-xs font-bold text-[#82ffc5] transition hover:bg-[#7affb9]/10"><Clipboard size={14} />COPIAR CHAVE PIX</button></div>}
          {paymentMethod === "mercado_pago" && <div className="rounded-xl border border-[#7affb9]/25 bg-[#7affb9]/[.06] p-3 text-xs leading-5 text-white/75"><p className="font-bold text-[#82ffc5]">CHECKOUT PROTEGIDO DO MERCADO PAGO</p><p className="mt-1">Você será direcionado para o ambiente oficial do Mercado Pago. A loja só considera o pagamento confirmado após receber a notificação assinada do provedor.</p></div>}
        </div>
        {paymentMethod === "mercado_pago" ? <button disabled={submitting} onClick={() => void startAutomaticPayment()} className="button-primary mt-8 w-full disabled:opacity-60"><CreditCard size={19} />{submitting ? "ABRINDO CHECKOUT..." : "FINALIZAR PEDIDO"}<ExternalLink size={16} /></button> : <button disabled={submitting} onClick={() => void submit(null)} className="button-primary mt-8 w-full disabled:opacity-60"><Check size={19} />{submitting ? "ENVIANDO PEDIDO..." : "FINALIZAR PEDIDO"}</button>}
        {message && <p role="status" className="mt-4 flex gap-2 rounded-xl border border-white/10 bg-white/[.035] p-3 text-xs text-white/65"><Check size={16} className="text-[#7affb9]" />{message}</p>}
      </section>
      <aside className="order-1 h-fit rounded-[1.5rem] border border-white/10 bg-[#11161b] p-5 sm:p-7 lg:order-2"><h2 className="text-lg font-bold">Resumo do pedido</h2><div className="mt-5 divide-y divide-white/10">{cart.map((item) => <div key={`${item.id}-${item.size}`} className="flex gap-3 py-4"><img src={item.image} alt="" className="h-16 w-14 rounded-lg object-cover object-right" /><div className="flex-1"><p className="text-sm font-semibold">{item.name}</p><p className="mt-1 text-xs text-white/45">Tam. {item.size} · Qtd. {item.quantity}</p></div><strong className="text-sm">{toMoney(item.price * item.quantity)}</strong></div>)}</div><div className="mt-5 border-t border-white/10 pt-5"><div className="flex justify-between text-sm text-white/55"><span>Subtotal dos produtos</span><span>{toMoney(subtotal)}</span></div><div className="mt-3 flex justify-between text-sm text-white/55"><span>Frete</span><span>{deliveryKind === "outside" ? "A combinar" : "Não se aplica"}</span></div><div className="mt-5 flex justify-between text-lg font-bold"><span>Total inicial</span><span>{toMoney(subtotal)}</span></div></div>{deliveryKind === "outside" && <div className="mt-6 flex gap-2 rounded-xl bg-white/[.035] p-3 text-xs leading-5 text-white/50"><Info size={15} className="text-[#7affb9]" />{settings.outside_delivery_notice}</div>}<pre className="mt-5 max-h-52 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 font-sans text-xs leading-5 text-white/60">{summary}</pre></aside>
    </div>
  </main>;
}
