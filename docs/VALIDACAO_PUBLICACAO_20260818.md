# Validação da publicação pública — 18 de agosto de 2026

## Ocorrência corrigida

A URL pública da IAGO MODAS apresentava uma tela branca porque o `index.html` da branch `gh-pages` fazia referência a arquivos JavaScript e CSS externos que não existiam nessa publicação.

## Ação executada

Foi gerado novamente o build estático com a base `/iago-modas/` e, em seguida, um HTML consolidado com JavaScript, CSS e imagens incorporados. O arquivo `index.html` corrigido foi enviado diretamente à branch `gh-pages` no commit `a85256a`.

## Evidências de validação

| Verificação | Resultado |
| --- | --- |
| Conteúdo da branch `gh-pages` | O HTML consolidado contém JavaScript incorporado e não referencia `assets/index-*.js` ou `assets/index-*.css`. |
| Conteúdo servido pelo GitHub Pages | O HTML atualizado foi identificado após a propagação. |
| Página inicial pública | A vitrine da IAGO MODAS renderizou normalmente, com cabeçalho, categorias, carrinho e produtos visíveis. |
| Página de perfil pública | A rota `#/perfil` carregou o formulário com nome completo e campos de entrega. |
| Painel administrativo | A rota `#/admin` carregou o painel autenticado do proprietário, incluindo vitrine, catálogo, pedidos e etiquetas. |
| Testes automatizados | `pnpm test` concluiu com 27 arquivos e 68 testes aprovados. |
| Manutenção do Supabase | O workflow diário agendado executou com sucesso na branch `main` em 7 segundos, validando secrets e o catálogo público sem modificar dados. |
| Sincronização do código | A branch isolada `sync/iago-modas-validated-20260818` foi criada a partir de `main`. O envio automatizado de commits foi bloqueado por autorização 403 da integração, sem afetar as branches públicas existentes. |
| Backup da versão validada | O arquivo `IAGO_MODAS_CODIGO_FONTE_VALIDADO_20260818.zip` foi testado localmente e publicado no commit `bddd2ea` da branch isolada. A branch ficou um commit à frente de `main`; o arquivo preserva o código e a documentação atuais, mas não substitui a futura sincronização editável de `main`. |
| Integridade do backup | O arquivo local e o arquivo baixado da branch de sincronização possuem o mesmo SHA-256: `6abd4a048a51f517168cb144bb37831596edbf259fd7d4bbdd2d5e40ad919ea0`. |
| Correção de catálogo e checkout | O HTML consolidado com a proteção contra produtos locais não publicados foi enviado à branch `gh-pages` no commit `5e33e15`. A publicação impede a venda de itens de reserva inexistentes no Supabase e mantém o fallback para o Instagram. |
| Propagação da correção | Após a atualização do GitHub Pages, o JavaScript servido passou a conter a validação “Um item do seu carrinho ainda não está publicado”, confirmando que a página pública recebeu o commit `5e33e15`. |

## URL validada

<https://iagomodas.github.io/iago-modas/>

## Migração de pagamento

Em 18 de agosto de 2026, a migração `202608180002_cash_payment_method.sql` foi executada com sucesso no editor SQL do projeto Supabase real. Ela adiciona a forma de pagamento `cash` e atualiza a função de pedidos para aceitar **Pix** ou **dinheiro** em retirada/entrega local; para envios pelos Correios, mantém **Pix** como obrigatório. A execução retornou “Success. No rows returned”.

## Migração de canais de atendimento

Em 18 de agosto de 2026, a migração `202608180003_storefront_contact_channels.sql` foi aplicada com sucesso no projeto Supabase real. A conferência posterior confirmou os quatro campos da tabela `storefront_settings`: `instagram_enabled` (ativo por padrão), `instagram_handle` (com padrão `iagomodas9`), `whatsapp_enabled` (inativo por padrão) e `whatsapp_number` (vazio até o proprietário informar o número). Dessa forma, o painel pode habilitar ou desabilitar Instagram e WhatsApp de maneira independente, sem alterações de código.

## Publicação de canais e pagamento

O HTML estático consolidado da atualização foi enviado diretamente à branch `gh-pages` em 18 de agosto de 2026. O GitHub registrou o commit público [`2df23bf`](https://github.com/iagomodas/iago-modas/commit/2df23bf3cbc172552b7e1757366b2aa4f2aa1310), com a mensagem “IAGO MODAS — canais, Pix e finalizar pedido”. Ele contém os canais Instagram/WhatsApp configuráveis, o checkout com escolha de **Pix** ou **dinheiro** quando aplicável, a etapa **FINALIZAR PEDIDO**, o perfil `@iagomodas9` e a Home adaptada para não exibir canais desativados pelo painel.
