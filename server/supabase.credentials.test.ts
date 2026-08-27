import { describe, expect, it } from "vitest";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const hasSupabaseConfig = Boolean(url && key);

describe("credenciais públicas do Supabase", () => {
  it.skipIf(!hasSupabaseConfig)("alcança o endpoint REST com a chave pública configurada", async () => {
    expect(url).toMatch(/^https:\/\/[^/]+\.supabase\.co$/);
    expect(key).toBeTruthy();

    const headers = { apikey: key!, Authorization: `Bearer ${key!}` };
    const productsResponse = await fetch(`${url}/rest/v1/products?select=id&limit=1`, { headers });
    const settingsResponse = await fetch(`${url}/rest/v1/storefront_settings?select=id&limit=1`, { headers });

    expect(productsResponse.status).toBe(200);
    expect(settingsResponse.status).toBe(200);
  }, 15000);
});
