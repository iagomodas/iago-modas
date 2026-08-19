# Registro da migração Pix

Em 17/08/2026, no SQL Editor do projeto Supabase `overzied-modas` (`nqigoxncebescsdpeyjc`), foi aplicada com sucesso a migração que adiciona a coluna pública e editável `pix_key` na tabela `public.storefront_settings`.

O valor inicial definido pelo responsável foi `iago765gtb@gmail.com`. A coluna possui restrição de comprimento entre 2 e 255 caracteres e não armazena senha, token, chave privada ou outro dado bancário sensível.

O resultado apresentado pelo painel foi: `Success. No rows returned`.
