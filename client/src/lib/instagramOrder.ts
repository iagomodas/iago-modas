import type { CartItem } from "@/contexts/StoreContext";
import { toMoney } from "@/lib/catalog";

export const INSTAGRAM_HANDLE = "overziedmodas9";
export const instagramAppUrl = `instagram://direct?username=${INSTAGRAM_HANDLE}`;
export const instagramAndroidIntentUrl = `intent://direct?username=${INSTAGRAM_HANDLE}#Intent;scheme=instagram;package=com.instagram.android;end`;
export const instagramDirectUrl = `https://ig.me/m/${INSTAGRAM_HANDLE}`;
export const instagramProfileUrl = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

/** Tenta abrir a conversa direta no aplicativo e usa o link web se o app não responder. */
export function openInstagramApp() {
  if (typeof window === "undefined") return;

  let fallbackTimer: number | undefined;
  const clearFallback = () => {
    if (fallbackTimer !== undefined) window.clearTimeout(fallbackTimer);
    document.removeEventListener("visibilitychange", clearFallback);
  };

  document.addEventListener("visibilitychange", clearFallback, { once: true });
  fallbackTimer = window.setTimeout(() => {
    if (document.visibilityState === "visible") {
      window.location.assign(instagramDirectUrl);
    }
    document.removeEventListener("visibilitychange", clearFallback);
  }, 900);

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isAppleMobile = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isAndroid) {
    window.location.href = instagramAndroidIntentUrl;
  } else if (isAppleMobile) {
    window.location.href = instagramAppUrl;
  } else {
    window.location.assign(instagramDirectUrl);
  }
}

export function formatInstagramOrder(cart: CartItem[], subtotal: number) {
  const items = cart
    .map((item, index) => `${index + 1}. ${item.name}\n   Tam.: ${item.size} | Qtd.: ${item.quantity} | ${toMoney(item.price * item.quantity)}`)
    .join("\n");

  return [
    "Olá, Overzied Modas! Vim pelo site e quero finalizar este pedido:",
    "",
    items,
    "",
    `Subtotal dos produtos: ${toMoney(subtotal)}`,
    "Frete: a combinar",
    "",
    "Aguardo a confirmação de disponibilidade, frete e Pix. Obrigado!",
  ].join("\n");
}
