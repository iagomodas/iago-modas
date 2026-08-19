-- IAGO MODAS: dados de entrega pertencem somente ao próprio cliente.
-- A alteração é feita por função controlada para evitar que o navegador altere e-mail, role ou outro campo sensível do perfil.

alter table public.profiles
  add column if not exists delivery_phone text,
  add column if not exists delivery_postal_code text,
  add column if not exists delivery_street text,
  add column if not exists delivery_number text,
  add column if not exists delivery_complement text,
  add column if not exists delivery_district text,
  add column if not exists delivery_city text,
  add column if not exists delivery_state text;

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
begin
  if auth.uid() is null then
    raise exception 'É necessário entrar com Google para atualizar seu cadastro';
  end if;

  if char_length(trim(coalesce(p_display_name, ''))) < 2 then
    raise exception 'Informe seu nome completo';
  end if;

  update public.profiles
  set
    display_name = trim(p_display_name),
    delivery_phone = nullif(trim(coalesce(p_delivery_phone, '')), ''),
    delivery_postal_code = nullif(regexp_replace(coalesce(p_delivery_postal_code, ''), '\D', '', 'g'), ''),
    delivery_street = nullif(trim(coalesce(p_delivery_street, '')), ''),
    delivery_number = nullif(trim(coalesce(p_delivery_number, '')), ''),
    delivery_complement = nullif(trim(coalesce(p_delivery_complement, '')), ''),
    delivery_district = nullif(trim(coalesce(p_delivery_district, '')), ''),
    delivery_city = nullif(trim(coalesce(p_delivery_city, '')), ''),
    delivery_state = nullif(upper(trim(coalesce(p_delivery_state, ''))), ''),
    updated_at = now()
  where id = auth.uid();

  if not found then
    raise exception 'Não foi possível localizar seu cadastro';
  end if;
end;
$$;

revoke all on function public.update_own_customer_profile(text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.update_own_customer_profile(text, text, text, text, text, text, text, text, text) to authenticated;
