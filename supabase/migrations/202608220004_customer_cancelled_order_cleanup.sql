-- IAGO MODAS: o cliente pode remover da própria tela somente o histórico cancelado.
-- O pedido não é apagado do banco: o dono continua vendo o registro no painel.
-- Pedidos ativos, pagos ou enviados continuam protegidos.

alter table public.orders
  add column if not exists customer_hidden_at timestamptz;

drop policy if exists "orders: customer may read own" on public.orders;
create policy "orders: customer may read own visible"
on public.orders
for select
to authenticated
using (customer_user_id = auth.uid() and customer_hidden_at is null);

create or replace function public.delete_own_cancelled_order(p_order_id bigint)
returns table (order_id bigint, order_number text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_order public.orders%rowtype;
begin
  if auth.uid() is null then
    raise exception 'É necessário entrar com Google para apagar este histórico';
  end if;

  select * into target_order
  from public.orders
  where id = p_order_id
    and customer_user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Pedido não encontrado na sua conta';
  end if;

  if target_order.payment_status <> 'cancelled'
    and lower(coalesce(target_order.order_status, '')) <> 'cancelled' then
    raise exception 'Somente pedidos cancelados podem ser removidos do seu histórico';
  end if;

  update public.orders
  set customer_hidden_at = now()
  where id = target_order.id
    and customer_user_id = auth.uid()
    and (payment_status = 'cancelled' or lower(coalesce(order_status, '')) = 'cancelled');

  return query select target_order.id, target_order.order_number;
end;
$$;

revoke all on function public.delete_own_cancelled_order(bigint) from public, anon;
grant execute on function public.delete_own_cancelled_order(bigint) to authenticated;
