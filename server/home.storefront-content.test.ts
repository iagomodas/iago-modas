import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");
const adminSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/AdminPage.tsx"), "utf8");

describe("conteúdo editável da página inicial", () => {
  it("lê do storefront_settings os textos dos blocos públicos", () => {
    [
      "settings.highlights_title",
      "settings.highlights_description",
      "settings.benefit_one_title",
      "settings.benefit_four_caption",
    ].forEach((reference) => expect(homeSource).toContain(reference));
  });

  it("não renderiza uma grade duplicada de categorias na home", () => {
    expect(homeSource).not.toContain("category-tile");
    expect(homeSource).not.toContain("categories_title");
  });

  it("usa o tema e os flags de visibilidade da configuração pública", () => {
    [
      "settings.primary_color",
      "settings.background_color",
      "settings.hero_visible",
      "settings.promotion_visible",
      "settings.highlights_visible",
      "settings.benefits_visible",
      "settings.newsletter_visible",
    ].forEach((reference) => expect(homeSource).toContain(reference));
  });

  it("oferece os campos correspondentes ao administrador", () => {
    [
      "COLEÇÃO E CATEGORIAS",
      "BENEFÍCIOS",
      "benefit_one_title",
      "categories_title",
      "highlights_cta_path",
    ].forEach((reference) => expect(adminSource).toContain(reference));
  });
});
