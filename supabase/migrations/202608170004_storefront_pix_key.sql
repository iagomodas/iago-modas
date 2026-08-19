-- Campo público de recebimento, configurável apenas pelo administrador.
-- Use somente uma chave Pix que possa ser compartilhada com clientes; nunca armazene senha, token bancário ou chave privada.
alter table public.storefront_settings
  add column if not exists pix_key text not null default 'iago765gtb@gmail.com'
  check (char_length(pix_key) between 2 and 255);
