import type { SupabaseOrder } from "@/lib/supabaseTypes";

type OrderDeletionCandidate = Pick<
  SupabaseOrder,
  "payment_status" | "order_status"
>;

export type CustomerOrderSummary = {
  customerKey: string;
  customerName: string;
  latestOrder: SupabaseOrder;
  orderCount: number;
  totalCents: number;
};

export function canPermanentlyDeleteOrder(
  order: OrderDeletionCandidate,
): boolean {
  return (
    order.payment_status === "cancelled" ||
    order.order_status === "cancelled"
  );
}

function customerOrderKey(order: SupabaseOrder): string {
  if (order.customer_user_id?.trim()) return `user:${order.customer_user_id.trim()}`;
  return `name:${order.customer_name.trim().toLocaleLowerCase("pt-BR")}`;
}

export function groupActiveOrdersByCustomer(
  orders: SupabaseOrder[],
): CustomerOrderSummary[] {
  const byCustomer = new Map<string, CustomerOrderSummary>();

  for (const order of orders) {
    if (order.payment_status === "cancelled" || order.order_status === "cancelled") {
      continue;
    }
    const key = customerOrderKey(order);
    const existing = byCustomer.get(key);
    if (!existing) {
      byCustomer.set(key, {
        customerKey: key,
        customerName: order.customer_name,
        latestOrder: order,
        orderCount: 1,
        totalCents: order.total_cents,
      });
      continue;
    }

    existing.orderCount += 1;
    existing.totalCents += order.total_cents;
    if (new Date(order.created_at).getTime() > new Date(existing.latestOrder.created_at).getTime()) {
      existing.latestOrder = order;
      existing.customerName = order.customer_name;
    }
  }

  return Array.from(byCustomer.values()).sort(
    (left, right) =>
      new Date(right.latestOrder.created_at).getTime() -
      new Date(left.latestOrder.created_at).getTime(),
  );
}
