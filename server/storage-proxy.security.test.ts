import { describe, expect, it } from "vitest";
import { getSafePublicStorageKey } from "./_core/storageProxy";

describe("storage proxy security", () => {
  const publicPrefixes = ["product-gallery/", "storefront-branding/"];

  it("accepts only explicitly allow-listed public prefixes", () => {
    expect(getSafePublicStorageKey("product-gallery/look.webp", publicPrefixes)).toBe(
      "product-gallery/look.webp",
    );
    expect(getSafePublicStorageKey("customer-profile-photos/user/photo.webp", publicPrefixes)).toBeNull();
    expect(getSafePublicStorageKey("private/secret.txt", publicPrefixes)).toBeNull();
  });

  it("rejects traversal, alternate separators and URL fragments", () => {
    expect(getSafePublicStorageKey("product-gallery/../private/secret.txt", publicPrefixes)).toBeNull();
    expect(getSafePublicStorageKey("product-gallery\\private\\secret.txt", publicPrefixes)).toBeNull();
    expect(getSafePublicStorageKey("product-gallery/look.webp?download=1", publicPrefixes)).toBeNull();
    expect(getSafePublicStorageKey("product-gallery/look.webp#fragment", publicPrefixes)).toBeNull();
    expect(getSafePublicStorageKey("/product-gallery/look.webp", publicPrefixes)).toBeNull();
  });

  it("rejects empty segments and oversized keys", () => {
    expect(getSafePublicStorageKey("product-gallery//look.webp", publicPrefixes)).toBeNull();
    expect(getSafePublicStorageKey("product-gallery/./look.webp", publicPrefixes)).toBeNull();
    expect(getSafePublicStorageKey(`product-gallery/${"a".repeat(510)}`, publicPrefixes)).toBeNull();
  });
});
