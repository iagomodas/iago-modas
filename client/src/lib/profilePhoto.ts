import type { SupabaseClient } from "@supabase/supabase-js";

const PROFILE_PHOTO_BUCKET = "customer-profile-photos";
const SIGNED_URL_TTL_SECONDS = 5 * 60;

/**
 * Fotos de clientes não são públicas. Esta função devolve uma URL temporária
 * apenas após o Supabase aplicar a política RLS do usuário autenticado.
 */
export async function createPrivateProfilePhotoUrl(
  client: SupabaseClient,
  profilePhotoPath?: string | null,
): Promise<string | null> {
  if (!profilePhotoPath) return null;
  const { data, error } = await client.storage
    .from(PROFILE_PHOTO_BUCKET)
    .createSignedUrl(profilePhotoPath, SIGNED_URL_TTL_SECONDS);
  return error || !data?.signedUrl ? null : data.signedUrl;
}
