export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  enableManusStorageProxy: process.env.ENABLE_MANUS_STORAGE_PROXY === "true",
  storageProxyPublicPrefixes: process.env.MANUS_STORAGE_PUBLIC_PREFIXES ?? "",
};

export function assertServerEnvironment() {
  if (!ENV.isProduction) return;

  const missing = [
    ["VITE_APP_ID", ENV.appId],
    ["JWT_SECRET", ENV.cookieSecret],
    ["DATABASE_URL", ENV.databaseUrl],
    ["OAUTH_SERVER_URL", ENV.oAuthServerUrl],
  ].filter(([, value]) => !value);

  if (ENV.cookieSecret.length < 32) {
    missing.push(["JWT_SECRET (mínimo de 32 caracteres)", ENV.cookieSecret]);
  }
  if (ENV.enableManusStorageProxy && (!ENV.forgeApiUrl || !ENV.forgeApiKey || !ENV.storageProxyPublicPrefixes)) {
    missing.push(["BUILT_IN_FORGE_API_URL/KEY e MANUS_STORAGE_PUBLIC_PREFIXES", ""]);
  }
  if (missing.length > 0) {
    throw new Error(`Configuração de produção incompleta: ${missing.map(([name]) => name).join(", ")}`);
  }
}
