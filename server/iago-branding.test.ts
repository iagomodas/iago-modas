import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const publicFiles = [
  "client/index.html",
  "client/src/lib/inlineAssets.ts",
  "client/src/lib/inlineLogoAsset.ts",
  "client/src/lib/storefront.ts",
  "client/src/pages/Home.tsx",
  "client/src/components/StoreShell.tsx",
  "client/src/components/ProductCard.tsx",
  "client/src/components/ShippingLabelGenerator.tsx",
  "client/src/pages/AdminPage.tsx",
  "client/src/lib/instagramOrder.ts",
  "client/src/lib/shippingLabel.ts",
].map((file) => readFileSync(resolve(process.cwd(), file), "utf8")).join("\n");

describe("marca pública IAGO MODAS", () => {
  it("usa o nome, o monograma IM e a logo publicada corretos", () => {
    expect(publicFiles).toContain("IAGO MODAS");
    expect(publicFiles).toContain("Logo IM");
    expect(publicFiles).toMatch(/data:image\/webp;base64/);
    expect(publicFiles).toContain('configuredImage?.startsWith("/manus-storage/")');
    expect(publicFiles).toContain("IM SELECTED");
    expect(publicFiles).toContain("Ex.: IM-2026-001");
    expect(publicFiles).toContain("Olá, IAGO MODAS!");
    expect(publicFiles).toContain("whitespace-nowrap text-[10px]");
    expect(publicFiles).not.toContain("OVERSIZED MODAS");
    expect(publicFiles).not.toContain("Logo OM");
    expect(publicFiles).not.toContain("OM SELECTED");
    expect(publicFiles).not.toContain("Ex.: OM-2026-001");
  });
});
