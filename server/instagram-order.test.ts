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
    expect(instagramAppUrl).toBe(instagramDirectUrl);
    expect(instagramAndroidIntentUrl).toContain("intent://ig.me/m/iagomodas9");
    expect(instagramAndroidIntentUrl).toContain("package=com.instagram.android");
    expect(instagramAndroidIntentUrl).toContain("S.browser_fallback_url=");
    expect(instagramDirectUrl).toBe("https://ig.me/m/iagomodas9");
    expect(getInstagramOpenUrl()).toBe(instagramDirectUrl);
  });

  it("mantém o link oficial como fallback estável e documenta o Intent Android separado", () => {
    expect(helperSource).toContain("getInstagramAndroidIntentUrl");
    expect(helperSource).toContain("S.browser_fallback_url");
    expect(helperSource).toContain("return getInstagramDirectUrl(handle)");
    expect(helperSource).toContain("window.location.assign(getInstagramOpenUrl(handle))");
    expect(helperSource).toContain("/Android/i.test(userAgent)");
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
