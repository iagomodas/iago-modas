# IAGO MODAS

Loja virtual de moda masculina com tema escuro, detalhes em verde-neon, catálogo administrável e atendimento pelo Instagram. A aplicação é publicada como site estático no GitHub Pages e usa o Supabase para catálogo, perfis, pedidos e configurações da vitrine.

> **Fluxo de compra:** o cliente faz login com Google, informa o próprio nome completo, monta o pedido e é direcionado à conversa da loja no Instagram **@iagomodas9**. O pedido fica registrado para acompanhamento no painel; o Pix e o frete são combinados manualmente pelo dono.

## Recursos atuais

| Área | O que está disponível |
| --- | --- |
| Loja pública | Categorias, busca, produto, galeria de imagens, carrinho, checkout e perfil do cliente |
| Catálogo | Produtos com categoria, marca, coleção, preços, estoque, tamanhos, fotos e status ativo/inativo |
| Atendimento | Resumo de pedido copiável e abertura do Direct do Instagram, com tentativa de abrir o aplicativo no celular |
| Painel do dono | Gestão de produtos, pedidos, vitrine, logo, chave Pix, cidade de entrega e etiquetas de postagem |
| Dados | Supabase com RLS para perfis, pedidos, catálogo e configurações públicas |
| Publicação | GitHub Pages por workflow em `.github/workflows/deploy-pages.yml` |

## Executar localmente

Instale o [Node.js LTS](https://nodejs.org/) e, na raiz do projeto, execute:

```bash
pnpm install
pnpm dev
```

| Comando | Finalidade |
| --- | --- |
| `pnpm run check` | Verifica os tipos TypeScript |
| `pnpm test` | Executa os testes automatizados |
| `pnpm run build:static` | Gera o site estático para o GitHub Pages |

## Publicação no GitHub Pages

O repositório de publicação é `iagomodas/iago-modas` e a URL pública é:

```text
https://iagomodas.github.io/iago-modas/
```

Em **Settings → Pages**, a fonte deve ser **GitHub Actions**. Os segredos públicos `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` precisam continuar cadastrados nas Actions. O guia técnico está em [`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md).

## Segurança e operação

O site não armazena cartão, senha bancária ou chave privada. A chave Pix exibida ao cliente é uma configuração editável no painel do dono. Para contas financeiras, pagamentos ou logística, o responsável legal adulto deve ser o titular quando o serviço exigir maioridade.

O projeto Supabase e a organização aparecem como **IAGO MODAS**. O identificador técnico da URL do Supabase é mantido para não interromper os dados existentes.

## Arquivos importantes

```text
client/                 Interface da loja e painel
supabase/migrations/    Migrações incrementais do banco
.github/workflows/      Publicação e verificação operacional
docs/                   Guias e registros de validação
```

## Licença

Este projeto é distribuído sob a licença MIT. Consulte [`LICENSE`](LICENSE).
