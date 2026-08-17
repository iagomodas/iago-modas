# Referências oficiais — Supabase

## Segurança do frontend estático

A documentação oficial orienta que tabelas expostas pela API do Supabase usem **Row Level Security (RLS)** e políticas explícitas. Esse é o fundamento para usar a chave pública no navegador sem liberar acesso irrestrito aos dados.

- [Row Level Security — Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Cliente JavaScript — Supabase Docs](https://supabase.com/docs/reference/javascript/introduction)

## Rotina periódica interna

A documentação oficial descreve o uso de `pg_cron` para tarefas recorrentes no banco. Para chamadas de funções via HTTP, recomenda guardar tokens no Supabase Vault; a rotina desta loja é local ao banco e não requer URL ou token externo.

- [Scheduling Edge Functions — Supabase Docs](https://supabase.com/docs/guides/functions/schedule-functions)
- [Cron — Supabase Docs](https://supabase.com/docs/guides/cron)
