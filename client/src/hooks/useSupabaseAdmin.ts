import { hasSupabaseConfiguration, supabase } from "@/lib/supabase";
import type { SupabaseOrder, SupabaseProduct } from "@/lib/supabaseTypes";
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
    setLoading(true);
    const query = supabase.from("products").select("*").order("created_at", { ascending: false });
    const { data, error: requestError } = includeInactive ? await query : await query.eq("is_active", true);
    if (requestError) setError(requestError.message);
    else {
      setProducts((data ?? []) as SupabaseProduct[]);
      setError(null);
    }
    setLoading(false);
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

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: requestError } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, payment_status, total_cents, created_at")
      .order("created_at", { ascending: false });
    if (requestError) setError(requestError.message);
    else {
      setOrders((data ?? []) as SupabaseOrder[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { orders, loading, error, refresh };
}
