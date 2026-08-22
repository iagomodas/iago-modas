export type StorefrontSettings = {
  announcement_text: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_accent: string;
  hero_description: string;
  hero_cta_label: string;
  hero_cta_path: string;
  hero_image_url: string | null;
  logo_url: string | null;
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
  local_city: string;
  local_state: string;
  local_pickup_enabled: boolean;
  local_delivery_enabled: boolean;
  local_pickup_label: string;
  local_delivery_label: string;
  outside_delivery_label: string;
  outside_delivery_notice: string;
  pix_key: string;
  instagram_handle: string;
  instagram_enabled: boolean;
  whatsapp_number: string;
  whatsapp_enabled: boolean;
  future_payment_provider: "manual" | "mercado_pago";
  future_payments_enabled: boolean;
  future_webhook_enabled: boolean;
  future_shipping_provider: "manual" | "melhor_envio" | "correios";
  future_shipping_quotes_enabled: boolean;
  shipping_origin_postal_code: string;
  future_correios_service_code: string;
  primary_color: string;
  background_color: string;
  hero_visible: boolean;
  promotion_visible: boolean;
  highlights_visible: boolean;
  categories_visible: boolean;
  benefits_visible: boolean;
  newsletter_visible: boolean;
};

export type StorefrontSaveSection = "contact" | "delivery" | "home" | "catalog" | "footer" | "future";

const storefrontFieldsBySection: Record<StorefrontSaveSection, readonly (keyof StorefrontSettings)[]> = {
  contact: ["instagram_handle", "instagram_enabled", "whatsapp_number", "whatsapp_enabled"],
  delivery: ["pix_key", "local_city", "local_state", "local_pickup_enabled", "local_delivery_enabled", "local_pickup_label", "local_delivery_label", "outside_delivery_label", "outside_delivery_notice"],
  home: ["announcement_text", "hero_eyebrow", "hero_title", "hero_accent", "hero_description", "hero_cta_label", "hero_cta_path", "hero_image_url", "logo_url", "primary_color", "background_color", "hero_visible", "promotion_visible", "highlights_visible", "benefits_visible", "newsletter_visible"],
  catalog: ["promotion_eyebrow", "promotion_title", "promotion_accent", "promotion_description", "promotion_cta_label", "promotion_cta_path", "highlights_eyebrow", "highlights_title", "highlights_description", "highlights_cta_label", "highlights_cta_path", "categories_eyebrow", "categories_title", "categories_description", "categories_visible"],
  footer: ["benefit_one_title", "benefit_one_caption", "benefit_two_title", "benefit_two_caption", "benefit_three_title", "benefit_three_caption", "benefit_four_title", "benefit_four_caption", "footer_description", "footer_location", "footer_hours", "newsletter_title", "newsletter_description"],
  future: [
    "future_payment_provider",
    "future_shipping_provider",
    "shipping_origin_postal_code",
    "future_correios_service_code",
  ],
};

export function storefrontUpdateForSection(settings: StorefrontSettings, section: StorefrontSaveSection): Partial<StorefrontSettings> {
  return Object.fromEntries(storefrontFieldsBySection[section].map((field) => [field, settings[field]])) as Partial<StorefrontSettings>;
}

type StorefrontSupportSettings = Pick<StorefrontSettings, "instagram_enabled" | "whatsapp_enabled" | "whatsapp_number">;

export function replaceInstagramMentionWhenWhatsAppOnly(value: string, settings: StorefrontSupportSettings) {
  const whatsappOnly = !settings.instagram_enabled && settings.whatsapp_enabled && Boolean(settings.whatsapp_number.trim());
  if (!whatsappOnly) return value;

  return value.replace(/\binstagram\b/gi, (match) => {
    if (match === match.toUpperCase()) return "WHATSAPP";
    if (match === match.toLowerCase()) return "whatsapp";
    return "WhatsApp";
  });
}

export function resolveStorefrontImage(value: string | null | undefined, fallback: string) {
  const configuredImage = value?.trim();
  const legacyGithubLogo = "https://raw.githubusercontent.com/iagomodas/iago-modas/";
  if (configuredImage?.startsWith("/manus-storage/") || configuredImage?.startsWith(legacyGithubLogo)) return fallback;
  return configuredImage || fallback;
}

export const storefrontDefaults: StorefrontSettings = {
  announcement_text: "PEDIDOS DIRETO PELO INSTAGRAM ◆ ATENDIMENTO PERSONALIZADO ◆ TROCAS EM ATÉ 7 DIAS",
  hero_eyebrow: "NOVO DROP — 2026",
  hero_title: "SEU ESTILO.\nSUA PRESENÇA.",
  hero_accent: "SUA PRESENÇA.",
  hero_description: "Moda masculina com atitude e peças selecionadas para expressar o seu estilo.",
  hero_cta_label: "VER PRODUTOS",
  hero_cta_path: "/categoria/kits",
  hero_image_url: null,
  logo_url: null,
  promotion_eyebrow: "PROMOÇÃO DA SEMANA",
  promotion_title: "KIT ESSENTIAL",
  promotion_accent: "POR R$ 149,90",
  promotion_description: "Duas camisetas de algodão premium para você renovar o visual pagando menos.",
  promotion_cta_label: "APROVEITAR AGORA",
  promotion_cta_path: "/produto/kit-urban-essential",
  highlights_eyebrow: "COLEÇÃO",
  highlights_title: "DESTAQUES DA SEMANA",
  highlights_description: "Peças versáteis e selecionadas para expressar a sua identidade. Encontre seu tamanho e leve a IAGO MODAS com você.",
  highlights_cta_label: "VER TODOS",
  highlights_cta_path: "/categoria/camisetas",
  categories_eyebrow: "EXPLORE",
  categories_title: "ENCONTRE SEU ESTILO",
  categories_description: "Uma seleção para cada momento, sempre com a identidade IM.",
  benefit_one_title: "Pedido pelo Instagram",
  benefit_one_caption: "Atendimento direto com a loja",
  benefit_two_title: "Trocas em até 7 dias",
  benefit_two_caption: "Simples e sem burocracia",
  benefit_three_title: "Suporte especializado",
  benefit_three_caption: "Atendimento humanizado",
  benefit_four_title: "Compra orientada",
  benefit_four_caption: "Confirmação antes do Pix",
  newsletter_title: "ACOMPANHE AS NOVIDADES",
  newsletter_description: "Os próximos modelos e condições especiais são divulgados pelos canais oficiais da IAGO MODAS.",
  footer_description: "Peças selecionadas para quem veste autenticidade.",
  footer_location: "Joaquim Gomes — AL",
  footer_hours: "",
  local_city: "Joaquim Gomes",
  local_state: "AL",
  local_pickup_enabled: true,
  local_delivery_enabled: true,
  local_pickup_label: "Retirar em",
  local_delivery_label: "Entrega em",
  outside_delivery_label: "Sou de outra cidade",
  outside_delivery_notice: "Para pedidos de outra cidade, o frete não é calculado no site: o valor será combinado com a IAGO MODAS pelo Instagram antes da postagem.",
  pix_key: "iago765gtb@gmail.com",
  instagram_handle: "iagomodas9",
  instagram_enabled: true,
  whatsapp_number: "",
  whatsapp_enabled: false,
  future_payment_provider: "mercado_pago",
  future_payments_enabled: false,
  future_webhook_enabled: false,
  future_shipping_provider: "correios",
  future_shipping_quotes_enabled: false,
  shipping_origin_postal_code: "",
  future_correios_service_code: "",
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
const nonInteractiveText = (value: unknown, fallback: string, blockedPattern: RegExp) => {
  const candidate = text(value, fallback);
  return blockedPattern.test(candidate) ? fallback : candidate;
};

export function normalizeStorefrontSettings(value: Partial<StorefrontSettings> | null | undefined): StorefrontSettings {
  const source = value ?? {};
  const instagramEnabled = typeof source.instagram_enabled === "boolean" ? source.instagram_enabled : storefrontDefaults.instagram_enabled;
  const whatsappNumber = typeof source.whatsapp_number === "string" ? source.whatsapp_number.replace(/\D/g, "") : storefrontDefaults.whatsapp_number;
  const whatsappEnabled = typeof source.whatsapp_enabled === "boolean" ? source.whatsapp_enabled : storefrontDefaults.whatsapp_enabled;
  const supportSettings = { instagram_enabled: instagramEnabled, whatsapp_enabled: whatsappEnabled, whatsapp_number: whatsappNumber };
  return {
    announcement_text: replaceInstagramMentionWhenWhatsAppOnly(text(source.announcement_text, storefrontDefaults.announcement_text), supportSettings),
    hero_eyebrow: text(source.hero_eyebrow, storefrontDefaults.hero_eyebrow),
    hero_title: text(source.hero_title, storefrontDefaults.hero_title).replace(/\\n/g, "\n"),
    hero_accent: text(source.hero_accent, storefrontDefaults.hero_accent),
    hero_description: nonInteractiveText(source.hero_description, storefrontDefaults.hero_description, /\bcupom\b/i),
    hero_cta_label: text(source.hero_cta_label, storefrontDefaults.hero_cta_label),
    hero_cta_path: text(source.hero_cta_path, storefrontDefaults.hero_cta_path),
    hero_image_url: typeof source.hero_image_url === "string" && source.hero_image_url.trim() ? source.hero_image_url.trim() : null,
    logo_url: typeof source.logo_url === "string" && source.logo_url.trim() ? source.logo_url.trim() : null,
    promotion_eyebrow: text(source.promotion_eyebrow, storefrontDefaults.promotion_eyebrow),
    promotion_title: text(source.promotion_title, storefrontDefaults.promotion_title),
    promotion_accent: text(source.promotion_accent, storefrontDefaults.promotion_accent),
    promotion_description: text(source.promotion_description, storefrontDefaults.promotion_description),
    promotion_cta_label: text(source.promotion_cta_label, storefrontDefaults.promotion_cta_label),
    promotion_cta_path: text(source.promotion_cta_path, storefrontDefaults.promotion_cta_path),
    highlights_eyebrow: text(source.highlights_eyebrow, storefrontDefaults.highlights_eyebrow),
    highlights_title: text(source.highlights_title, storefrontDefaults.highlights_title),
    highlights_description: text(source.highlights_description, storefrontDefaults.highlights_description).replace(/\boverzied\s+modas\b/gi, "IAGO MODAS"),
    highlights_cta_label: text(source.highlights_cta_label, storefrontDefaults.highlights_cta_label),
    highlights_cta_path: text(source.highlights_cta_path, storefrontDefaults.highlights_cta_path),
    categories_eyebrow: text(source.categories_eyebrow, storefrontDefaults.categories_eyebrow),
    categories_title: text(source.categories_title, storefrontDefaults.categories_title),
    categories_description: text(source.categories_description, storefrontDefaults.categories_description).replace(/\bidentidade\s+om\b/gi, "identidade IM"),
    benefit_one_title: replaceInstagramMentionWhenWhatsAppOnly(text(source.benefit_one_title, storefrontDefaults.benefit_one_title), supportSettings),
    benefit_one_caption: replaceInstagramMentionWhenWhatsAppOnly(text(source.benefit_one_caption, storefrontDefaults.benefit_one_caption), supportSettings),
    benefit_two_title: text(source.benefit_two_title, storefrontDefaults.benefit_two_title),
    benefit_two_caption: text(source.benefit_two_caption, storefrontDefaults.benefit_two_caption),
    benefit_three_title: text(source.benefit_three_title, storefrontDefaults.benefit_three_title),
    benefit_three_caption: text(source.benefit_three_caption, storefrontDefaults.benefit_three_caption),
    benefit_four_title: text(source.benefit_four_title, storefrontDefaults.benefit_four_title),
    benefit_four_caption: text(source.benefit_four_caption, storefrontDefaults.benefit_four_caption),
    newsletter_title: text(source.newsletter_title, storefrontDefaults.newsletter_title),
    newsletter_description: nonInteractiveText(source.newsletter_description, storefrontDefaults.newsletter_description, /cadastre\s+(?:o\s+)?seu\s+e-?mail/i),
    footer_description: text(source.footer_description, storefrontDefaults.footer_description),
    footer_location: typeof source.footer_location === "string" ? source.footer_location.trim() : storefrontDefaults.footer_location,
    footer_hours: text(source.footer_hours, storefrontDefaults.footer_hours),
    local_city: text(source.local_city, storefrontDefaults.local_city),
    local_state: text(source.local_state, storefrontDefaults.local_state).toUpperCase().slice(0, 2),
    local_pickup_enabled: typeof source.local_pickup_enabled === "boolean" ? source.local_pickup_enabled : storefrontDefaults.local_pickup_enabled,
    local_delivery_enabled: typeof source.local_delivery_enabled === "boolean" ? source.local_delivery_enabled : storefrontDefaults.local_delivery_enabled,
    local_pickup_label: text(source.local_pickup_label, storefrontDefaults.local_pickup_label),
    local_delivery_label: text(source.local_delivery_label, storefrontDefaults.local_delivery_label),
    outside_delivery_label: text(source.outside_delivery_label, storefrontDefaults.outside_delivery_label),
    outside_delivery_notice: replaceInstagramMentionWhenWhatsAppOnly(text(source.outside_delivery_notice, storefrontDefaults.outside_delivery_notice), supportSettings),
    pix_key: text(source.pix_key, storefrontDefaults.pix_key),
    instagram_handle: text(source.instagram_handle, storefrontDefaults.instagram_handle).replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, ""),
    instagram_enabled: instagramEnabled,
    whatsapp_number: whatsappNumber,
    whatsapp_enabled: whatsappEnabled,
    future_payment_provider: source.future_payment_provider === "mercado_pago" ? "mercado_pago" : "manual",
    future_payments_enabled: source.future_payments_enabled === true,
    future_webhook_enabled: source.future_webhook_enabled === true,
    future_shipping_provider: source.future_shipping_provider === "correios" ? "correios" : storefrontDefaults.future_shipping_provider,
    future_shipping_quotes_enabled: source.future_shipping_quotes_enabled === true,
    shipping_origin_postal_code: typeof source.shipping_origin_postal_code === "string" ? source.shipping_origin_postal_code.replace(/\D/g, "").slice(0, 8) : "",
    future_correios_service_code: typeof source.future_correios_service_code === "string" ? source.future_correios_service_code.trim().replace(/[^A-Za-z0-9]/g, "").slice(0, 20) : "",
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
