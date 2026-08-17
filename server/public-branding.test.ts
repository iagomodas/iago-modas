import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const publicRoots = ["client/index.html", "client/src", "client/public"].map((entry) => resolve(import.meta.dirname, "..", entry));
const forbiddenBranding = /made\s+with\s+manus|made-with-manus/i;

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
});
