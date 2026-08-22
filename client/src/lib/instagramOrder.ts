import type { CartItem } from "@/contexts/StoreContext";
import { toMoney } from "@/lib/catalog";

export const INSTAGRAM_HANDLE = "iagomodas9";
const INSTAGRAM_HANDLE_PATTERN = /^[a-zA-Z0-9._]{1,30}$/;
const WHATSAPP_NUMBER_PATTERN = /^[1-9]\d{7,14}$/;

/** Aceita somente o formato de usuário do Instagram e usa o canal oficial como fallback seguro. */
const normalizeInstagramHandle = (handle = INSTAGRAM_HANDLE) => {
  const normalized = handle.trim().replace(/^@+/, "");
  return INSTAGRAM_HANDLE_PATTERN.test(normalized) ? normalized : INSTAGRAM_HANDLE;
};

/** Mantém somente números compatíveis com o limite internacional do WhatsApp (E.164). */
const normalizeWhatsAppNumber = (number: string) => {
  const normalized = number.replace(/\D/g, "");
  return WHATSAPP_NUMBER_PATTERN.test(normalized) ? normalized : "";
};
export const instagramDirectUrl = `https://ig.me/m/${INSTAGRAM_HANDLE}`;
/** Mantido como alias público do link oficial da conversa da loja. */
export const instagramAppUrl = instagramDirectUrl;
export const instagramProfileUrl = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

export function getInstagramDirectUrl(handle = INSTAGRAM_HANDLE) {
  return `https://ig.me/m/${normalizeInstagramHandle(handle)}`;
}

/**
 * Cria um Intent Android com pacote explícito. O gesto do cliente abre o Instagram
 * instalado; caso o aparelho não tenha o aplicativo ou não resolva o Intent, o
 * Chrome usa a conversa oficial ig.me como fallback sem perder o destino da loja.
 */
export function getInstagramAndroidIntentUrl(handle = INSTAGRAM_HANDLE) {
  const normalized = normalizeInstagramHandle(handle);
  const fallback = encodeURIComponent(getInstagramDirectUrl(normalized));
  return `intent://ig.me/m/${normalized}#Intent;scheme=https;package=com.instagram.android;S.browser_fallback_url=${fallback};end`;
}

export const instagramAndroidIntentUrl = getInstagramAndroidIntentUrl();

export type OrderDeliveryKind = "pickup" | "local" | "outside";

export type OrderDeliveryAddress = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
};

export function formatOrderDeliveryAddress(address: OrderDeliveryAddress) {
  const streetLine = [address.street.trim(), address.number.trim()].filter(Boolean).join(", ");
  const cityLine = [address.city.trim(), address.state.trim()].filter(Boolean).join("/");
  return [
    streetLine,
    address.complement.trim(),
    address.district.trim(),
    cityLine,
    address.cep.trim() ? `CEP ${address.cep.trim()}` : "",
  ].filter(Boolean).join(" — ");
}

export function formatOrderDeliveryDetails({
  deliveryKind,
  localPickupOption,
  localDeliveryOption,
  outsideDeliveryNotice,
  supportChannelLabel,
  address,
}: {
  deliveryKind: OrderDeliveryKind;
  localPickupOption: string;
  localDeliveryOption: string;
  outsideDeliveryNotice: string;
  supportChannelLabel: string;
  address: OrderDeliveryAddress;
}) {
  const deliveryAddress = formatOrderDeliveryAddress(address);

  if (deliveryKind === "pickup") {
    return `Recebimento: ${localPickupOption} (combinar pelo ${supportChannelLabel})`;
  }

  if (deliveryKind === "local") {
    return [
      `Recebimento: ${localDeliveryOption} (combinar pelo ${supportChannelLabel})`,
      `Endereço de entrega: ${deliveryAddress || "a confirmar pelo atendimento."}`,
    ].join("\n");
  }

  return [
    "Recebimento: Correios",
    `Endereço de entrega: ${deliveryAddress || "a confirmar pelo atendimento."}`,
    `Frete: ${outsideDeliveryNotice}`,
  ].join("\n");
}

export function formatPixPayment(pixKey: string, supportChannelLabel: string) {
  return `Pix: ${pixKey}\nEnvie o comprovante pelo ${supportChannelLabel}.`;
}

function isAndroid(userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent) {
  return /Android/i.test(userAgent);
}

/**
 * O link oficial ig.me aponta para a conversa da conta da loja. Ele permite que o
 * sistema decida entre o aplicativo instalado e a versão web sem trocar a conversa
 * direta por uma abertura genérica do Instagram.
 */
export function getInstagramOpenUrl(handle = INSTAGRAM_HANDLE, userAgent?: string) {
  void userAgent;
  return getInstagramDirectUrl(handle);
}

/** Abre a conversa da conta oficial, priorizando o app no Android quando instalado. */
export function openInstagramApp(handle = INSTAGRAM_HANDLE) {
  if (typeof window === "undefined") return;
  window.location.assign(getInstagramOpenUrl(handle));
}

export function openWhatsAppChat(number: string, message = "Olá, vim pelo site da IAGO MODAS.") {
  if (typeof window === "undefined") return;
  const phone = normalizeWhatsAppNumber(number);
  if (!phone) return;
  window.location.assign(getWhatsAppChatUrl(phone, message));
}

export function getWhatsAppChatUrl(number: string, message = "Olá, vim pelo site da IAGO MODAS.") {
  const phone = normalizeWhatsAppNumber(number);
  return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : "";
}

export function formatInstagramOrder(cart: CartItem[], subtotal: number, deliveryKind: OrderDeliveryKind = "outside") {
  const items = cart
    .map((item, index) => `${index + 1}. ${item.name}\n   Tam.: ${item.size} | Qtd.: ${item.quantity} | ${toMoney(item.price * item.quantity)}`)
    .join("\n");
  const isOutsideDelivery = deliveryKind === "outside";

  return [
    "Olá, IAGO MODAS! Vim pelo site e quero finalizar este pedido:",
    "",
    items,
    "",
    `Subtotal dos produtos: ${toMoney(subtotal)}`,
    isOutsideDelivery ? "Frete: a combinar" : "Frete: não se aplica para retirada ou entrega local",
    "",
    isOutsideDelivery ? "Aguardo a confirmação de disponibilidade, frete e Pix. Obrigado!" : "Aguardo a confirmação de disponibilidade e Pix. Obrigado!",
  ].join("\n");
}
