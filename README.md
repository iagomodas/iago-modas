# Overzied Modas

Loja virtual de moda masculina com identidade visual escura, destaques em verde-neon, catálogo por categorias, busca, carrinho, checkout preparado e atendimento pelo WhatsApp. O projeto pode funcionar primeiro como vitrine e evoluir para pedidos, autenticação Google e administração por Supabase conforme a decisão do responsável.

> Esta versão é uma demonstração pronta para publicação no **GitHub Pages**. Pagamentos reais, dados de clientes e a administração conectada dependem da configuração posterior do Supabase e do serviço de pagamento escolhido.

## Recursos incluídos

| Área | Recursos atuais |
| --- | --- |
| Loja pública | Página inicial, categorias, busca, produto, carrinho e checkout visual |
| Atendimento | Botões com ícone reconhecível do WhatsApp; o número oficial ainda será informado pelo responsável |
| Administração | Página protegida preparada para o papel `admin` no Supabase |
| Publicação | Workflow automático para GitHub Pages em `.github/workflows/deploy-pages.yml` |
| Segurança | Sem armazenamento de cartão, chave Pix ou credenciais bancárias no navegador |
| Qualidade | TypeScript, testes automatizados e build estático configurados |

## Estrutura do repositório

```text
.
├── .github/workflows/      # Publicação no GitHub Pages e verificação semanal opcional
├── client/                 # Interface React, páginas, componentes e estilos
├── docs/                   # Guias de publicação e demonstração
├── server/                 # Código legado e testes de regras administrativas
├── supabase/               # Migração SQL e documentação da futura integração
├── SECURITY.md             # Controles e requisitos de segurança
├── package.json            # Scripts e dependências do projeto
└── README.md               # Este guia
```

## Executar no computador

Instale o [Node.js LTS](https://nodejs.org/) e, no terminal aberto na pasta do projeto, execute:

```powershell
npx pnpm@10.15.1 install
npx pnpm@10.15.1 dev
```

Depois, abra `http://localhost:3000` no navegador. Não use a extensão **Go Live** na pasta principal, pois o projeto é uma aplicação React compilada pelo Vite.

| Comando | Finalidade |
| --- | --- |
| `npx pnpm@10.15.1 dev` | Abre a demonstração localmente |
| `npx pnpm@10.15.1 check` | Verifica os tipos TypeScript |
| `npx pnpm@10.15.1 test` | Executa os testes automatizados |
| `npx pnpm@10.15.1 build:static` | Gera a versão estática em `dist/public` |

## Publicar no GitHub Pages

Crie um repositório vazio no GitHub e envie **o conteúdo desta pasta para a raiz do repositório**. A pasta `.github` deve ser enviada junto, pois ela contém a automação de publicação.

Em seguida, abra **Settings → Pages** e selecione **GitHub Actions**. Ao enviar os arquivos para a branch padrão do repositório — normalmente `main`, ou `root` neste repositório — o workflow gera a versão estática e publica a loja. O endereço terá este formato:

```text
https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
```

O guia detalhado está em [`docs/GITHUB_PAGES.md`](docs/GITHUB_PAGES.md). Para mostrar a loja pelo celular antes das configurações finais, consulte [`docs/DEMONSTRACAO_GITHUB_PAGES.md`](docs/DEMONSTRACAO_GITHUB_PAGES.md).

## Supabase e login Google

O Supabase é **opcional nesta demonstração**. Ele será necessário caso o responsável queira cadastro de produtos pelo painel, pedidos salvos, login com Google ou checkout conectado. Quando essa etapa for aprovada, consulte `supabase-config.template.txt`, cadastre somente as chaves públicas como Secrets do GitHub e siga as instruções em [`supabase/README.md`](supabase/README.md).

Nunca envie um arquivo `.env.local`, credenciais privadas, chaves de gateway ou dados de cartão para o GitHub. A política de segurança está em [`SECURITY.md`](SECURITY.md).

## Conteúdo que não deve ser enviado

O arquivo `.gitignore` já exclui dependências, builds, logs, arquivos de ambiente, configurações locais e metadados de desenvolvimento. Em particular, **não** envie `node_modules`, `dist`, `.env.local`, `.manus`, `.manus-logs` ou arquivos de backup.

## Próximas decisões do responsável

| Decisão | Efeito na loja |
| --- | --- |
| Pedidos pelo WhatsApp ou painel com Supabase | Define como o dono recebe e administra os pedidos |
| Número oficial do WhatsApp | Ativa os links de atendimento reais |
| Login Google obrigatório ou opcional | Define a experiência de compra e acesso administrativo |
| Gateway de pagamento | Ativa Pix, cartão e boleto com confirmação automática |

## Licença

Este projeto é distribuído sob a licença MIT. Consulte [`LICENSE`](LICENSE).
