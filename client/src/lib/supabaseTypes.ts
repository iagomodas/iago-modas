export type SupabaseProduct = {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  sizes: unknown;
  image_url: string;
  image_urls?: unknown;
  badge: string | null;
  accent_color: string;
  stock: number;
  is_active: boolean;
  created_at: string;
};

export type SupabaseOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  payment_status: "pending" | "approved" | "rejected" | "cancelled";
  total_cents: number;
  created_at: string;
};
