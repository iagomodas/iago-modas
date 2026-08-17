import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const workflowPath = resolve(root, ".github/workflows/deploy-pages.yml");
const workflowSource = readFileSync(workflowPath, "utf8");

describe("workflow de publicação no GitHub Pages", () => {
  it("passa a base do repositório diretamente ao build estático", () => {
    expect(workflowSource).toContain(
      "run: pnpm run build:static --base=/${{ github.event.repository.name }}/",
    );
    expect(workflowSource).not.toContain("build:static -- --base=");
  });
});
