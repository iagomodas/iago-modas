# Supabase — Overzied Modas

Este diretório contém a migração para mover os dados operacionais da Overzied Modas para um projeto Supabase e permitir que o frontend seja hospedado de forma estática. A migração não deve ser aplicada ao banco atual do projeto; ela foi escrita para um **projeto Supabase novo ou reservado para a loja**.

## O que a migração cria

O arquivo `migrations/202608150001_overzied_modas.sql` cria produtos, perfis de usuários, pedidos e itens de pedidos. Também habilita **Row Level Security (RLS)** em todas as tabelas expostas. Assim, visitantes podem ler somente produtos ativos; administradores autenticados podem gerenciar produtos e consultar pedidos; e pedidos públicos só podem ser criados pela função `create_checkout_order`, que recalcula preço e total no banco.

> A chave pública do Supabase pode ser usada no frontend somente porque RLS e as políticas restringem o que ela pode fazer. A chave `service_role` nunca deve ir para GitHub Pages, para o navegador ou para o repositório.

## Como aplicar

1. Crie ou selecione o projeto Supabase destinado à Overzied Modas.
2. No painel do Supabase, abra o **SQL Editor** e execute integralmente o arquivo `migrations/202608150001_overzied_modas.sql`.
3. Faça login no site com a conta que deverá administrar a loja. O gatilho cria um perfil automaticamente.
4. No SQL Editor, promova essa conta com o comando abaixo, trocando pelo e-mail real:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@exemplo.com';
```

5. Em **Authentication → URL Configuration**, adicione as URLs locais e a URL final do GitHub Pages aos redirecionamentos autorizados antes de ativar login social.

## Verificação semanal do projeto

A migração instala uma rotina semanal interna chamada `overzied-weekly-project-check`. Ela executa uma função PostgreSQL leve toda segunda-feira, às 09:00 UTC, e atualiza uma tabela não exposta (`app_private.project_heartbeat`). Não há chaves, URLs públicas nem credenciais em código.

Você pode acompanhar o agendamento e os resultados na área de Cron do painel do Supabase. A rotina é útil como verificação operacional, mas **não garante** a política de disponibilidade de qualquer plano do Supabase; as condições do serviço podem mudar.

## Próxima etapa técnica

Para ligar o frontend estático ao Supabase, serão necessárias apenas duas variáveis públicas de compilação: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Elas identificam o projeto e são próprias para o navegador quando RLS está corretamente configurado. A integração usará uma configuração segura para essas variáveis; nenhuma chave privada será solicitada ou adicionada ao frontend.
