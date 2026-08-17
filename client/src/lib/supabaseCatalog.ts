import { Category, Product } from "@/lib/catalog";
import type { SupabaseProduct } from "@/lib/supabaseTypes";

export function parseSupabaseSizes(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string");
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

export function parseSupabaseImages(value: unknown, fallback: string): string[] {
  const values = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
  return [fallback, ...values].filter((url, index, all) => url.trim().length > 0 && all.indexOf(url) === index);
}

export function toStoreProduct(product: SupabaseProduct): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category as Category,
    price: product.price_cents / 100,
    oldPrice: product.compare_at_price_cents ? product.compare_at_price_cents / 100 : undefined,
    badge: product.badge === "NOVO" || product.badge === "LANÇAMENTO" ? product.badge : undefined,
    sizes: parseSupabaseSizes(product.sizes),
    color: product.accent_color,
    description: product.description,
    image: product.image_url,
    images: parseSupabaseImages(product.image_urls, product.image_url),
  };
}
