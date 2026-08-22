import { hasSupabaseConfiguration, supabase } from "@/lib/supabase";
import type { SupabaseOrder, SupabaseProduct } from "@/lib/supabaseTypes";
import { createPrivateProfilePhotoUrl } from "@/lib/profilePhoto";
import { useCallback, useEffect, useState } from "react";

export function useSupabaseProducts(includeInactive = false) {
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState(hasSupabaseConfiguration);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const query = supabase.from("products").select("*").order("created_at", { ascending: false });
      const { data, error: requestError } = includeInactive ? await query : await query.eq("is_active", true);
      if (requestError) setError(requestError.message);
      else {
        setProducts((data ?? []) as SupabaseProduct[]);
        setError(null);
      }
    } catch {
      setProducts([]);
      setError("Não foi possível carregar os produtos agora.");
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { products, loading, error, refresh };
}

export function useSupabaseOrders() {
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [loading, setLoading] = useState(hasSupabaseConfiguration);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "live" | "offline"
  >(hasSupabaseConfiguration ? "connecting" : "offline");

  const refresh = useCallback(async () => {
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error: requestError } = await client
        .from("orders")
        .select("id, order_number, customer_user_id, customer_name, payment_status, total_cents, created_at, delivery_mode, delivery_city, delivery_state, delivery_neighborhood, delivery_number, delivery_complement, customer_phone, postal_code, address, order_status, tracking_code")
        .order("created_at", { ascending: false });
      if (requestError) {
        setError(requestError.message);
        return;
      }
      const orders = (data ?? []) as SupabaseOrder[];
      const customerIds = Array.from(new Set(orders.map((order) => order.customer_user_id).filter((id): id is string => Boolean(id))));
      const { data: profiles, error: profilesError } = customerIds.length ? await client.from("profiles").select("id, profile_photo_path").in("id", customerIds) : { data: [] as { id: string; profile_photo_path: string | null }[], error: null };
      if (profilesError) throw profilesError;
      const privatePhotos = await Promise.all((profiles ?? []).map(async (profile) => [profile.id, await createPrivateProfilePhotoUrl(client, profile.profile_photo_path)] as const));
      const photosByCustomer = new Map(privatePhotos);
      setOrders(orders.map((order) => ({ ...order, customer_photo_url: order.customer_user_id ? photosByCustomer.get(order.customer_user_id) ?? null : null })));
      setError(null);
    } catch {
      setOrders([]);
      setError("Não foi possível carregar os pedidos agora.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const channel = client
      .channel("iago-modas-admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void refresh();
        },
      )
      .subscribe((status) => {
        setRealtimeStatus(
          status === "SUBSCRIBED"
            ? "live"
            : status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED"
              ? "offline"
              : "connecting",
        );
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, [refresh]);

  return { orders, loading, error, refresh, realtimeStatus };
}
