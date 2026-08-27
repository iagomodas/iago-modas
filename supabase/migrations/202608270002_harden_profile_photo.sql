-- Reproduz o estado seguro do bucket de fotos de perfil no Supabase.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'customer-profile-photos',
  'customer-profile-photos',
  false,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "customer profile photos: upload own" on storage.objects;
create policy "customer profile photos: upload own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'customer-profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "customer profile photos: update own" on storage.objects;
drop policy if exists "customer profile photos: update own v2" on storage.objects;
create policy "customer profile photos: update own v2"
on storage.objects for update to authenticated
using (
  bucket_id = 'customer-profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'customer-profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "customer profile photos: delete own" on storage.objects;
create policy "customer profile photos: delete own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'customer-profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "customer profile photos: read own or admin" on storage.objects;
create policy "customer profile photos: read own or admin"
on storage.objects for select to authenticated
using (
  bucket_id = 'customer-profile-photos'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or (select public.is_admin())
  )
);

drop function if exists public.update_own_profile_photo(text);

create or replace function public.update_own_profile_photo(p_profile_photo_path text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_path text := nullif(trim(coalesce(p_profile_photo_path, '')), '');
begin
  if auth.uid() is null then
    raise exception 'É necessário entrar com Google para atualizar sua foto';
  end if;

  if normalized_path is not null
    and normalized_path !~ ('^' || auth.uid()::text || '/avatar\.(jpg|jpeg|png|webp)$') then
    raise exception 'A foto de perfil é inválida';
  end if;

  update public.profiles
  set profile_photo_path = normalized_path,
      updated_at = now()
  where id = auth.uid();

  if not found then
    raise exception 'Não foi possível localizar seu cadastro';
  end if;
end;
$$;

revoke all on function public.update_own_profile_photo(text) from public, anon;
grant execute on function public.update_own_profile_photo(text) to authenticated;
