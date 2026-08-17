import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(import.meta.dirname, "../client/src/const.ts"), "utf8");

describe("retorno do login Google", () => {
  it("preserva o subdiretório e retorna o administrador ao painel", () => {
    expect(source).toContain('`${import.meta.env.BASE_URL}#/admin`');
    expect(source).toContain('provider: "google"');
  });
});
