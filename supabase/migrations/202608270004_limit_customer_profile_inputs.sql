-- Limites server-side para dados editáveis do perfil do cliente.

create or replace function public.update_own_customer_profile(
  p_display_name text,
  p_delivery_phone text default null,
  p_delivery_postal_code text default null,
  p_delivery_street text default null,
  p_delivery_number text default null,
  p_delivery_complement text default null,
  p_delivery_district text default null,
  p_delivery_city text default null,
  p_delivery_state text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_postal_code text := nullif(regexp_replace(coalesce(p_delivery_postal_code, ''), '\D', '', 'g'), '');
  normalized_state text := nullif(upper(trim(coalesce(p_delivery_state, ''))), '');
begin
  if auth.uid() is null then
    raise exception 'É necessário entrar com Google para atualizar seu cadastro';
  end if;

  if p_display_name is null or char_length(trim(p_display_name)) not between 2 and 180
    or char_length(coalesce(p_delivery_phone, '')) > 32
    or char_length(coalesce(p_delivery_street, '')) > 200
    or char_length(coalesce(p_delivery_number, '')) > 40
    or char_length(coalesce(p_delivery_complement, '')) > 200
    or char_length(coalesce(p_delivery_district, '')) > 120
    or char_length(coalesce(p_delivery_city, '')) > 120
    or char_length(coalesce(normalized_state, '')) > 2
    or char_length(coalesce(normalized_postal_code, '')) > 8 then
    raise exception 'Os dados do cadastro excedem o limite permitido';
  end if;

  if normalized_postal_code is not null and normalized_postal_code !~ '^[0-9]{8}$' then
    raise exception 'O CEP informado é inválido';
  end if;

  if normalized_state is not null and normalized_state !~ '^[A-Z]{2}$' then
    raise exception 'O estado informado é inválido';
  end if;

  update public.profiles
  set
    display_name = trim(p_display_name),
    delivery_phone = nullif(trim(coalesce(p_delivery_phone, '')), ''),
    delivery_postal_code = normalized_postal_code,
    delivery_street = nullif(trim(coalesce(p_delivery_street, '')), ''),
    delivery_number = nullif(trim(coalesce(p_delivery_number, '')), ''),
    delivery_complement = nullif(trim(coalesce(p_delivery_complement, '')), ''),
    delivery_district = nullif(trim(coalesce(p_delivery_district, '')), ''),
    delivery_city = nullif(trim(coalesce(p_delivery_city, '')), ''),
    delivery_state = normalized_state,
    updated_at = now()
  where id = auth.uid();

  if not found then
    raise exception 'Não foi possível localizar seu cadastro';
  end if;
end;
$$;

revoke all on function public.update_own_customer_profile(text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.update_own_customer_profile(text, text, text, text, text, text, text, text, text) to authenticated;
