import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const publicRoots = ["client/index.html", "client/src", "client/public"].map((entry) => resolve(import.meta.dirname, "..", entry));
const forbiddenBranding = /made\s+with\s+manus|made-with-manus/i;
const legacyStoreName = /overzied modas|oversized modas/i;
const docsRoot = resolve(import.meta.dirname, "..", "docs");
const historicalDocs = new Set([
  "AUDITORIA_FINAL_2026-08-17.md",
  "DIAGNOSTICO_TELA_BRANCA_GITHUB_PAGES.md",
  "REGISTRO_MIGRACAO_MARCA_COLECAO_2026-08-17.md",
  "VALIDACAO_LOGO_OVERSIZED_MODAS_2026-08-17.md",
]);

function publicFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  if (statSync(root).isFile()) return [root];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => publicFiles(resolve(root, entry.name)));
}

describe("marca pública da loja", () => {
  it("não inclui o selo Made with Manus no código enviado ao GitHub Pages", () => {
    const matches = publicRoots.flatMap(publicFiles).filter((file) => forbiddenBranding.test(readFileSync(file, "utf8")));
    expect(matches, `Selo encontrado em: ${matches.join(", ")}`).toEqual([]);
  });

  it("mantém IAGO MODAS em documentos operacionais", () => {
    const matches = publicFiles(docsRoot).filter((file) => {
      const filename = relative(docsRoot, file);
      return !historicalDocs.has(filename) && legacyStoreName.test(readFileSync(file, "utf8"));
    });
    expect(matches, `Nome legado encontrado em documento operacional: ${matches.join(", ")}`).toEqual([]);
  });
});
