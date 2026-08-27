import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const homeSource = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
const heroAssetSource = readFileSync(resolve(root, "client/src/lib/inlineHeroAsset.ts"), "utf8");

describe("imagem principal da vitrine", () => {
  it("prioriza o ativo público em alta resolução", () => {
    expect(homeSource).toContain("resolveStorefrontImage(settings.hero_image_url, heroImage)");
    expect(heroAssetSource).toMatch(/data:image\/webp;base64,/);
    const encodedHero = heroAssetSource.match(/heroBase64 = "([^"]+)"/)?.[1];
    expect(encodedHero).toBeTruthy();
    expect(Buffer.from(encodedHero!, "base64").length).toBeGreaterThan(3_000);
  });

  it("mantém o fallback apenas para erro de carregamento", () => {
    expect(homeSource).toContain("onError={() => setHeroSrc(heroImage)}");
  });
});
