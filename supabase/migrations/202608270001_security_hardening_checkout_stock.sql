-- Hardening do checkout manual: limites, cota, idempotência e reserva atômica de estoque.
-- A única RPC exposta ao frontend continua sendo create_manual_delivery_order_once.

alter table public.products
  drop constraint if exists products_price_cents_reasonable,
  add constraint products_price_cents_reasonable check (price_cents between 0 and 100000000),
  drop constraint if exists products_stock_reasonable,
  add constraint products_stock_reasonable check (stock between 0 and 100000);

alter table public.orders
  add column if not exists stock_reserved boolean not null default false,
  add column if not exists stock_reserved_at timestamptz,
  add column if not exists stock_released_at timestamptz;

create index if not exists orders_customer_user_id_idx
  on public.orders (customer_user_id, created_at desc);

create table if not exists app_private.checkout_rate_limits (
  customer_user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  submission_count integer not null default 0 check (submission_count >= 0)
);

revoke all on table app_private.checkout_rate_limits from public, anon, authenticated;

create or replace function app_private.consume_checkout_submission_slot(p_customer_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_limit record;
  current_time timestamptz := now();
begin
  insert into app_private.checkout_rate_limits (customer_user_id, window_started_at, submission_count)
  values (p_customer_user_id, current_time, 0)
  on conflict (customer_user_id) do nothing;

  select window_started_at, submission_count
    into current_limit
  from app_private.checkout_rate_limits
  where customer_user_id = p_customer_user_id
  for update;

  if current_limit.window_started_at <= current_time - interval '10 minutes' then
    update app_private.checkout_rate_limits
    set window_started_at = current_time, submission_count = 1
    where customer_user_id = p_customer_user_id;
    return true;
  end if;

  if current_limit.submission_count >= 10 then
    return false;
  end if;

  update app_private.checkout_rate_limits
  set submission_count = submission_count + 1
  where customer_user_id = p_customer_user_id;
  return true;
end;
$$;

revoke all on function app_private.consume_checkout_submission_slot(uuid) from public, anon, authenticated;

create or replace function public.create_checkout_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_postal_code text,
  p_address text,
  p_payment_method public.payment_method,
  p_items jsonb
)
returns table (order_id bigint, order_number text, total_cents integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested record;
  requested_item record;
  product_row public.products%rowtype;
  created_order_id bigint;
  created_order_number text;
  calculated_total bigint := 0;
  item_size text;
  item_quantity integer;
  signed_in_email text;
  total_requested_quantity integer := 0;
begin
  if auth.uid() is null then
    raise exception 'É necessário entrar com Google para enviar o pedido';
  end if;

  signed_in_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if signed_in_email = '' or char_length(signed_in_email) > 320 or lower(trim(coalesce(p_customer_email, ''))) <> signed_in_email then
    raise exception 'O e-mail do pedido deve corresponder à conta conectada';
  end if;

  if p_payment_method::text not in ('pix', 'cash', 'credit') then
    raise exception 'Esta forma de pagamento ainda não está habilitada';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 30 or char_length(p_items::text) > 20000 then
    raise exception 'O carrinho excede o limite permitido';
  end if;

  if p_customer_name is null or char_length(trim(p_customer_name)) not between 2 and 180
    or p_customer_phone is null or char_length(trim(p_customer_phone)) not between 8 and 32
    or p_postal_code is null or char_length(trim(p_postal_code)) not between 8 and 16
    or p_address is null or char_length(trim(p_address)) not between 5 and 2000 then
    raise exception 'Dados do cliente inválidos';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item(value)
    where jsonb_typeof(item.value) <> 'object'
      or coalesce(item.value ->> 'productId', '') !~ '^[0-9]+$'
      or coalesce(item.value ->> 'quantity', '') !~ '^[1-9][0-9]{0,2}$'
      or char_length(coalesce(item.value ->> 'size', '')) not between 1 and 32
  ) then
    raise exception 'Itens do carrinho inválidos';
  end if;

  select coalesce(sum((value ->> 'quantity')::integer), 0)
    into total_requested_quantity
  from jsonb_array_elements(p_items);

  if total_requested_quantity > 100 then
    raise exception 'A quantidade total do carrinho excede o limite permitido';
  end if;

  -- Locks sempre em ordem crescente de produto para reduzir deadlocks entre pedidos concorrentes.
  for requested in
    select (value ->> 'productId')::bigint as product_id,
           sum((value ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items)
    group by (value ->> 'productId')::bigint
    order by product_id
  loop
    select * into product_row
    from public.products
    where id = requested.product_id and is_active = true
    for update;

    if not found then
      raise exception 'Um dos produtos selecionados não está disponível';
    end if;

    if requested.quantity < 1 or requested.quantity > product_row.stock then
      raise exception 'A quantidade solicitada não está disponível em estoque';
    end if;
  end loop;

  created_order_number := 'IM-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    order_number, customer_user_id, customer_name, customer_email, customer_phone,
    postal_code, address, payment_method, payment_status, total_cents,
    stock_reserved, stock_reserved_at
  ) values (
    created_order_number, auth.uid(), trim(p_customer_name), signed_in_email, trim(p_customer_phone),
    trim(p_postal_code), trim(p_address), p_payment_method, 'pending', 0,
    true, now()
  ) returning id into created_order_id;

  for requested_item in select value from jsonb_array_elements(p_items)
  loop
    item_size := trim(requested_item.value ->> 'size');
    item_quantity := (requested_item.value ->> 'quantity')::integer;

    select * into product_row
    from public.products
    where id = (requested_item.value ->> 'productId')::bigint and is_active = true
    for update;

    if not found or item_size is null or item_size = '' or not (product_row.sizes ? item_size) then
      raise exception 'O tamanho selecionado não está disponível para este produto';
    end if;

    calculated_total := calculated_total + (product_row.price_cents::bigint * item_quantity::bigint);
    if calculated_total > 2147483647 then
      raise exception 'O valor total do pedido excede o limite permitido';
    end if;

    insert into public.order_items (order_id, product_id, product_name, size, unit_price_cents, quantity)
    values (created_order_id, product_row.id, product_row.name, item_size, product_row.price_cents, item_quantity);
  end loop;

  if calculated_total < 0 then
    raise exception 'Valor total inválido';
  end if;

  for requested in
    select (value ->> 'productId')::bigint as product_id,
           sum((value ->> 'quantity')::integer)::integer as quantity
    from jsonb_array_elements(p_items)
    group by (value ->> 'productId')::bigint
    order by product_id
  loop
    update public.products
    set stock = stock - requested.quantity
    where id = requested.product_id and is_active = true and stock >= requested.quantity;
    if not found then
      raise exception 'O estoque mudou enquanto o pedido era criado; tente novamente';
    end if;
  end loop;

  update public.orders
  set total_cents = calculated_total
  where id = created_order_id;

  return query select created_order_id, created_order_number, calculated_total::integer;
end;
$$;

-- A função sem token não deve ser chamável diretamente por clientes; ela é helper interno.
revoke all on function public.create_checkout_order(text, text, text, text, text, public.payment_method, jsonb) from public, anon, authenticated;

create or replace function public.create_manual_delivery_order(
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
  created record;
  normalized_address text;
  normalized_postal_code text;
begin
  if p_delivery_mode not in ('local', 'city_delivery', 'correios') then
    raise exception 'Modalidade de entrega inválida';
  end if;
  if p_payment_method not in ('pix', 'cash', 'credit') then
    raise exception 'Forma de pagamento inválida';
  end if;
  if p_delivery_mode = 'correios' and p_payment_method <> 'pix' then
    raise exception 'Para pedidos pelos Correios, escolha Pix';
  end if;

  if char_length(coalesce(p_delivery_number, '')) > 40
    or char_length(coalesce(p_delivery_complement, '')) > 200
    or char_length(coalesce(p_delivery_neighborhood, '')) > 120
    or char_length(coalesce(p_delivery_city, '')) > 120
    or char_length(coalesce(p_delivery_state, '')) > 2 then
    raise exception 'Dados de entrega inválidos';
  end if;

  normalized_postal_code := coalesce(nullif(trim(p_postal_code), ''), '00000000');
  normalized_address := coalesce(nullif(trim(p_address), ''), 'Retirada/combinação pelo atendimento');

  if p_delivery_mode = 'correios' and (
    char_length(normalized_postal_code) <> 8
    or normalized_postal_code !~ '^[0-9]{8}$'
    or char_length(normalized_address) < 3
    or char_length(trim(coalesce(p_delivery_number, ''))) < 1
    or char_length(trim(coalesce(p_delivery_city, ''))) < 2
    or char_length(trim(coalesce(p_delivery_state, ''))) <> 2
  ) then
    raise exception 'Complete o endereço para postagem pelos Correios';
  end if;

  select * into created from public.create_checkout_order(
    trim(p_customer_name), lower(trim(p_customer_email)), trim(p_customer_phone),
    normalized_postal_code, normalized_address,
    p_payment_method::public.payment_method, p_items
  );

  update public.orders set
    delivery_mode = p_delivery_mode,
    delivery_number = nullif(trim(p_delivery_number), ''),
    delivery_complement = nullif(trim(p_delivery_complement), ''),
    delivery_neighborhood = nullif(trim(p_delivery_neighborhood), ''),
    delivery_city = nullif(trim(p_delivery_city), ''),
    delivery_state = nullif(upper(trim(p_delivery_state)), ''),
    order_status = 'awaiting_freight'
  where id = created.order_id;

  return query select created.order_id, created.order_number, created.total_cents;
end;
$$;

revoke all on function public.create_manual_delivery_order(text, text, text, text, text, text, text, text, text, text, text, text, jsonb) from public, anon, authenticated;

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
  if normalized_token is null or char_length(normalized_token) not between 16 and 120 or normalized_token !~ '^[A-Za-z0-9-]+$' then
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

  if not app_private.consume_checkout_submission_slot(auth.uid()) then
    raise exception 'Limite temporário de pedidos atingido; tente novamente mais tarde';
  end if;

  select * into created_order from public.create_manual_delivery_order(
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

create or replace function public.release_reserved_stock_on_order_terminal_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  item record;
begin
  if old.stock_reserved
    and (
      new.payment_status in ('cancelled', 'rejected')
      or lower(coalesce(new.order_status, '')) = 'cancelled'
    ) then
    for item in
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = old.id
      group by product_id
    loop
      update public.products
      set stock = stock + item.quantity
      where id = item.product_id;
    end loop;

    new.stock_reserved := false;
    new.stock_released_at := coalesce(new.stock_released_at, now());
  end if;

  return new;
end;
$$;

revoke all on function public.release_reserved_stock_on_order_terminal_status() from public, anon, authenticated;

drop trigger if exists orders_release_reserved_stock_before_update on public.orders;
create trigger orders_release_reserved_stock_before_update
before update on public.orders
for each row execute function public.release_reserved_stock_on_order_terminal_status();

-- Redefinição explícita para manter a autorização e a proteção contra cancelamento indevido.
create or replace function public.cancel_own_order(p_order_id bigint)
returns table (order_id bigint, order_number text, order_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_order public.orders%rowtype;
  next_status text := 'cancelled';
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

  update public.orders
  set order_status = next_status,
      payment_status = 'cancelled'
  where id = current_order.id;

  return query select current_order.id, current_order.order_number, next_status;
end;
$$;

revoke all on function public.cancel_own_order(bigint) from public, anon;
grant execute on function public.cancel_own_order(bigint) to authenticated;


create or replace function app_private.expire_stale_reserved_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  expired_count integer := 0;
  target_order record;
begin
  for target_order in
    select id
    from public.orders
    where stock_reserved = true
      and payment_status = 'pending'
      and lower(coalesce(order_status, '')) in ('awaiting_freight', 'awaiting_pix', 'pending')
      and coalesce(stock_reserved_at, created_at) < now() - interval '48 hours'
    order by id
    for update skip locked
  loop
    update public.orders
    set payment_status = 'cancelled',
        order_status = 'cancelled'
    where id = target_order.id;
    expired_count := expired_count + 1;
  end loop;

  return expired_count;
end;
$$;

revoke all on function app_private.expire_stale_reserved_orders() from public, anon, authenticated;

-- Agenda na mesma rotina interna existente, sem expor HTTP ou credenciais.
select cron.schedule(
  'iago-modas-expire-stale-orders',
  '17 * * * *',
  $$select app_private.expire_stale_reserved_orders();$$
)
where not exists (
  select 1
  from cron.job
  where jobname = 'iago-modas-expire-stale-orders'
);
