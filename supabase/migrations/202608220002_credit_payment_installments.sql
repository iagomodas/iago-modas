-- Permite registrar a escolha de maquininha no pedido; a cobrança é combinada presencialmente com a loja.
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
language plpgsql security definer set search_path = '' as $$
declare created record;
begin
  if auth.uid() is null then raise exception 'É necessário entrar com Google para enviar o pedido'; end if;
  if p_delivery_mode not in ('local', 'city_delivery', 'correios') then raise exception 'Modalidade de entrega inválida'; end if;
  if p_payment_method not in ('pix', 'cash', 'credit') then raise exception 'Forma de pagamento inválida'; end if;
  if p_delivery_mode = 'correios' and p_payment_method <> 'pix' then raise exception 'Para pedidos pelos Correios, escolha Pix'; end if;
  if char_length(trim(p_customer_name)) < 2 then raise exception 'Informe seu nome completo'; end if;
  if p_delivery_mode = 'correios' and (char_length(trim(p_postal_code)) < 8 or char_length(trim(p_address)) < 3 or char_length(trim(p_delivery_number)) < 1 or char_length(trim(p_delivery_city)) < 2 or char_length(trim(p_delivery_state)) <> 2) then
    raise exception 'Complete o endereço para postagem pelos Correios';
  end if;
  select * into created from public.create_checkout_order(
    trim(p_customer_name), lower(trim(p_customer_email)), trim(p_customer_phone),
    coalesce(nullif(trim(p_postal_code), ''), '00000000'),
    coalesce(nullif(trim(p_address), ''), 'Retirada/combinação pelo atendimento'),
    p_payment_method::public.payment_method, p_items
  );
  update public.orders set
    delivery_mode = p_delivery_mode, delivery_number = nullif(trim(p_delivery_number), ''),
    delivery_complement = nullif(trim(p_delivery_complement), ''), delivery_neighborhood = nullif(trim(p_delivery_neighborhood), ''),
    delivery_city = nullif(trim(p_delivery_city), ''), delivery_state = nullif(upper(trim(p_delivery_state)), ''),
    order_status = 'awaiting_freight'
  where id = created.order_id;
  return query select created.order_id, created.order_number, created.total_cents;
end;
$$;

revoke all on function public.create_manual_delivery_order(text, text, text, text, text, text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.create_manual_delivery_order(text, text, text, text, text, text, text, text, text, text, text, text, jsonb) to authenticated;


-- A migration de hardening anterior aceitava apenas pix/cash. Reaplicar a função
-- com a mesma lógica, liberando credit para a opção de maquininha.
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
  calculated_total integer := 0;
  item_size text;
  item_quantity integer;
  signed_in_email text;
begin
  if auth.uid() is null then
    raise exception 'É necessário entrar com Google para enviar o pedido';
  end if;

  signed_in_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  if signed_in_email = '' or lower(trim(p_customer_email)) <> signed_in_email then
    raise exception 'O e-mail do pedido deve corresponder à conta conectada';
  end if;

  if p_payment_method::text not in ('pix', 'cash', 'credit') then
    raise exception 'Esta forma de pagamento ainda não está habilitada';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'O carrinho não pode estar vazio';
  end if;

  if char_length(trim(p_customer_name)) < 2
    or char_length(trim(p_customer_phone)) < 8
    or char_length(trim(p_postal_code)) < 8
    or char_length(trim(p_address)) < 5 then
    raise exception 'Dados do cliente inválidos';
  end if;

  for requested in
    select (value ->> 'productId')::bigint as product_id,
           sum((value ->> 'quantity')::integer) as quantity
    from jsonb_array_elements(p_items)
    group by (value ->> 'productId')::bigint
  loop
    select * into product_row
    from public.products
    where id = requested.product_id and is_active = true
    for share;

    if not found then
      raise exception 'Um dos produtos selecionados não está disponível';
    end if;

    if requested.quantity is null or requested.quantity < 1 or requested.quantity > product_row.stock then
      raise exception 'A quantidade solicitada não está disponível em estoque';
    end if;
  end loop;

  created_order_number := 'IM-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    order_number, customer_user_id, customer_name, customer_email, customer_phone,
    postal_code, address, payment_method, payment_status, total_cents
  ) values (
    created_order_number, auth.uid(), trim(p_customer_name), signed_in_email, trim(p_customer_phone),
    trim(p_postal_code), trim(p_address), p_payment_method, 'pending', 0
  ) returning id into created_order_id;

  for requested_item in select value from jsonb_array_elements(p_items)
  loop
    item_size := trim(requested_item.value ->> 'size');
    item_quantity := (requested_item.value ->> 'quantity')::integer;

    select * into product_row
    from public.products
    where id = (requested_item.value ->> 'productId')::bigint and is_active = true;

    if item_size is null or item_size = '' or not (product_row.sizes ? item_size) then
      raise exception 'O tamanho selecionado não está disponível para este produto';
    end if;

    insert into public.order_items (order_id, product_id, product_name, size, unit_price_cents, quantity)
    values (created_order_id, product_row.id, product_row.name, item_size, product_row.price_cents, item_quantity);

    calculated_total := calculated_total + (product_row.price_cents * item_quantity);
  end loop;

  update public.orders set total_cents = calculated_total where id = created_order_id;
  return query select created_order_id, created_order_number, calculated_total;
end;
$$;

revoke all on function public.create_checkout_order(text, text, text, text, text, public.payment_method, jsonb) from public, anon;
grant execute on function public.create_checkout_order(text, text, text, text, text, public.payment_method, jsonb) to authenticated;
