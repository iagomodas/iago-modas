export const OAUTH_RETURN_QUERY = "iago_oauth_return";

const allowedOAuthRoutes = ["/admin", "/perfil"] as const;

export type OAuthReturnRoute = (typeof allowedOAuthRoutes)[number];

function isOAuthReturnRoute(value: string | null): value is OAuthReturnRoute {
  return Boolean(value && allowedOAuthRoutes.includes(value as OAuthReturnRoute));
}

/**
 * O Supabase usa o fragmento (#access_token=...) ao terminar um OAuth. Por
 * isso a rota do Wouter não pode ocupar o mesmo fragmento. Guardamos a rota
 * desejada em query string e deixamos o fragmento exclusivamente para a sessão.
 */
export function buildOAuthReturnUrl(currentHref: string, target: OAuthReturnRoute) {
  const url = new URL(currentHref);
  url.hash = "";
  url.searchParams.set(OAUTH_RETURN_QUERY, target);
  return url.toString();
}

export function getOAuthReturnUrl(target: OAuthReturnRoute) {
  return buildOAuthReturnUrl(window.location.href, target);
}

export function getPendingOAuthReturnRoute(currentHref = window.location.href): OAuthReturnRoute | null {
  const target = new URL(currentHref).searchParams.get(OAUTH_RETURN_QUERY);
  return isOAuthReturnRoute(target) ? target : null;
}

/**
 * Alguns navegadores podem renderizar o aplicativo antes de preservar a query
 * `iago_oauth_return`. Enquanto o Supabase ainda está consumindo o fragmento
 * de OAuth, o hash contém tokens e não é uma rota Wouter válida. Esta guarda
 * evita que esse estado intermediário alcance a tela 404.
 */
export function hasOAuthCallbackResponse(currentHref = window.location.href) {
  const url = new URL(currentHref);
  const callbackHash = url.hash.replace(/^#/, "");
  return /(?:^|&)(?:access_token|refresh_token|error|error_description)=/.test(callbackHash)
    || url.searchParams.has("code");
}

export function consumeOAuthReturnRoute() {
  const target = getPendingOAuthReturnRoute();
  if (!target) return null;

  const url = new URL(window.location.href);
  url.searchParams.delete(OAUTH_RETURN_QUERY);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return target;
}

/**
 * Mantém compatibilidade com o retorno que já havia sido iniciado antes da
 * correção: `#/perfil#access_token=...`. A normalização acontece antes de o
 * cliente Supabase tentar detectar a sessão no fragmento.
 */
export function normalizeLegacyOAuthCallbackUrl(currentHref: string) {
  const url = new URL(currentHref);
  const tokenStart = url.hash.indexOf("#access_token=");
  if (tokenStart <= 0) return null;

  const target = url.hash.slice(1, tokenStart);
  if (!isOAuthReturnRoute(target)) return null;

  url.searchParams.set(OAUTH_RETURN_QUERY, target);
  url.hash = url.hash.slice(tokenStart);
  return url.toString();
}

export function normalizeLegacyOAuthCallbackInBrowser() {
  const normalizedUrl = normalizeLegacyOAuthCallbackUrl(window.location.href);
  if (normalizedUrl) window.history.replaceState(window.history.state, "", normalizedUrl);
}
