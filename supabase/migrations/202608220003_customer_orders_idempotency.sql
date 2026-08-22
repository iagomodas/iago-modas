-- IAGO MODAS: histórico do cliente, cancelamento próprio e proteção contra pedidos duplicados.

alter table public.orders
  add column if not exists checkout_request_token text;

create unique index if not exists orders_customer_checkout_request_token_idx
  on public.orders (customer_user_id, checkout_request_token)
  where checkout_request_token is not null;

create policy "orders: customer may read own"
on public.orders
for select
to authenticated
using (customer_user_id = auth.uid());

create policy "order items: customer may read own order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where public.orders.id = order_items.order_id
      and public.orders.customer_user_id = auth.uid()
  )
);

create or replace function public.create_manual_delivery_order_once(
  p_request_token text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_delivery_mode text,
  p_postal_code text,
  p_address text,
  p_delivery_number text,
  p_delivery_complement text,
  p_delivery_neighborhood text,
  p_delivery_city text,
  p_delivery_state text,
  p_payment_method text,
  p_items jsonb
)
returns table (order_id bigint, order_number text, total_cents integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_token text;
  existing_order public.orders%rowtype;
  created_order record;
begin
  if auth.uid() is null then
    raise exception 'É necessário entrar com Google para enviar o pedido';
  end if;

  normalized_token := nullif(trim(p_request_token), '');
  if normalized_token is null or char_length(normalized_token) > 120 then
    raise exception 'Identificador do pedido inválido';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(auth.uid()::text || ':' || normalized_token, 0)
  );

  select * into existing_order
  from public.orders
  where customer_user_id = auth.uid()
    and checkout_request_token = normalized_token
  limit 1;

  if found then
    return query select existing_order.id, existing_order.order_number, existing_order.total_cents;
    return;
  end if;

  select * into created_order
  from public.create_manual_delivery_order(
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_delivery_mode,
    p_postal_code,
    p_address,
    p_delivery_number,
    p_delivery_complement,
    p_delivery_neighborhood,
    p_delivery_city,
    p_delivery_state,
    p_payment_method,
    p_items
  );

  update public.orders
  set checkout_request_token = normalized_token
  where id = created_order.order_id
    and customer_user_id = auth.uid();

  return query select created_order.order_id, created_order.order_number, created_order.total_cents;
end;
$$;

revoke all on function public.create_manual_delivery_order_once(text, text, text, text, text, text, text, text, text, text, text, text, text, jsonb) from public, anon;
grant execute on function public.create_manual_delivery_order_once(text, text, text, text, text, text, text, text, text, text, text, text, text, jsonb) to authenticated;

create or replace function public.cancel_own_order(p_order_id bigint)
returns table (order_id bigint, order_number text, order_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_order public.orders%rowtype;
  next_status text;
begin
  if auth.uid() is null then
    raise exception 'É necessário entrar com Google para cancelar o pedido';
  end if;

  select * into current_order
  from public.orders
  where id = p_order_id
    and customer_user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Pedido não encontrado na sua conta';
  end if;

  if current_order.payment_status = 'approved'
    or lower(coalesce(current_order.order_status, '')) in ('shipped', 'posted', 'delivered') then
    raise exception 'Este pedido já está em processamento e precisa ser cancelado pelo atendimento da loja';
  end if;

  next_status := 'cancelled';
  update public.orders
  set order_status = next_status,
      payment_status = 'cancelled'
  where id = current_order.id;

  return query select current_order.id, current_order.order_number, next_status;
end;
$$;

revoke all on function public.cancel_own_order(bigint) from public, anon;
grant execute on function public.cancel_own_order(bigint) to authenticated;
