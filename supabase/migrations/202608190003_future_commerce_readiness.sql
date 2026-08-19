-- Preparação inativa para pagamentos e frete futuros.
-- Nenhuma cobrança, cotação ou webhook é ativado por esta migração.

alter table public.products
  add column if not exists shipping_weight_grams integer not null default 0 check (shipping_weight_grams between 0 and 50000),
  add column if not exists shipping_length_cm numeric(7, 2) not null default 0 check (shipping_length_cm between 0 and 300),
  add column if not exists shipping_width_cm numeric(7, 2) not null default 0 check (shipping_width_cm between 0 and 300),
  add column if not exists shipping_height_cm numeric(7, 2) not null default 0 check (shipping_height_cm between 0 and 300);

alter table public.storefront_settings
  add column if not exists future_payment_provider text not null default 'manual' check (future_payment_provider in ('manual', 'mercado_pago')),
  add column if not exists future_payments_enabled boolean not null default false,
  add column if not exists future_webhook_enabled boolean not null default false,
  add column if not exists future_shipping_provider text not null default 'manual' check (future_shipping_provider in ('manual', 'melhor_envio', 'correios')),
  add column if not exists future_shipping_quotes_enabled boolean not null default false,
  add column if not exists shipping_origin_postal_code text not null default '' check (shipping_origin_postal_code = '' or shipping_origin_postal_code ~ '^[0-9]{8}$');

alter table public.orders
  add column if not exists payment_provider text,
  add column if not exists payment_provider_reference text,
  add column if not exists payment_webhook_status text not null default 'not_configured' check (payment_webhook_status in ('not_configured', 'pending', 'verified', 'rejected'));

comment on column public.storefront_settings.future_payments_enabled is 'Permanece falso até existir contrato, credenciais server-side e ativação explícita do administrador.';
comment on column public.storefront_settings.future_shipping_quotes_enabled is 'Permanece falso até existir origem, peso, dimensões e credenciais de um provedor de frete.';
