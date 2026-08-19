# Publicação em um repositório GitHub novo

Este pacote já inclui a loja completa e o workflow de publicação em `.github/workflows/deploy-pages.yml`. O workflow foi validado com **pnpm 10.4.1**, a mesma versão indicada no projeto.

## 1. Criar um repositório vazio

No GitHub, escolha **New repository**, informe um nome novo (por exemplo, `overzied-modas`) e deixe o repositório como **Public**. Não marque as opções para criar README, `.gitignore` ou licença, pois elas já existem neste pacote.

## 2. Enviar o conteúdo do ZIP

Extraia o ZIP no computador. Abra a pasta extraída e envie **todos os arquivos e pastas internos** para a raiz do repositório novo, inclusive a pasta `.github`.

> Não envie o arquivo ZIP fechado pelo GitHub. Primeiro extraia-o e envie o conteúdo da pasta resultante.

## 3. Ativar o GitHub Pages

No repositório, abra **Settings → Pages**. Em **Source**, escolha **GitHub Actions**.

## 4. Conferir a publicação

Abra a aba **Actions**. O workflow **Publicar storefront estático no GitHub Pages** deverá iniciar após o envio dos arquivos. Espere o ícone verde e abra o endereço informado pelo GitHub Pages.

## 5. O que já foi verificado

| Verificação | Resultado |
| --- | --- |
| Instalação com `pnpm 10.4.1` | Aprovada |
| Testes automatizados | 11 aprovados |
| Build estático para GitHub Pages | Aprovado |
| Workflow de publicação | Incluído no pacote |

## Observações

O catálogo de demonstração funciona sem Supabase. Para ativar login Google, painel administrativo real e pedidos persistentes, configure posteriormente as variáveis públicas do Supabase conforme o `README.md` e a documentação em `docs/`.
