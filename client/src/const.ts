import { supabase } from "@/lib/supabase";
import { getOAuthReturnUrl } from "@/lib/oauthReturn";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** Starts Google OAuth through Supabase. Only public Supabase settings reach the browser. */
export const startLogin = async () => {
  if (!supabase) {
    window.alert("A conexão com Supabase ainda não foi configurada para esta loja.");
    return;
  }
  const redirectTo = getOAuthReturnUrl("/admin");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) window.alert("Não foi possível iniciar o login com Google. Tente novamente.");
};
