# Status da publicação no GitHub Pages

## Repositório de destino

O repositório definido para a loja é `overziedmodas/overzied-modas`. O pacote final deve ser enviado mantendo a estrutura completa do projeto, especialmente as pastas `.github`, `supabase`, `docs`, `client`, `server` e `shared`.

## Workflow de publicação

O arquivo `.github/workflows/deploy-pages.yml` executa o build estático com a base correspondente ao nome do repositório:

```text
pnpm run build:static --base=/${{ github.event.repository.name }}/
```

A ação instala explicitamente o pnpm 10.4.1, gera o conteúdo em `dist/public` e publica pelo GitHub Actions. A rotina `.github/workflows/supabase-weekly-check.yml` faz uma consulta pública diária, somente de leitura, depois que os dois Secrets do Supabase forem cadastrados.

## Endereço esperado

Após o workflow concluir com sucesso e o GitHub Pages estar configurado para publicar pelo GitHub Actions, o endereço esperado será:

```text
https://overziedmodas.github.io/overzied-modas/
```

O painel administrativo ficará em:

```text
https://overziedmodas.github.io/overzied-modas/#/admin
```

## Configurações externas obrigatórias

O GitHub precisa receber os Secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. No Supabase, é necessário executar a migração SQL, configurar o provedor Google, adicionar a URL pública nas URLs autorizadas e promover o e-mail do dono para `role = 'admin'` depois do primeiro login.

A publicação do frontend e a configuração do Supabase são etapas independentes. O repositório não precisa ser apagado quando os Secrets forem adicionados: basta cadastrá-los e executar novamente o workflow pelo GitHub Actions.
