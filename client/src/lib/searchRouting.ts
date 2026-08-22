export function buildSearchHashLocation(query: string) {
  return `/buscar?q=${encodeURIComponent(query.trim())}`;
}

export function normalizeHashRoute(location: string) {
  const queryIndex = location.indexOf("?");
  const pathname = queryIndex >= 0 ? location.slice(0, queryIndex) : location;
  return pathname || "/";
}

export function readSearchQueryFromHash(hash: string) {
  const queryIndex = hash.indexOf("?");
  return new URLSearchParams(queryIndex >= 0 ? hash.slice(queryIndex + 1) : "").get("q") || "";
}
