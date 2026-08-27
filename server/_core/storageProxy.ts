import type { Express, Request, Response } from "express";
import { ENV } from "./env";

const MAX_STORAGE_KEY_LENGTH = 512;

function configuredPublicPrefixes(): string[] {
  return ENV.storageProxyPublicPrefixes
    .split(",")
    .map(prefix => prefix.trim().replace(/^\/+/, ""))
    .filter(Boolean)
    .map(prefix => (prefix.endsWith("/") ? prefix : `${prefix}/`));
}

/**
 * Returns a normalized public object key only when it is safe and explicitly
 * allow-listed. Private buckets and arbitrary Forge paths are never accepted.
 */
export function getSafePublicStorageKey(
  rawKey: unknown,
  publicPrefixes = configuredPublicPrefixes(),
): string | null {
  if (typeof rawKey !== "string" || rawKey.length === 0 || rawKey.length > MAX_STORAGE_KEY_LENGTH) {
    return null;
  }

  if (
    rawKey.startsWith("/") ||
    rawKey.includes("\\") ||
    rawKey.includes("\0") ||
    rawKey.includes("?") ||
    rawKey.includes("#")
  ) {
    return null;
  }

  const segments = rawKey.split("/");
  if (segments.some(segment => segment.length === 0 || segment === "." || segment === "..")) {
    return null;
  }

  const normalized = segments.join("/");
  const prefixes = publicPrefixes
    .map(prefix => prefix.trim().replace(/^\/+/, ""))
    .filter(Boolean)
    .map(prefix => (prefix.endsWith("/") ? prefix : `${prefix}/`));

  return prefixes.some(prefix => normalized.startsWith(prefix)) ? normalized : null;
}

export function registerStorageProxy(app: Express) {
  // The legacy Forge proxy is intentionally opt-in. The current GitHub Pages
  // deployment does not need it, so an accidental backend deployment cannot
  // expose a server-side storage credential.
  if (!ENV.enableManusStorageProxy) return;

  app.get("/manus-storage/*", async (req: Request, res: Response) => {
    const rawKey = (req.params as Record<string, string>)[0];
    const key = getSafePublicStorageKey(rawKey);
    if (!key) {
      res.status(404).send("Storage object not found");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(503).send("Storage proxy unavailable");
      return;
    }

    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
      );
      forgeUrl.searchParams.set("path", key);

      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
        signal: AbortSignal.timeout(10_000),
      });

      if (!forgeResp.ok) {
        console.error(`[StorageProxy] presign failed with status ${forgeResp.status}`);
        res.status(502).send("Storage backend error");
        return;
      }

      const body = (await forgeResp.json()) as { url?: unknown };
      if (typeof body.url !== "string" || !/^https:\/\//i.test(body.url)) {
        res.status(502).send("Storage backend error");
        return;
      }

      res.set("Cache-Control", "no-store");
      res.redirect(307, body.url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err instanceof Error ? err.message : String(err));
      res.status(502).send("Storage proxy error");
    }
  });
}
