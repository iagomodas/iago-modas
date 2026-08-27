-- Post-migration cleanup: close advisory findings without changing the public storefront contract.

-- These credential tables are intentionally server-only. They are present in the
-- current production database, but may not exist in a fresh checkout because the
-- original live-only credential migrations were not part of this repository.
do $$
begin
  if to_regclass('public.future_integration_credentials') is not null then
    execute 'drop policy if exists "future integration credentials: no client access" on public.future_integration_credentials';
    execute 'create policy "future integration credentials: no client access" on public.future_integration_credentials for all to anon, authenticated using (false) with check (false)';
  end if;

  if to_regclass('public.store_integration_credentials') is not null then
    execute 'drop policy if exists "store integration credentials: no client access" on public.store_integration_credentials';
    execute 'create policy "store integration credentials: no client access" on public.store_integration_credentials for all to anon, authenticated using (false) with check (false)';
  end if;
end
$$;

-- Trigger/event-trigger functions are not API operations. Their owners and database
-- triggers remain able to execute them, but browser roles cannot invoke them directly.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

-- The admin check is still needed by authenticated RLS/Storage policies. Public
-- catalog reads get a separate anon policy below, so anon does not need this RPC.
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "products: public may read active catalog" on public.products;
create policy "products: public may read active catalog"
on public.products
for select
to anon
using (is_active = true);

drop policy if exists "products: authenticated may read catalog" on public.products;
create policy "products: authenticated may read catalog"
on public.products
for select
to authenticated
using (is_active = true or (select public.is_admin()));

-- Fix the only mutable search_path function reported by the security advisor.
alter function public.assign_iago_owner_admin() set search_path = pg_catalog, public;

-- Consolidate equivalent SELECT policies into one policy per role/action. This
-- preserves the previous customer/admin predicates while avoiding duplicate RLS
-- evaluation and caches auth.uid() once per statement.
drop policy if exists "profiles: user may read own profile" on public.profiles;
drop policy if exists "profiles: admin may read all profiles" on public.profiles;
create policy "profiles: user or admin may read"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id or (select public.is_admin()));

drop policy if exists "orders: customer may read own visible" on public.orders;
drop policy if exists "orders: admin may read" on public.orders;
create policy "orders: customer or admin may read"
on public.orders
for select
to authenticated
using (
  (customer_user_id = (select auth.uid()) and customer_hidden_at is null)
  or (select public.is_admin())
);

drop policy if exists "order items: customer may read own order items" on public.order_items;
drop policy if exists "order items: admin may read" on public.order_items;
create policy "order items: customer or admin may read"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.customer_user_id = (select auth.uid())
  )
  or (select public.is_admin())
);

-- Cover foreign keys used by credential cleanup and order/item joins. These tables
-- may be live-only, so create those indexes only when their parent table exists.
do $$
begin
  if to_regclass('public.future_integration_credentials') is not null then
    execute 'create index if not exists future_integration_credentials_configured_by_idx on public.future_integration_credentials (configured_by)';
  end if;

  execute 'create index if not exists order_items_product_id_idx on public.order_items (product_id)';
end
$$;
