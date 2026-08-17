export type StorefrontSettings = {
  announcement_text: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_accent: string;
  hero_description: string;
  hero_cta_label: string;
  hero_cta_path: string;
  hero_image_url: string | null;
  promotion_eyebrow: string;
  promotion_title: string;
  promotion_accent: string;
  promotion_description: string;
  promotion_cta_label: string;
  promotion_cta_path: string;
  highlights_eyebrow: string;
  highlights_title: string;
  highlights_description: string;
  highlights_cta_label: string;
  highlights_cta_path: string;
  categories_eyebrow: string;
  categories_title: string;
  categories_description: string;
  benefit_one_title: string;
  benefit_one_caption: string;
  benefit_two_title: string;
  benefit_two_caption: string;
  benefit_three_title: string;
  benefit_three_caption: string;
  benefit_four_title: string;
  benefit_four_caption: string;
  newsletter_title: string;
  newsletter_description: string;
  footer_description: string;
  footer_location: string;
  footer_hours: string;
  primary_color: string;
  background_color: string;
  hero_visible: boolean;
  promotion_visible: boolean;
  highlights_visible: boolean;
  categories_visible: boolean;
  benefits_visible: boolean;
  newsletter_visible: boolean;
};

export const storefrontDefaults: StorefrontSettings = {
  announcement_text: "PEDIDOS DIRETO PELO INSTAGRAM ◆ ATENDIMENTO PERSONALIZADO ◆ TROCAS EM ATÉ 7 DIAS",
  hero_eyebrow: "NOVO DROP — 2026",
  hero_title: "SEU ESTILO.\nSUA PRESENÇA.",
  hero_accent: "SUA PRESENÇA.",
  hero_description: "Moda masculina com atitude e peças selecionadas. Use o cupom BEMVINDO e garanta 5% OFF na primeira compra.",
  hero_cta_label: "VER KITS PROMOCIONAIS",
  hero_cta_path: "/categoria/kits",
  hero_image_url: null,
  promotion_eyebrow: "PROMOÇÃO DA SEMANA",
  promotion_title: "KIT ESSENTIAL",
  promotion_accent: "POR R$ 149,90",
  promotion_description: "Duas camisetas de algodão premium para você renovar o visual pagando menos.",
  promotion_cta_label: "APROVEITAR AGORA",
  promotion_cta_path: "/produto/kit-urban-essential",
  highlights_eyebrow: "COLEÇÃO",
  highlights_title: "DESTAQUES DA SEMANA",
  highlights_description: "Peças versáteis e selecionadas para expressar a sua identidade. Encontre seu tamanho e leve a Overzied Modas com você.",
  highlights_cta_label: "VER TODOS",
  highlights_cta_path: "/categoria/camisetas",
  categories_eyebrow: "EXPLORE",
  categories_title: "ENCONTRE SEU ESTILO",
  categories_description: "Uma seleção para cada momento, sempre com a identidade OM.",
  benefit_one_title: "Pedido pelo Instagram",
  benefit_one_caption: "Atendimento direto com a loja",
  benefit_two_title: "Trocas em até 7 dias",
  benefit_two_caption: "Simples e sem burocracia",
  benefit_three_title: "Suporte especializado",
  benefit_three_caption: "Atendimento humanizado",
  benefit_four_title: "Compra orientada",
  benefit_four_caption: "Confirmação antes do Pix",
  newsletter_title: "NÃO PERCA O PRÓXIMO DROP",
  newsletter_description: "Cadastre seu e-mail e seja o primeiro a receber novidades, peças limitadas e condições especiais.",
  footer_description: "Peças selecionadas para quem veste autenticidade.",
  footer_location: "Joaquim Gomes — AL",
  footer_hours: "",
  primary_color: "#7affb9",
  background_color: "#0a0d10",
  hero_visible: true,
  promotion_visible: true,
  highlights_visible: true,
  categories_visible: true,
  benefits_visible: true,
  newsletter_visible: true,
};

const text = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value.trim() : fallback;

export function normalizeStorefrontSettings(value: Partial<StorefrontSettings> | null | undefined): StorefrontSettings {
  const source = value ?? {};
  return {
    announcement_text: text(source.announcement_text, storefrontDefaults.announcement_text),
    hero_eyebrow: text(source.hero_eyebrow, storefrontDefaults.hero_eyebrow),
    hero_title: text(source.hero_title, storefrontDefaults.hero_title),
    hero_accent: text(source.hero_accent, storefrontDefaults.hero_accent),
    hero_description: text(source.hero_description, storefrontDefaults.hero_description),
    hero_cta_label: text(source.hero_cta_label, storefrontDefaults.hero_cta_label),
    hero_cta_path: text(source.hero_cta_path, storefrontDefaults.hero_cta_path),
    hero_image_url: typeof source.hero_image_url === "string" && source.hero_image_url.trim() ? source.hero_image_url.trim() : null,
    promotion_eyebrow: text(source.promotion_eyebrow, storefrontDefaults.promotion_eyebrow),
    promotion_title: text(source.promotion_title, storefrontDefaults.promotion_title),
    promotion_accent: text(source.promotion_accent, storefrontDefaults.promotion_accent),
    promotion_description: text(source.promotion_description, storefrontDefaults.promotion_description),
    promotion_cta_label: text(source.promotion_cta_label, storefrontDefaults.promotion_cta_label),
    promotion_cta_path: text(source.promotion_cta_path, storefrontDefaults.promotion_cta_path),
    highlights_eyebrow: text(source.highlights_eyebrow, storefrontDefaults.highlights_eyebrow),
    highlights_title: text(source.highlights_title, storefrontDefaults.highlights_title),
    highlights_description: text(source.highlights_description, storefrontDefaults.highlights_description),
    highlights_cta_label: text(source.highlights_cta_label, storefrontDefaults.highlights_cta_label),
    highlights_cta_path: text(source.highlights_cta_path, storefrontDefaults.highlights_cta_path),
    categories_eyebrow: text(source.categories_eyebrow, storefrontDefaults.categories_eyebrow),
    categories_title: text(source.categories_title, storefrontDefaults.categories_title),
    categories_description: text(source.categories_description, storefrontDefaults.categories_description),
    benefit_one_title: text(source.benefit_one_title, storefrontDefaults.benefit_one_title),
    benefit_one_caption: text(source.benefit_one_caption, storefrontDefaults.benefit_one_caption),
    benefit_two_title: text(source.benefit_two_title, storefrontDefaults.benefit_two_title),
    benefit_two_caption: text(source.benefit_two_caption, storefrontDefaults.benefit_two_caption),
    benefit_three_title: text(source.benefit_three_title, storefrontDefaults.benefit_three_title),
    benefit_three_caption: text(source.benefit_three_caption, storefrontDefaults.benefit_three_caption),
    benefit_four_title: text(source.benefit_four_title, storefrontDefaults.benefit_four_title),
    benefit_four_caption: text(source.benefit_four_caption, storefrontDefaults.benefit_four_caption),
    newsletter_title: text(source.newsletter_title, storefrontDefaults.newsletter_title),
    newsletter_description: text(source.newsletter_description, storefrontDefaults.newsletter_description),
    footer_description: text(source.footer_description, storefrontDefaults.footer_description),
    footer_location: text(source.footer_location, storefrontDefaults.footer_location),
    footer_hours: text(source.footer_hours, storefrontDefaults.footer_hours),
    primary_color: /^#[0-9A-Fa-f]{6}$/.test(String(source.primary_color ?? "")) ? String(source.primary_color) : storefrontDefaults.primary_color,
    background_color: /^#[0-9A-Fa-f]{6}$/.test(String(source.background_color ?? "")) ? String(source.background_color) : storefrontDefaults.background_color,
    hero_visible: typeof source.hero_visible === "boolean" ? source.hero_visible : storefrontDefaults.hero_visible,
    promotion_visible: typeof source.promotion_visible === "boolean" ? source.promotion_visible : storefrontDefaults.promotion_visible,
    highlights_visible: typeof source.highlights_visible === "boolean" ? source.highlights_visible : storefrontDefaults.highlights_visible,
    categories_visible: typeof source.categories_visible === "boolean" ? source.categories_visible : storefrontDefaults.categories_visible,
    benefits_visible: typeof source.benefits_visible === "boolean" ? source.benefits_visible : storefrontDefaults.benefits_visible,
    newsletter_visible: typeof source.newsletter_visible === "boolean" ? source.newsletter_visible : storefrontDefaults.newsletter_visible,
  };
}

export function storefrontPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}
