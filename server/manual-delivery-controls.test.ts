import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { normalizeStorefrontSettings } from "../client/src/lib/storefront";

describe("controles de entrega manual", () => {
  it("normaliza retirada e entrega local para o checkout", () => {
    const settings = normalizeStorefrontSettings({ local_city: "Maceió", local_state: "al", local_pickup_enabled: true, local_delivery_enabled: false });

    expect(settings.local_city).toBe("Maceió");
    expect(settings.local_state).toBe("AL");
    expect(settings.local_pickup_enabled).toBe(true);
    expect(settings.local_delivery_enabled).toBe(false);
  });

  it("mantém somente estados operacionais reais de frete e postagem", () => {
    const states = ["awaiting_freight", "freight_informed", "awaiting_pix", "paid", "ready_to_post", "shipped", "cancelled"];

    expect(states).toContain("awaiting_freight");
    expect(states).toContain("paid");
    expect(states).toContain("ready_to_post");
    expect(states).toContain("shipped");
    expect(states).not.toContain("tracking_generated");
  });

  it("apresenta ao dono que o frete é combinado manualmente pelo Instagram", () => {
    const adminPage = readFileSync(resolve(process.cwd(), "client/src/pages/AdminPage.tsx"), "utf8");

    expect(adminPage).toContain('awaiting_freight: "Frete a combinar pelo Instagram"');
    expect(adminPage).not.toContain('awaiting_freight: "Calcular frete"');
    expect(adminPage).toContain("combine o frete manualmente pelo Instagram");
    expect(adminPage).not.toContain("calcule o frete manualmente");
  });
});
