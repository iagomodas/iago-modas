import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readProjectFile = (relativePath: string) => readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");

describe("consulta administrativa de pedidos", () => {
  it("usa as colunas reais de endereço do Supabase", () => {
    const hook = readProjectFile("client/src/hooks/useSupabaseAdmin.ts");
    expect(hook).toContain("postal_code, address");
    expect(hook).not.toContain("customer_cep");
    expect(hook).not.toContain("customer_address");
  });

  it("preenche a etiqueta com postal_code e address", () => {
    const label = readProjectFile("client/src/components/ShippingLabelGenerator.tsx");
    expect(label).toContain("street: order.address ?? \"\"");
    expect(label).toContain("cep: order.postal_code ?? \"\"");
  });
});
