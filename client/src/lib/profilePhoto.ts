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
  if (!error && data?.signedUrl) {
    // A mesma foto pode ser substituída mantendo o mesmo caminho. O marcador
    // impede que o navegador mostre uma cópia antiga que ficou em cache.
    const separator = data.signedUrl.includes("?") ? "&" : "?";
    return `${data.signedUrl}${separator}v=${Date.now()}`;
  }

  // Mantém a foto privada, mas oferece uma alternativa quando o navegador não
  // consegue abrir a URL assinada imediatamente após o envio.
  const { data: file, error: downloadError } = await client.storage
    .from(PROFILE_PHOTO_BUCKET)
    .download(profilePhotoPath);
  return downloadError || !file ? null : URL.createObjectURL(file);
}
