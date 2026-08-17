import { Category, products as fallbackProducts, Product } from "@/lib/catalog";
import { hasSupabaseConfiguration, supabase } from "@/lib/supabase";
import { toStoreProduct } from "@/lib/supabaseCatalog";
import type { SupabaseProduct } from "@/lib/supabaseTypes";
import { useCallback, useEffect, useState } from "react";

export function useCatalog() {
  const [supabaseProducts, setSupabaseProducts] = useState<Product[]>([]);
  const [supabaseLoading, setSupabaseLoading] = useState(hasSupabaseConfiguration);
  const [supabaseError, setSupabaseError] = useState<Error | null>(null);

  const refreshSupabase = useCallback(async () => {
    if (!supabase) {
      setSupabaseLoading(false);
      return;
    }
    setSupabaseLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) setSupabaseError(new Error(error.message));
    else {
      setSupabaseProducts(((data ?? []) as SupabaseProduct[]).map(toStoreProduct));
      setSupabaseError(null);
    }
    setSupabaseLoading(false);
  }, []);

  useEffect(() => {
    if (hasSupabaseConfiguration) void refreshSupabase();
  }, [refreshSupabase]);

  const activeProducts = hasSupabaseConfiguration ? supabaseProducts : [];

  return {
    products: activeProducts.length > 0 ? activeProducts : fallbackProducts,
    isUsingFallback: activeProducts.length === 0,
    isLoading: hasSupabaseConfiguration ? supabaseLoading : false,
    error: hasSupabaseConfiguration ? supabaseError : null,
    refetch: refreshSupabase,
  };
}
