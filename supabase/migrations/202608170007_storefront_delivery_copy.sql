-- Textos da entrega editáveis pelo administrador, sem cálculo automático de frete.
alter table public.storefront_settings
  add column if not exists local_pickup_label text not null default 'Retirar em',
  add column if not exists local_delivery_label text not null default 'Entrega em',
  add column if not exists outside_delivery_label text not null default 'Sou de outra cidade',
  add column if not exists outside_delivery_notice text not null default 'Para pedidos de outra cidade, o frete não é calculado no site: o valor será combinado com a IAGO MODAS pelo Instagram antes da postagem.';
