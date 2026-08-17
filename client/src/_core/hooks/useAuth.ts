import { hasSupabaseConfiguration, supabase } from "@/lib/supabase";
import { useCallback, useEffect, useState } from "react";

export type StoreUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
};

export function useAuth() {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [loading, setLoading] = useState(hasSupabaseConfiguration);
  const [error, setError] = useState<Error | null>(null);

  const refreshUser = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setUser(null);
      setError(authError ? new Error(authError.message) : null);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("display_name, email, role")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) setError(new Error(profileError.message));
    else setError(null);

    setUser({
      id: authData.user.id,
      name: (profile?.display_name as string | null | undefined) ?? (authData.user.user_metadata.full_name as string | undefined) ?? null,
      email: (profile?.email as string | null | undefined) ?? authData.user.email ?? null,
      role: profile?.role === "admin" ? "admin" : "user",
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshUser();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange(() => {
      void refreshUser();
    });
    return () => data.subscription.unsubscribe();
  }, [refreshUser]);

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, error, isAuthenticated: Boolean(user), logout, refreshUser };
}
