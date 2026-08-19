# Publicação estática da IAGO MODAS: GitHub Pages + Supabase

Esta versão da **IAGO MODAS** publica o frontend estático no GitHub Pages e usa o Supabase para catálogo, pedidos, perfis e autenticação.

## Configuração inicial

1. Use o repositório `overziedmodas/oversized-modas` na branch `main`.
2. No repositório, abra **Settings → Pages** e escolha **GitHub Actions** como fonte de publicação.
3. Em **Settings → Secrets and variables → Actions**, crie os dois segredos abaixo:

| Nome                            | Valor                                                                  |
| ------------------------------- | ---------------------------------------------------------------------- |
| `VITE_SUPABASE_URL`             | URL do projeto Supabase, por exemplo `https://seu-projeto.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública/publishable key do projeto Supabase                      |

> Nunca adicione a chave `service_role`, senha do banco, token de gateway ou chave Pix aos segredos do frontend, ao código ou ao repositório.

4. Para uma instalação nova, aplique as migrações de `supabase/migrations/` em ordem. No projeto IAGO MODAS já conectado, as migrações aplicadas não devem ser executadas novamente.
5. Aguarde a execução do workflow **Publicar storefront estático no GitHub Pages**. A URL aparecerá no resumo do workflow e em **Settings → Pages**.

## Como funcionam os links

O projeto usa rotas com `#` para que os links de produtos, categorias, busca, checkout e administração funcionem no GitHub Pages sem exigir servidor próprio.

## Login Google

Ative o provedor Google em **Supabase Auth** e registre a URL publicada do GitHub Pages na lista de redirecionamentos permitidos. Não crie nem cole as chaves OAuth diretamente no código do site. Depois, promova somente o e-mail do dono ao papel `admin` conforme o roteiro de ativação.

## Atualizações

Cada `git push` para `main` constrói e publica uma nova versão. Antes de publicar mudanças de banco, preserve uma cópia da migração SQL e revise as políticas RLS.

## Verificação semanal autorizada

O arquivo `.github/workflows/supabase-weekly-check.yml` executa toda segunda-feira, às 09:17 UTC, uma consulta **somente de leitura** ao catálogo público. A consulta retorna, no máximo, o identificador de um produto ativo; não altera produtos, pedidos ou perfis e não usa chave privada.

O workflow reutiliza os dois segredos públicos configurados acima. Ele é uma verificação operacional simples e não substitui a revisão das regras do plano Supabase nem a configuração correta de RLS. Caso o workflow falhe, abra a aba **Actions** do repositório e confirme a URL, a chave pública e se a migração SQL foi aplicada.

O GitHub executa agendamentos usando cron em UTC [1]. A API REST do Supabase respeita as políticas RLS [2], e a chave publishable é apropriada para componentes públicos quando as políticas RLS estão ativas [3].

## Referências

[1]: https://docs.github.com/actions/using-workflows/events-that-trigger-workflows "GitHub Docs — Events that trigger workflows"
[2]: https://supabase.com/docs/guides/api "Supabase Docs — Data REST API"
[3]: https://supabase.com/docs/guides/getting-started/api-keys "Supabase Docs — Understanding API keys"
