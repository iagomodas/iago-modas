alter table public.storefront_settings
  add column if not exists instagram_handle text not null default 'iagomodas9',
  add column if not exists instagram_enabled boolean not null default true,
  add column if not exists whatsapp_number text not null default '',
  add column if not exists whatsapp_enabled boolean not null default false;

update public.storefront_settings
set instagram_handle = 'iagomodas9'
where instagram_handle is null or btrim(instagram_handle) = '';
