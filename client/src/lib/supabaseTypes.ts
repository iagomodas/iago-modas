export type SupabaseProduct = {
  id: number;
  name: string;
  slug: string;
  category: string;
  brand?: string | null;
  collection?: string | null;
  description: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  sizes: unknown;
  image_url: string;
  image_urls?: unknown;
  badge: string | null;
  accent_color: string;
  stock: number;
  shipping_weight_grams?: number;
  shipping_length_cm?: number;
  shipping_width_cm?: number;
  shipping_height_cm?: number;
  is_active: boolean;
  created_at: string;
};

export type SupabaseOrder = {
  id: number;
  order_number: string;
  customer_user_id?: string | null;
  customer_name: string;
  payment_status: "pending" | "approved" | "rejected" | "cancelled";
  total_cents: number;
  created_at: string;
  delivery_mode?: "local" | "city_delivery" | "correios";
  delivery_city?: string | null;
  delivery_state?: string | null;
  delivery_neighborhood?: string | null;
  delivery_number?: string | null;
  delivery_complement?: string | null;
  customer_phone?: string | null;
  postal_code?: string | null;
  address?: string | null;
  order_status?: string;
  tracking_code?: string | null;
  customer_photo_url?: string | null;
  payment_provider?: string | null;
  payment_provider_reference?: string | null;
  payment_webhook_status?: "not_configured" | "pending" | "verified" | "rejected";
  payment_transition_state?: FuturePaymentTransitionState;
};

export type FuturePaymentTransitionState = "manual_pending" | "webhook_pending" | "paid" | "rejected";

export type SupabaseCustomerProfile = {
  id: string;
  email: string;
  display_name: string | null;
  profile_photo_path?: string | null;
  delivery_phone?: string | null;
  delivery_postal_code?: string | null;
  delivery_street?: string | null;
  delivery_number?: string | null;
  delivery_complement?: string | null;
  delivery_district?: string | null;
  delivery_city?: string | null;
  delivery_state?: string | null;
};
