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
      local_pickup_enabled: false,
      local_delivery_enabled: true,
      local_pickup_label: "Buscar na loja em",
      local_delivery_label: "Entregamos em",
      outside_delivery_label: "Moro em outra cidade",
      outside_delivery_notice: "Frete confirmado no Direct antes da postagem.",
      pix_key: "nova-chave-pix",
    });

    expect(settings.hero_title).toBe("NOVA COLEÇÃO");
    expect(settings.hero_image_url).toBe("https://images.example.com/hero.jpg");
    expect(settings.footer_location).toBe("Maceió — AL");
    expect(settings.highlights_title).toBe("PEÇAS EM DESTAQUE");
    expect(settings.categories_description).toBe("Categorias escolhidas pela loja.");
    expect(settings.benefit_three_caption).toBe("Suporte feito por pessoas.");
    expect(settings.local_pickup_enabled).toBe(false);
    expect(settings.local_delivery_enabled).toBe(true);
    expect(settings.local_pickup_label).toBe("Buscar na loja em");
    expect(settings.local_delivery_label).toBe("Entregamos em");
    expect(settings.outside_delivery_label).toBe("Moro em outra cidade");
    expect(settings.outside_delivery_notice).toBe("Frete confirmado no Direct antes da postagem.");
    expect(settings.pix_key).toBe("nova-chave-pix");
  });

  it("protege a vitrine usando os textos padrão quando faltam valores", () => {
    const settings = normalizeStorefrontSettings({ hero_title: "   ", hero_image_url: "" });

    expect(settings.hero_title).toBe(storefrontDefaults.hero_title);
    expect(settings.hero_image_url).toBeNull();
    expect(settings.promotion_title).toBe(storefrontDefaults.promotion_title);
    expect(settings.highlights_title).toBe(storefrontDefaults.highlights_title);
    expect(settings.benefit_one_title).toBe(storefrontDefaults.benefit_one_title);
    expect(settings.outside_delivery_notice).toBe(storefrontDefaults.outside_delivery_notice);
    expect(settings.pix_key).toBe(storefrontDefaults.pix_key);
  });

  it("converte uma quebra de linha salva literalmente no título principal", () => {
    const settings = normalizeStorefrontSettings({ hero_title: "ESTILO.\\nSUA IDENTIDADE" });

    expect(settings.hero_title).toBe("ESTILO.\nSUA IDENTIDADE");
  });

  it("mantém as opções locais ativas por padrão quando o banco ainda não as retorna", () => {
    const settings = normalizeStorefrontSettings({});

    expect(settings.local_pickup_enabled).toBe(true);
    expect(settings.local_delivery_enabled).toBe(true);
  });
});
