import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const homeSource = readFileSync(resolve(root, "client/src/pages/Home.tsx"), "utf8");
const publicHeroPath = resolve(root, "client/public/assets/overzied-hero.jpg");

describe("imagem principal da vitrine", () => {
  it("prioriza o ativo público em alta resolução", () => {
    expect(homeSource).toContain('`${import.meta.env.BASE_URL}assets/overzied-hero.jpg`');
    expect(statSync(publicHeroPath).size).toBeGreaterThan(50_000);
  });

  it("mantém o fallback apenas para erro de carregamento", () => {
    expect(homeSource).toContain("onError={() => setHeroSrc(heroImage)}");
  });
});
