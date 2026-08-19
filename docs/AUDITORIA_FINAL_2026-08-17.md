# Auditoria final de fluxos — 17/08/2026

> **Registro histórico:** este documento preserva a evidência do dia 17/08/2026, antes do rebranding para IAGO MODAS. Menções ao nome anterior descrevem exclusivamente o estado daquela data.

A versão auditada carregou a rota `#/categoria/camisetas` com a barra superior, três produtos e links de categorias funcionando. Um produto foi selecionado e adicionado ao carrinho; o contador passou para 1 e o drawer exibiu o item, quantidade, subtotal e o botão de continuar pedido.

O botão de continuar levou à rota `#/checkout`. O checkout exibiu o resumo do pedido, o total inicial de R$ 89,90, a mensagem pronta para o Instagram e os botões para copiar o pedido e copiar o resumo sem abrir o Instagram. Não foi enviado nenhum pedido real durante a auditoria.

A rota `#/admin`, sem variáveis reais do Supabase ou sessão administrativa no ambiente de teste, exibiu um estado seguro de configuração: “Conecte o Supabase para administrar a loja”, sem mostrar catálogo administrativo nem liberar operações de alteração. O botão de retorno à loja permaneceu disponível.

Validação automatizada adicional: 13 arquivos de teste e 27 testes passaram; `tsc --noEmit` passou; `build:static --base=/overzied-modas/` passou. O build emitiu apenas o aviso de bundle JavaScript acima de 500 kB e avisos de configuração legada do campo `pnpm` no `package.json`; nenhum deles impediu a compilação.

Pendências externas, não defeitos do frontend: aplicar a migração no projeto Supabase do dono, cadastrar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` nos Secrets do GitHub, configurar Google OAuth/URLs autorizadas e promover o e-mail do dono para `admin` após o primeiro login.

A rota `#/` também foi aberta diretamente e carregou a hero, catálogo, CTAs e barra superior; a home não exibiu a antiga grade duplicada de categorias no conteúdo principal. A rota `#/produto/camiseta-essentials-oversized` foi aberta diretamente e iniciou com pixels acima do viewport iguais a zero, mostrando imagem, nome, preço e controles do produto no primeiro viewport, sem rolagem suave visível.

## Verificação estrita do selo no artefato público

A busca exata por `Made with Manus`, `made-with-manus` e `made with manus` não encontrou ocorrências em `client/index.html`, `client/src`, `client/public` nem no `dist/public` gerado pelo build. O comando `pnpm run build:static` agora executa automaticamente `scripts/check-public-branding.mjs` e retornou `PUBLIC_BRANDING_CHECK_OK`.

Também foi capturada a Home em viewport mobile de 375×812 após o build. A interface exibida contém somente a marca Overzied Modas, navegação, catálogo, benefícios, novidades e rodapé da loja; não há texto ou selo “Made with Manus” no viewport nem na interface pública renderizada.

## Correção da validação Supabase

A primeira verificação consultava a raiz `/rest/v1/`, que retornou HTTP 401 mesmo com URL e Publishable key válidas. O teste foi corrigido para consultar `products?select=id&limit=1`, endpoint compatível com a migração da loja. O resultado passou: HTTP 404 é aceito quando a migração ainda não foi aplicada, enquanto HTTP 401/403 continua indicando credencial incompatível. Assim, a URL e a chave pública configuradas foram validadas sem expor credenciais.

## Diagnóstico do Supabase real no SQL Editor

Em 17/08/2026, o diagnóstico executado no projeto `Overzied Modas` confirmou: `app_role` existe; `product_category` existe; `profiles`, `products`, `storefront_settings`, `orders`, `order_items` e `app_private.project_heartbeat` existem. A consulta de estado retornou `storefront_settings = 1`, `products = 0`, `profiles = 0`, `is_admin_function = 1`, `checkout_function = 1`, `heartbeat_function = 1`, `policies = 10` e `cron_job = 1`. Os valores zero de produtos e perfis são esperados antes do primeiro cadastro e do primeiro login Google.

O diagnóstico foi somente leitura. Nenhum complemento foi aplicado e nenhum dado existente foi apagado. A confirmação final de funcionamento do aplicativo com o Supabase real ainda depende de validar uma leitura runtime do catálogo e o acesso ao painel após a publicação.
