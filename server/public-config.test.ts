import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const html = readFileSync(resolve(process.cwd(), "client/index.html"), "utf8");

describe("configuração pública da marca", () => {
  it("mantém o título público configurado como a marca oficial", () => {
    expect(html).toContain("<title>IAGO MODAS — Moda Masculina</title>");
    expect(html).toContain("Content-Security-Policy");
    expect(html).toContain("frame-ancestors 'none'");
    expect(html).toContain("X-Content-Type-Options");
    expect(html).toContain("strict-origin-when-cross-origin");
  });
});
