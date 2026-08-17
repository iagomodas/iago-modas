import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSupabaseImages, toStoreProduct } from "../client/src/lib/supabaseCatalog";

const product = {
  id: 1,
  slug: "camiseta-teste",
  name: "Camiseta Teste",
  category: "Camisetas",
  price_cents: 8990,
  compare_at_price_cents: null,
  sizes: ["P", "M"],
  image_url: "https://cdn.example.com/principal.jpg",
  image_urls: [
    "https://cdn.example.com/principal.jpg",
    "https://cdn.example.com/frente.jpg",
    "https://cdn.example.com/costas.jpg",
    "",
  ],
  badge: "NOVO",
  accent_color: "#82ffc5",
  description: "Produto de teste",
  stock: 3,
  is_active: true,
};

const productPageSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/ProductPage.tsx"), "utf8");
const adminPageSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/AdminPage.tsx"), "utf8");

describe("galeria do catálogo Supabase", () => {
  it("mantém a imagem principal e remove URLs repetidas ou vazias", () => {
    expect(parseSupabaseImages(["", "principal", "frente", "principal"], "principal")).toEqual([
      "principal",
      "frente",
    ]);
  });

  it("usa a imagem principal quando image_urls não está disponível", () => {
    expect(parseSupabaseImages(null, "principal")).toEqual(["principal"]);
  });

  it("converte image_urls para a galeria consumida pela página de produto", () => {
    expect(toStoreProduct(product).images).toEqual([
      "https://cdn.example.com/principal.jpg",
      "https://cdn.example.com/frente.jpg",
      "https://cdn.example.com/costas.jpg",
    ]);
  });

  it("mantém navegação por miniaturas, setas e gesto de toque no detalhe", () => {
    ["onTouchStart", "onTouchEnd", "moveImage", "Foto anterior", "Próxima foto"].forEach((reference) => {
      expect(productPageSource).toContain(reference);
    });
  });

  it("envia fotos adicionais pelo formulário administrativo", () => {
    expect(adminPageSource).toContain("Fotos adicionais");
    expect(adminPageSource).toContain("form.imageUrls");
  });
});
