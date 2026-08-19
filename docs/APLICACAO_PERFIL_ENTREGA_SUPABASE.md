# Aplicação da migração de perfil de entrega

## Registro

Em 18 de agosto de 2026, a migração `202608180001_customer_delivery_profile.sql` foi aplicada com sucesso no projeto Supabase **IAGO MODAS** (`nqigoxncebescsdpeyjc`). O editor SQL confirmou a execução com a mensagem **“Success. No rows returned”**.

## Escopo aplicado

Foram incluídos no perfil do cliente os campos opcionais de telefone e endereço de entrega. A atualização ocorre exclusivamente pela função `public.update_own_customer_profile`, que usa `auth.uid()` e não permite que o navegador altere e-mail, função administrativa ou o perfil de outra pessoa.

O checkout pode preencher os dados do próprio cliente a partir desse cadastro, mantendo os campos editáveis antes de cada pedido.

## Publicação

Em 18 de agosto de 2026, a branch `gh-pages` de `https://github.com/iagomodas/iago-modas` recebeu o commit `7ce2f88` — **“Adiciona perfil de entrega próprio ao checkout”** — com o `index.html` estático atualizado da loja.

Na primeira verificação de `https://iagomodas.github.io/iago-modas/#/perfil`, imediatamente após o commit, o documento foi entregue com o título **IAGO MODAS — Moda Masculina**, mas a área visível ainda estava vazia. A confirmação final da renderização permanece pendente da propagação do GitHub Pages e da inspeção do console do navegador.
