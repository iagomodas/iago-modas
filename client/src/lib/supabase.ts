import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/**
 * Só cria o cliente quando as chaves públicas foram configuradas. A chave
 * service_role nunca deve ser inserida no frontend ou neste arquivo.
 */
export const hasSupabaseConfiguration = Boolean(url && publishableKey);

export const supabase = hasSupabaseConfiguration
  ? createClient(url!, publishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
