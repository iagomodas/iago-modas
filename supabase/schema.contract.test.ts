import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("./migrations/202608150001_overzied_modas.sql", import.meta.url),
  "utf8",
);

describe("Supabase schema contract", () => {
  it("protects exposed data with RLS and administrative policies", () => {
    expect(migration).toContain("alter table public.profiles enable row level security");
    expect(migration).toContain("alter table public.products enable row level security");
    expect(migration).toContain("alter table public.orders enable row level security");
    expect(migration).toContain("alter table public.order_items enable row level security");
    expect(migration).toContain("create policy \"products: admin may insert\"");
    expect(migration).toContain("create policy \"orders: admin may read and update\"");
  });

  it("creates checkout orders in the database and keeps the weekly check internal", () => {
    expect(migration).toContain("create or replace function public.create_checkout_order");
    expect(migration).toContain("calculated_total");
    expect(migration).toContain("create or replace function app_private.record_project_heartbeat");
    expect(migration).toContain("select cron.schedule(");
    expect(migration).not.toContain("service_role");
  });
});
