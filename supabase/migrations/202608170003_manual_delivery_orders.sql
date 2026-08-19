-- Pedidos por Instagram e Pix Nubank: sem cotação ou cobrança de frete no site.
alter table public.orders
  add column if not exists delivery_mode text not null default 'local',
  add column if not exists delivery_city text,
  add column if not exists delivery_state text,
  add column if not exists delivery_neighborhood text,
  add column if not exists delivery_number text,
  add column if not exists delivery_complement text,
  add column if not exists order_status text not null default 'awaiting_freight',
  add column if not exists tracking_code text;

alter table public.orders
  drop constraint if exists orders_delivery_mode_check,
  add constraint orders_delivery_mode_check check (delivery_mode in ('local', 'city_delivery', 'correios'));

alter table public.orders
  drop constraint if exists orders_order_status_check,
  add constraint orders_order_status_check check (order_status in ('awaiting_freight', 'freight_informed', 'awaiting_pix', 'paid', 'ready_to_post', 'shipped', 'cancelled'));

alter table public.storefront_settings
  add column if not exists local_city text not null default 'Joaquim Gomes',
  add column if not exists local_state text not null default 'AL',
  add column if not exists local_pickup_enabled boolean not null default true,
  add column if not exists local_delivery_enabled boolean not null default true;

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
  p_items jsonb
)
returns table (order_id bigint, order_number text, total_cents integer)
language plpgsql security definer set search_path = '' as $$
declare created record;
begin
  if auth.uid() is null then raise exception 'É necessário entrar com Google para enviar o pedido'; end if;
  if p_delivery_mode not in ('local', 'city_delivery', 'correios') then raise exception 'Modalidade de entrega inválida'; end if;
  if char_length(trim(p_customer_name)) < 2 then raise exception 'Informe seu nome completo'; end if;
  if p_delivery_mode = 'correios' and (char_length(trim(p_postal_code)) < 8 or char_length(trim(p_address)) < 3 or char_length(trim(p_delivery_number)) < 1 or char_length(trim(p_delivery_city)) < 2 or char_length(trim(p_delivery_state)) <> 2) then
    raise exception 'Complete o endereço para postagem pelos Correios';
  end if;
  select * into created from public.create_checkout_order(
    trim(p_customer_name), lower(trim(p_customer_email)), trim(p_customer_phone),
    coalesce(nullif(trim(p_postal_code), ''), '00000000'),
    coalesce(nullif(trim(p_address), ''), 'Retirada/combinação pelo Instagram'),
    'pix', p_items
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
revoke all on function public.create_manual_delivery_order(text,text,text,text,text,text,text,text,text,text,text,jsonb) from public;
grant execute on function public.create_manual_delivery_order(text,text,text,text,text,text,text,text,text,text,text,jsonb) to authenticated;
