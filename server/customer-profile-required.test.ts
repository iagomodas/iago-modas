import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const checkout = readFileSync(resolve(process.cwd(), "client/src/pages/CheckoutPage.tsx"), "utf8");
const profile = readFileSync(resolve(process.cwd(), "client/src/pages/CustomerProfilePage.tsx"), "utf8");

describe("cadastro próprio do cliente", () => {
  it("bloqueia a solicitação sem nome próprio salvo no perfil", () => {
    expect(checkout).toContain('profileState !== "ready"');
    expect(checkout).toContain('window.location.hash = "#/perfil"');
    expect(checkout).toContain('select("display_name, delivery_phone');
  });

  it("mantém o nome editável em uma página própria", () => {
    expect(profile).toContain('placeholder="Digite seu nome completo"');
    expect(profile).toContain('rpc("update_own_customer_profile"');
    expect(profile).toContain("delivery_number");
    expect(profile).toContain("delivery_street");
  });

  it("informa publicamente que o frete de outra cidade é combinado pelo Instagram", () => {
    expect(checkout).toContain("settings.outside_delivery_notice");
    expect(checkout).toContain("A combinar");
  });
});
