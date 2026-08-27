import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const workflowPath = resolve(root, ".github/workflows/deploy-pages.yml");
const viteConfigPath = resolve(root, "vite.config.ts");
const workflowSource = readFileSync(workflowPath, "utf8");
const viteConfigSource = readFileSync(viteConfigPath, "utf8");

describe("workflow de publicação no GitHub Pages", () => {
  it("define a base do repositório por variável de ambiente no build estático", () => {
    expect(workflowSource).toContain(
      "VITE_BASE_PATH: /${{ github.event.repository.name }}/",
    );
    expect(workflowSource).toContain("run: pnpm run build:static");
    expect(viteConfigSource).toContain('base: process.env.VITE_BASE_PATH || "/"');
  });

  it("bloqueia a publicação quando a verificação de segurança ou qualidade falha", () => {
    expect(workflowSource).toContain("needs: verify");
    expect(workflowSource).toContain("run: pnpm run check");
    expect(workflowSource).toContain("run: pnpm test");
    expect(workflowSource).toContain("run: pnpm audit --prod --audit-level high");
    expect(workflowSource).toMatch(/actions\/checkout@[0-9a-f]{40}/g);
    expect(workflowSource).toMatch(/actions\/setup-node@[0-9a-f]{40}/g);
    expect(workflowSource).toMatch(/actions\/upload-pages-artifact@[0-9a-f]{40}/g);
    expect(workflowSource).toMatch(/actions\/deploy-pages@[0-9a-f]{40}/g);
  });
});
