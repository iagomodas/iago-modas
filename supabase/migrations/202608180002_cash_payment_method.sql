-- Adiciona pagamento em dinheiro para retirada e entrega local, mantendo Pix para pedidos pelos Correios.
alter type public.payment_method add value if not exists 'cash';

drop function if exists public.create_manual_delivery_order(text, text, text, text, text, text, text, text, text, text, text, jsonb);

create function public.create_manual_delivery_order(
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
  if p_payment_method not in ('pix', 'cash') then raise exception 'Forma de pagamento inválida'; end if;
  if p_delivery_mode = 'correios' and p_payment_method <> 'pix' then raise exception 'Para pedidos pelos Correios, escolha Pix'; end if;
  if char_length(trim(p_customer_name)) < 2 then raise exception 'Informe seu nome completo'; end if;
  if p_delivery_mode = 'correios' and (char_length(trim(p_postal_code)) < 8 or char_length(trim(p_address)) < 3 or char_length(trim(p_delivery_number)) < 1 or char_length(trim(p_delivery_city)) < 2 or char_length(trim(p_delivery_state)) <> 2) then
    raise exception 'Complete o endereço para postagem pelos Correios';
  end if;
  select * into created from public.create_checkout_order(
    trim(p_customer_name), lower(trim(p_customer_email)), trim(p_customer_phone),
    coalesce(nullif(trim(p_postal_code), ''), '00000000'),
    coalesce(nullif(trim(p_address), ''), 'Retirada/combinação pelo Instagram'),
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
