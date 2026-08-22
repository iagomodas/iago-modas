-- IAGO MODAS: impede apagar pedidos ativos pelo painel.
-- A política antiga era FOR ALL e, por isso, também permitia DELETE de qualquer pedido.

drop policy if exists "orders: admin may read and update" on public.orders;

alter table public.orders
  enable row level security;

create policy "orders: admin may read"
on public.orders for select to authenticated
using ((select public.is_admin()));

create policy "orders: admin may update"
on public.orders for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "orders: admin may delete cancelled"
on public.orders for delete to authenticated
using (
  (select public.is_admin())
  and (payment_status = 'cancelled' or order_status = 'cancelled')
);

revoke all on public.orders from anon;
revoke all on public.orders from authenticated;
grant select, update, delete on public.orders to authenticated;

-- A política RLS acima continua sendo a autoridade: DELETE só passa quando
-- payment_status ou order_status estiver marcado como cancelled.
