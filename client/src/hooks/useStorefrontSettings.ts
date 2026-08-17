import { normalizeStorefrontSettings, storefrontDefaults, type StorefrontSettings } from "@/lib/storefront";
import { hasSupabaseConfiguration, supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

export function useStorefrontSettings() {
  const [settings, setSettings] = useState<StorefrontSettings>(storefrontDefaults);
  const [loading, setLoading] = useState(hasSupabaseConfiguration);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: requestError } = await supabase
      .from("storefront_settings")
      .select("*")
      .eq("id", true)
      .maybeSingle();

    if (requestError) {
      setError(requestError.message);
      setSettings(storefrontDefaults);
    } else {
      setError(null);
      setSettings(normalizeStorefrontSettings(data));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { settings, loading, error, refresh };
}
