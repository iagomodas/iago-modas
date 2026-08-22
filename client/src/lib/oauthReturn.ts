export const OAUTH_RETURN_QUERY = "iago_oauth_return";
const OAUTH_RETURN_STORAGE_KEY = "iago_oauth_return_pending";

const allowedOAuthRoutes = ["/admin", "/perfil", "/pedidos"] as const;

export type OAuthReturnRoute = (typeof allowedOAuthRoutes)[number];

function isOAuthReturnRoute(value: string | null): value is OAuthReturnRoute {
  return Boolean(value && allowedOAuthRoutes.includes(value as OAuthReturnRoute));
}

function readStoredOAuthReturnRoute(): OAuthReturnRoute | null {
  if (typeof window === "undefined") return null;

  try {
    const target = window.sessionStorage.getItem(OAUTH_RETURN_STORAGE_KEY);
    return isOAuthReturnRoute(target) ? target : null;
  } catch {
    return null;
  }
}

function persistOAuthReturnRoute(target: OAuthReturnRoute) {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(OAUTH_RETURN_STORAGE_KEY, target);
  } catch {
    // O retorno também segue pela query string quando o armazenamento local não está disponível.
  }
}

function clearStoredOAuthReturnRoute() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(OAUTH_RETURN_STORAGE_KEY);
  } catch {
    // Não há ação adicional necessária quando o navegador bloqueia o armazenamento local.
  }
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
  persistOAuthReturnRoute(target);
  return buildOAuthReturnUrl(window.location.href, target);
}

export function getPendingOAuthReturnRoute(currentHref = window.location.href): OAuthReturnRoute | null {
  const target = new URL(currentHref).searchParams.get(OAUTH_RETURN_QUERY);
  return isOAuthReturnRoute(target) ? target : readStoredOAuthReturnRoute();
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
  clearStoredOAuthReturnRoute();
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
