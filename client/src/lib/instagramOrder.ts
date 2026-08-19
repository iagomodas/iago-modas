import type { CartItem } from "@/contexts/StoreContext";
import { toMoney } from "@/lib/catalog";

export const INSTAGRAM_HANDLE = "iagomodas9";
const normalizeInstagramHandle = (handle = INSTAGRAM_HANDLE) => handle.trim().replace(/^@/, "") || INSTAGRAM_HANDLE;
const normalizeWhatsAppNumber = (number: string) => number.replace(/\D/g, "");
export const instagramAppUrl = `instagram://direct?username=${INSTAGRAM_HANDLE}`;
export const instagramAndroidIntentUrl = `intent://direct?username=${INSTAGRAM_HANDLE}#Intent;scheme=instagram;package=com.instagram.android;end`;
export const instagramDirectUrl = `https://ig.me/m/${INSTAGRAM_HANDLE}`;
export const instagramProfileUrl = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

export function getInstagramDirectUrl(handle = INSTAGRAM_HANDLE) {
  return `https://ig.me/m/${normalizeInstagramHandle(handle)}`;
}

/** Retorna o link mais adequado para o aparelho atual, inclusive para uma tentativa manual do cliente. */
export function getInstagramOpenUrl(handle = INSTAGRAM_HANDLE) {
  const username = normalizeInstagramHandle(handle);
  const directUrl = getInstagramDirectUrl(username);
  if (typeof navigator === "undefined") return directUrl;
  if (/Android/i.test(navigator.userAgent)) return `intent://direct?username=${username}#Intent;scheme=instagram;package=com.instagram.android;end`;
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return `instagram://direct?username=${username}`;
  return directUrl;
}

/** Tenta abrir a conversa direta no aplicativo e usa o link web se o app não responder. */
export function openInstagramApp(handle = INSTAGRAM_HANDLE) {
  if (typeof window === "undefined") return;
  const username = normalizeInstagramHandle(handle);
  const directUrl = `https://ig.me/m/${username}`;

  let fallbackTimer: number | undefined;
  const clearFallback = () => {
    if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
    document.removeEventListener("visibilitychange", clearFallback);
  };

  document.addEventListener("visibilitychange", clearFallback, { once: true });
  fallbackTimer = window.setTimeout(() => {
    if (document.visibilityState === "visible") {
      window.location.assign(directUrl);
    }
    document.removeEventListener("visibilitychange", clearFallback);
  }, 900);

  const target = getInstagramOpenUrl(username);
  if (target === directUrl) window.location.assign(target);
  else window.location.href = target;
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

export function formatInstagramOrder(cart: CartItem[], subtotal: number) {
  const items = cart
    .map((item, index) => `${index + 1}. ${item.name}\n   Tam.: ${item.size} | Qtd.: ${item.quantity} | ${toMoney(item.price * item.quantity)}`)
    .join("\n");

  return [
    "Olá, IAGO MODAS! Vim pelo site e quero finalizar este pedido:",
    "",
    items,
    "",
    `Subtotal dos produtos: ${toMoney(subtotal)}`,
    "Frete: a combinar",
    "",
    "Aguardo a confirmação de disponibilidade, frete e Pix. Obrigado!",
  ].join("\n");
}
