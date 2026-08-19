import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const helperSource = readFileSync(resolve(import.meta.dirname, "../client/src/lib/instagramOrder.ts"), "utf8");
import {
  formatInstagramOrder,
  getInstagramOpenUrl,
  instagramAndroidIntentUrl,
  instagramAppUrl,
  instagramDirectUrl,
  INSTAGRAM_HANDLE,
} from "@/lib/instagramOrder";

describe("pedido pelo Instagram", () => {
  it("usa o perfil oficial da IAGO MODAS como destino", () => {
    expect(INSTAGRAM_HANDLE).toBe("iagomodas9");
    expect(instagramAppUrl).toBe("instagram://direct?username=iagomodas9");
    expect(instagramAndroidIntentUrl).toBe(
      "intent://direct?username=iagomodas9#Intent;scheme=instagram;package=com.instagram.android;end",
    );
    expect(instagramDirectUrl).toBe("https://ig.me/m/iagomodas9");
    expect(getInstagramOpenUrl()).toBeTruthy();
  });

  it("prioriza a conversa direta e usa o Instagram web como fallback", () => {
    expect(helperSource).toContain("return `intent://direct?username=${username}");
    expect(helperSource).toContain("return `instagram://direct?username=${username}`");
    expect(helperSource).toContain("/Android/i.test(navigator.userAgent)");
    expect(helperSource).toContain("/iPhone|iPad|iPod/i.test(navigator.userAgent)");
    expect(helperSource).toContain("window.location.assign(directUrl)");
    expect(helperSource).toContain("getInstagramOpenUrl");
    expect(helperSource).toContain("document.addEventListener(\"visibilitychange\", clearFallback");
    expect(helperSource).toContain("window.setTimeout");
  });

  it("gera um resumo copiável com item, tamanho, quantidade e subtotal", () => {
    const message = formatInstagramOrder([
      { id: 8, name: "Camiseta Essential", size: "M", quantity: 2, price: 79.9 },
    ] as never, 159.8);

    const normalizedMessage = message.replaceAll("\u00a0", " ");

    expect(normalizedMessage).toContain("Camiseta Essential");
    expect(normalizedMessage).toContain("Tam.: M | Qtd.: 2 | R$ 159,80");
    expect(normalizedMessage).toContain("Subtotal dos produtos: R$ 159,80");
    expect(normalizedMessage).toContain("Frete: a combinar");
    expect(normalizedMessage).toContain("Olá, IAGO MODAS!");
    expect(normalizedMessage).not.toContain("OVERSIZED MODAS");
  });
});
