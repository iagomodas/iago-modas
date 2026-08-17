# Manutenção automática do Supabase

## Objetivo

Manter o projeto Supabase da Overzied Modas acessível sem exigir que o dono entre manualmente no painel toda semana.

## Política consultada

Segundo a documentação oficial consultada em 16 de agosto de 2026, projetos do plano gratuito podem ser pausados quando apresentam pouca atividade durante um período de 7 dias. A documentação informa que algumas requisições de usuários ao banco por dia costumam ser suficientes para evitar a pausa, mas não oferece garantia de que uma única consulta semanal seja suficiente.

Fonte oficial: <https://supabase.com/docs/guides/platform/free-project-pausing>

## Estratégia preparada

O arquivo `.github/workflows/supabase-weekly-check.yml` está preparado para uma consulta diária ao endpoint público do catálogo, solicitando apenas o campo `id` de no máximo um produto ativo. A consulta não cria pedidos, não atualiza produtos, não grava dados de clientes e não usa chave privada.

Antes de ativar o workflow no repositório GitHub, o responsável deve cadastrar somente os segredos públicos `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. A chave `service_role` nunca deve ser enviada ao GitHub Pages nem incluída nesse workflow.

## Ativação pendente

Para maior aderência à orientação oficial, a frequência foi preparada como diária. Ela só deverá ser ativada no repositório GitHub depois que o projeto Supabase estiver configurado, publicado e com os dois segredos públicos cadastrados no GitHub.

## Alternativa paga

A página oficial de preços informa que projetos pagos não sofrem pausa automática por inatividade. Fonte: <https://supabase.com/pricing>
