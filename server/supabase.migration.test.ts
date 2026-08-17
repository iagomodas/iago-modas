import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/202608150001_overzied_modas.sql"),
  "utf8",
);

describe("migração Supabase da Overzied Modas", () => {
  it("habilita RLS em todos os dados públicos da loja", () => {
    for (const table of ["profiles", "products", "storefront_settings", "orders", "order_items"]) {
      expect(migration).toContain(`alter table public.${table} enable row level security;`);
    }
  });

  it("restringe alterações de catálogo e leitura de pedidos ao papel administrativo", () => {
    expect(migration).toMatch(/products: admin may insert[\s\S]*?with check \(\(select public\.is_admin\(\)\)\);/);
    expect(migration).toMatch(/products: admin may update[\s\S]*?using \(\(select public\.is_admin\(\)\)\)[\s\S]*?with check \(\(select public\.is_admin\(\)\)\);/);
    expect(migration).toMatch(/orders: admin may read and update[\s\S]*?using \(\(select public\.is_admin\(\)\)\)[\s\S]*?with check \(\(select public\.is_admin\(\)\)\);/);
    expect(migration).toMatch(/order items: admin may read[\s\S]*?using \(\(select public\.is_admin\(\)\)\);/);
    expect(migration).toMatch(/storefront settings: admin may update[\s\S]*?using \(\(select public\.is_admin\(\)\)\)[\s\S]*?with check \(\(select public\.is_admin\(\)\)\);/);
  });

  it("não concede ou referencia uma chave privada de serviço", () => {
    expect(migration).not.toMatch(/service_role|SUPABASE_SERVICE_ROLE|private key/i);
  });

  it("inclui os campos editáveis dos blocos restantes da página inicial", () => {
    [
      "highlights_title text not null",
      "categories_title text not null",
      "benefit_one_title text not null",
      "benefit_four_caption text not null",
    ].forEach((column) => expect(migration).toContain(column));
  });
});
