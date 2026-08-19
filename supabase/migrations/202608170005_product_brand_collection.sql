-- Organização opcional para marcas e coleções em qualquer categoria de produto.
alter table public.products
  add column if not exists brand text,
  add column if not exists collection text;

update public.products
set brand = 'OVERSIZED MODAS'
where brand is null or btrim(brand) = '';

alter table public.products
  alter column brand set default 'OVERSIZED MODAS',
  alter column brand set not null;

alter table public.products
  add constraint products_brand_length_check check (char_length(btrim(brand)) between 2 and 80),
  add constraint products_collection_length_check check (collection is null or char_length(btrim(collection)) between 2 and 100);
