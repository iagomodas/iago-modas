import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const checkoutSource = readFileSync(resolve(import.meta.dirname, "../client/src/pages/CheckoutPage.tsx"), "utf8");
const manualOrderMigration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/202608170003_manual_delivery_orders.sql"), "utf8");
const baseOrderMigration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/202608150001_overzied_modas.sql"), "utf8");

describe("contrato de itens do pedido manual", () => {
  it("envia productId no checkout, exatamente como a função de criação de pedido lê", () => {
    expect(checkoutSource).toContain("({ productId: item.id, size: item.size, quantity: item.quantity })");
    expect(checkoutSource).not.toContain("({ product_id: item.id, size: item.size, quantity: item.quantity })");
    expect(manualOrderMigration).toContain("p_items jsonb");
    expect(baseOrderMigration).toContain("value ->> 'productId'");
  });
});
