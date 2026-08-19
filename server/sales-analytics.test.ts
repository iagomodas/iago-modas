import { describe, expect, it } from "vitest";
import { buildSalesAnalytics, isConfirmedSale } from "../client/src/lib/salesAnalytics";
import type { SupabaseOrder } from "../client/src/lib/supabaseTypes";

const order = (overrides: Partial<SupabaseOrder>): SupabaseOrder => ({ id: 1, order_number: "IM-01", customer_name: "Cliente", payment_status: "pending", total_cents: 10000, created_at: "2026-08-19T12:00:00.000Z", ...overrides });

describe("indicadores de vendas reais", () => {
  it("considera vendas confirmadas por pagamento ou etapa operacional", () => {
    expect(isConfirmedSale(order({ payment_status: "approved" }))).toBe(true);
    expect(isConfirmedSale(order({ order_status: "paid" }))).toBe(true);
    expect(isConfirmedSale(order({ payment_status: "pending", order_status: "awaiting_pix" }))).toBe(false);
  });

  it("calcula dia, semana, mês e pendências sem incluir pedido ainda não confirmado como venda", () => {
    const now = new Date("2026-08-19T15:00:00.000Z");
    const analytics = buildSalesAnalytics([
      order({ id: 1, total_cents: 10000, payment_status: "approved", created_at: "2026-08-19T12:00:00.000Z" }),
      order({ id: 2, total_cents: 20000, order_status: "paid", created_at: "2026-08-18T12:00:00.000Z" }),
      order({ id: 3, total_cents: 30000, payment_status: "pending", created_at: "2026-08-19T13:00:00.000Z" }),
      order({ id: 4, total_cents: 40000, payment_status: "approved", created_at: "2026-08-03T12:00:00.000Z" }),
    ], now);
    expect(analytics.confirmedTodayCents).toBe(10000);
    expect(analytics.confirmedWeekCents).toBe(30000);
    expect(analytics.confirmedMonthCents).toBe(70000);
    expect(analytics.pendingCount).toBe(1);
    expect(analytics.receivedToday).toBe(2);
    expect(analytics.trend).toHaveLength(7);
  });
});
