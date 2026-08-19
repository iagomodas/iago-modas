import { describe, expect, it } from "vitest";

describe("configuração pública da marca", () => {
  it("mantém o título público configurado como a marca oficial", () => {
    expect(process.env.VITE_APP_TITLE).toBe("IAGO MODAS");
  });
});
