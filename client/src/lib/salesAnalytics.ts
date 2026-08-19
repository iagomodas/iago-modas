import type { SupabaseOrder } from "@/lib/supabaseTypes";

export type SalesPoint = { label: string; totalCents: number; orderCount: number };

export type SalesAnalytics = {
  confirmedTodayCents: number;
  confirmedWeekCents: number;
  confirmedMonthCents: number;
  receivedToday: number;
  pendingCount: number;
  confirmedCount: number;
  trend: SalesPoint[];
};

const confirmedOperationalStatuses = new Set(["paid", "ready_to_post", "shipped"]);

export function isConfirmedSale(order: Pick<SupabaseOrder, "payment_status" | "order_status">) {
  return order.payment_status === "approved" || confirmedOperationalStatuses.has(order.order_status ?? "");
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSameLocalDay(value: Date, target: Date) {
  return value.getFullYear() === target.getFullYear() && value.getMonth() === target.getMonth() && value.getDate() === target.getDate();
}

export function buildSalesAnalytics(orders: SupabaseOrder[], now = new Date()): SalesAnalytics {
  const today = startOfDay(now);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const trendDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return { date, label: new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", "") };
  });

  const confirmed = orders.filter(isConfirmedSale);
  const sumWithin = (from: Date) => confirmed.filter((order) => new Date(order.created_at) >= from).reduce((total, order) => total + order.total_cents, 0);

  return {
    confirmedTodayCents: confirmed.filter((order) => isSameLocalDay(new Date(order.created_at), today)).reduce((total, order) => total + order.total_cents, 0),
    confirmedWeekCents: sumWithin(weekStart),
    confirmedMonthCents: sumWithin(monthStart),
    receivedToday: orders.filter((order) => isSameLocalDay(new Date(order.created_at), today)).length,
    pendingCount: orders.filter((order) => !isConfirmedSale(order) && order.payment_status === "pending").length,
    confirmedCount: confirmed.length,
    trend: trendDays.map(({ date, label }) => {
      const matching = confirmed.filter((order) => isSameLocalDay(new Date(order.created_at), date));
      return { label, totalCents: matching.reduce((total, order) => total + order.total_cents, 0), orderCount: matching.length };
    }),
  };
}
