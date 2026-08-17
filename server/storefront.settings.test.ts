import { describe, expect, it } from "vitest";
import { normalizeStorefrontSettings, storefrontDefaults } from "../client/src/lib/storefront";

describe("configurações da vitrine", () => {
  it("preserva uma configuração válida recebida do banco", () => {
    const settings = normalizeStorefrontSettings({
      hero_title: "NOVA COLEÇÃO",
      hero_image_url: "https://images.example.com/hero.jpg",
      footer_location: "Maceió — AL",
      highlights_title: "PEÇAS EM DESTAQUE",
      categories_description: "Categorias escolhidas pela loja.",
      benefit_three_caption: "Suporte feito por pessoas.",
    });

    expect(settings.hero_title).toBe("NOVA COLEÇÃO");
    expect(settings.hero_image_url).toBe("https://images.example.com/hero.jpg");
    expect(settings.footer_location).toBe("Maceió — AL");
    expect(settings.highlights_title).toBe("PEÇAS EM DESTAQUE");
    expect(settings.categories_description).toBe("Categorias escolhidas pela loja.");
    expect(settings.benefit_three_caption).toBe("Suporte feito por pessoas.");
  });

  it("protege a vitrine usando os textos padrão quando faltam valores", () => {
    const settings = normalizeStorefrontSettings({ hero_title: "   ", hero_image_url: "" });

    expect(settings.hero_title).toBe(storefrontDefaults.hero_title);
    expect(settings.hero_image_url).toBeNull();
    expect(settings.promotion_title).toBe(storefrontDefaults.promotion_title);
    expect(settings.highlights_title).toBe(storefrontDefaults.highlights_title);
    expect(settings.benefit_one_title).toBe(storefrontDefaults.benefit_one_title);
  });
});
