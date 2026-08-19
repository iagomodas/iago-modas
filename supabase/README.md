# Supabase — IAGO MODAS

Este diretório contém as migrações dos dados operacionais da **IAGO MODAS** para o projeto Supabase e permite que o frontend seja hospedado de forma estática. As migrações já aplicadas ao projeto atual não devem ser executadas novamente.

## O que a migração cria

O arquivo `migrations/202608150001_overzied_modas.sql` cria produtos, perfis de usuários, pedidos e itens de pedidos. Também habilita **Row Level Security (RLS)** em todas as tabelas expostas. Assim, visitantes podem ler somente produtos ativos; administradores autenticados podem gerenciar produtos e consultar pedidos; e pedidos públicos só podem ser criados pela função `create_checkout_order`, que recalcula preço e total no banco.

> A chave pública do Supabase pode ser usada no frontend somente porque RLS e as políticas restringem o que ela pode fazer. A chave `service_role` nunca deve ir para GitHub Pages, para o navegador ou para o repositório.

## Como aplicar

1. Crie ou selecione o projeto Supabase destinado à IAGO MODAS.
2. Em uma instalação nova, abra o **SQL Editor** e execute as migrações de `migrations/` em ordem. No projeto existente, consulte os registros de migração antes de aplicar qualquer alteração.
3. Faça login no site com a conta que deverá administrar a loja. O gatilho cria um perfil automaticamente.
4. No SQL Editor, promova essa conta com o comando abaixo, trocando pelo e-mail real:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@exemplo.com';
```

5. Em **Authentication → URL Configuration**, adicione as URLs locais e a URL final do GitHub Pages aos redirecionamentos autorizados antes de ativar login social.

## Verificação semanal do projeto

A migração inicial instala uma rotina interna chamada `overzied-weekly-project-check`. Ela executa uma função PostgreSQL leve e atualiza uma tabela não exposta (`app_private.project_heartbeat`). O nome histórico da rotina não altera a marca exibida aos clientes. Não há chaves, URLs públicas nem credenciais em código.

Você pode acompanhar o agendamento e os resultados na área de Cron do painel do Supabase. A rotina é útil como verificação operacional, mas **não garante** a política de disponibilidade de qualquer plano do Supabase; as condições do serviço podem mudar.

## Próxima etapa técnica

Para ligar o frontend estático ao Supabase, serão necessárias apenas duas variáveis públicas de compilação: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Elas identificam o projeto e são próprias para o navegador quando RLS está corretamente configurado. A integração usará uma configuração segura para essas variáveis; nenhuma chave privada será solicitada ou adicionada ao frontend.
