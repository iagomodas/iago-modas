-- IAGO MODAS: troca de marca sem apagar produtos, pedidos, clientes ou configurações operacionais.

alter table public.products
  alter column brand set default 'IAGO MODAS';

update public.products
set brand = 'IAGO MODAS'
where trim(coalesce(brand, '')) in ('', 'OVERSIZED MODAS', 'Overzied Modas');

update public.storefront_settings
set
  logo_url = '/manus-storage/iago-modas-logo-instagram_c08296de.png',
  highlights_description = 'Peças versáteis e selecionadas para expressar a sua identidade. Encontre seu tamanho e leve a IAGO MODAS com você.',
  categories_description = 'Uma seleção para cada momento, sempre com a identidade IM.'
where id = true;
