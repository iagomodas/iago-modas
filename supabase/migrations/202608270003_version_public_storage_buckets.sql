-- Versiona os buckets públicos do catálogo e restringe qualquer mutação a admins.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-gallery', 'product-gallery', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('storefront-branding', 'storefront-branding', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product gallery: public read" on storage.objects;
create policy "product gallery: public read"
on storage.objects for select to public
using (bucket_id = 'product-gallery'::text);

drop policy if exists "product gallery: admin insert" on storage.objects;
create policy "product gallery: admin insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-gallery'::text
  and (select public.is_admin())
);

drop policy if exists "product gallery: admin update" on storage.objects;
create policy "product gallery: admin update"
on storage.objects for update to authenticated
using (
  bucket_id = 'product-gallery'::text
  and (select public.is_admin())
)
with check (
  bucket_id = 'product-gallery'::text
  and (select public.is_admin())
);

drop policy if exists "product gallery: admin delete" on storage.objects;
create policy "product gallery: admin delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-gallery'::text
  and (select public.is_admin())
);

drop policy if exists "storefront branding: admin upload" on storage.objects;
create policy "storefront branding: admin upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'storefront-branding'::text
  and (select public.is_admin())
);

drop policy if exists "storefront branding: admin update" on storage.objects;
create policy "storefront branding: admin update"
on storage.objects for update to authenticated
using (
  bucket_id = 'storefront-branding'::text
  and (select public.is_admin())
)
with check (
  bucket_id = 'storefront-branding'::text
  and (select public.is_admin())
);

drop policy if exists "storefront branding: admin delete" on storage.objects;
create policy "storefront branding: admin delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'storefront-branding'::text
  and (select public.is_admin())
);
