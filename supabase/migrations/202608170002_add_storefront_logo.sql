-- Overzied Modas: logo configurável da vitrine.
-- Pode ser executado com segurança em um projeto que já aplicou a migração inicial.

alter table public.storefront_settings
  add column if not exists logo_url text;

comment on column public.storefront_settings.logo_url is
  'URL pública opcional da logo exibida no cabeçalho e rodapé da loja.';

update public.storefront_settings
set logo_url = null
where id = true;
