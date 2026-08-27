import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const adminPage = readFileSync(resolve(process.cwd(), "client/src/pages/AdminPage.tsx"), "utf8");
const categoryPage = readFileSync(resolve(process.cwd(), "client/src/pages/CategoryPage.tsx"), "utf8");
const catalogAdapter = readFileSync(resolve(process.cwd(), "client/src/lib/supabaseCatalog.ts"), "utf8");
const productCard = readFileSync(resolve(process.cwd(), "client/src/components/ProductCard.tsx"), "utf8");
const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/202608170005_product_brand_collection.sql"), "utf8");
const rebrandMigration = readFileSync(resolve(process.cwd(), "supabase/migrations/202608170006_rebrand_iago_modas.sql"), "utf8");

describe("gestão de marca e coleção no catálogo", () => {
  it("prepara colunas de marca e coleção sem remover produtos existentes", () => {
    expect(migration).toContain("add column if not exists brand text");
    expect(migration).toContain("add column if not exists collection text");
    expect(migration).toContain("add column if not exists brand text");
    expect(rebrandMigration).toContain("set default 'IAGO MODAS'");
    expect(rebrandMigration).toContain("set brand = 'IAGO MODAS'");
  });

  it("leva a marca do Supabase até o cartão público sem expor coleção", () => {
    expect(catalogAdapter).toContain("brand: product.brand?.trim() || undefined");
    expect(catalogAdapter).not.toContain("collection: product.collection");
    expect(productCard).toContain("productMeta");
    expect(productCard).not.toContain("product.collection");
  });

  it("oferece somente o campo de marca no formulário do dono", () => {
    expect(adminPage).toContain('label="Marca da peça"');
    expect(adminPage).not.toContain('label="Modelo específico (opcional)"');
    expect(adminPage).not.toContain('set("collection"');
  });

  it("mantém somente o filtro de marca na página de categoria", () => {
    expect(categoryPage).toContain("ESCOLHA A MARCA");
    expect(categoryPage).not.toContain("ESCOLHA O MODELO");
    expect(categoryPage).not.toContain("selectedModel");
    expect(categoryPage).not.toContain("categoryModels");
  });
});
