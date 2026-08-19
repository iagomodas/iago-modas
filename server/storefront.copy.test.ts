import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const storefrontSource = readFileSync(resolve(import.meta.dirname, "../client/src/lib/storefront.ts"), "utf8");
const shellSource = readFileSync(resolve(import.meta.dirname, "../client/src/components/StoreShell.tsx"), "utf8");
const productSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/ProductPage.tsx"), "utf8");
const migrationSource = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/202608150001_overzied_modas.sql"), "utf8");

describe("mensagens públicas confirmadas da vitrine", () => {
  it("não promete frete nacional nem horário de atendimento nos padrões", () => {
    [storefrontSource, migrationSource].forEach((source) => {
      expect(source).not.toContain("FRETE PARA TODO O BRASIL");
      expect(source).not.toContain("Envios para todo o Brasil");
      expect(source).not.toContain("entrega para todo o Brasil");
      expect(source).not.toContain("das 12h às 18h");
    });
  });

  it("exibe somente os pagamentos atuais, o envio nacional e respeita localização opcional", () => {
    expect(shellSource).toContain("settings.footer_hours.trim() &&");
    expect(shellSource).toContain("Pix");
    expect(shellSource).toContain("Dinheiro local");
    expect(shellSource).toContain("Envio para todo o Brasil");
    expect(shellSource).toContain("settings.footer_location &&");
    expect(shellSource).not.toContain("Visa");
    expect(shellSource).not.toContain("Mastercard");
    expect(productSource).toContain('className="order-1 grid grid-cols-1');
    expect(productSource).toContain('<section className="order-2 lg:order-2 lg:pt-3"');
    expect(productSource).not.toContain("Envio para todo o Brasil");
  });
});
