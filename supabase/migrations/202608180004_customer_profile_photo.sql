-- IAGO MODAS: foto de perfil opcional, escolhida pelo próprio cliente.
alter table public.profiles
  add column if not exists profile_photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'customer-profile-photos',
  'customer-profile-photos',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "customer profile photos: upload own" on storage.objects;
create policy "customer profile photos: upload own"
on storage.objects for insert to "authenticated"
with check (
  bucket_id = 'customer-profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "customer profile photos: update own" on storage.objects;
create policy "customer profile photos: update own"
on storage.objects for update to "authenticated"
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
on storage.objects for delete to "authenticated"
using (
  bucket_id = 'customer-profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create or replace function public.update_own_profile_photo(p_profile_photo_path text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'É necessário entrar com Google para atualizar sua foto';
  end if;

  if nullif(trim(coalesce(p_profile_photo_path, '')), '') is not null
    and trim(p_profile_photo_path) !~ ('^' || auth.uid()::text || '/avatar\.(jpg|jpeg|png|webp)$') then
    raise exception 'A foto de perfil é inválida';
  end if;

  update public.profiles
  set profile_photo_path = nullif(trim(coalesce(p_profile_photo_path, '')), ''),
      updated_at = now()
  where id = auth.uid();
end;
$$;

revoke all on function public.update_own_profile_photo(text) from public;
grant execute on function public.update_own_profile_photo(text) to "authenticated";
