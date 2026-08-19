-- IAGO MODAS: endurecimento defensivo de dados pessoais.
-- Fotos de clientes deixam de ser públicas; cada acesso passa pelas políticas RLS.

update storage.buckets
set public = false,
    file_size_limit = 3145728,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'customer-profile-photos';

drop policy if exists "customer profile photos: read own or admin" on storage.objects;
create policy "customer profile photos: read own or admin"
on storage.objects for select to "authenticated"
using (
  bucket_id = 'customer-profile-photos'
  and (
    (storage.foldername(name))[1] = (select auth.uid()::text)
    or (select public.is_admin())
  )
);

-- A função já restringe o caminho a {auth.uid()}/avatar.{ext}; manter a execução
-- exclusiva de usuários autenticados evita que visitantes alterem perfis alheios.
revoke all on function public.update_own_profile_photo(text) from public;
grant execute on function public.update_own_profile_photo(text) to "authenticated";
