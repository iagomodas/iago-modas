import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/Home.tsx"), "utf8");
const adminSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/AdminPage.tsx"), "utf8");
const storeShellSource = readFileSync(resolve(import.meta.dirname, "../client/src/components/StoreShell.tsx"), "utf8");

describe("conteúdo editável da página inicial", () => {
  it("lê do storefront_settings os textos dos blocos públicos", () => {
    [
      "settings.logo_url",
      "settings.highlights_title",
      "settings.highlights_description",
      "settings.benefit_one_title",
      "settings.benefit_four_caption",
      "heroLines",
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
      "logo_url",
      "pix_key",
    ].forEach((reference) => expect(adminSource).toContain(reference));
  });

  it("mostra somente os canais de atendimento configurados pelo painel", () => {
    [
      "settings.instagram_enabled",
      "settings.instagram_handle",
      "settings.whatsapp_enabled",
      "settings.whatsapp_number",
      "getInstagramDirectUrl(settings.instagram_handle)",
      "getWhatsAppChatUrl(settings.whatsapp_number)",
      "primarySupportChannel",
      "FaInstagram",
      "FaWhatsapp",
    ].forEach((reference) => expect(homeSource).toContain(reference));
    expect(homeSource).not.toContain("href={instagramDirectUrl}");
  });

  it("mantém as categorias móveis em rolagem horizontal sem indicador visual sobreposto", () => {
    expect(storeShellSource).toContain('no-scrollbar flex gap-5 overflow-x-auto');
    expect(storeShellSource).not.toContain("scroll-indicator");
  });
});
