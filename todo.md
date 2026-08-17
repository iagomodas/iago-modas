# Project TODO

## Loja e publicação

- [x] Criar a vitrine responsiva da Overzied Modas com tema escuro, logo OM, hero, categorias, catálogo, busca e carrinho.
- [x] Manter o nome completo “Overzied Modas” e a identidade visual preta, cinza e verde-neon.
- [x] Preparar o build estático para GitHub Pages com rotas por hash.
- [x] Corrigir o workflow do GitHub Pages para publicar a partir da branch `root` e usar a base do repositório.
- [x] Validar a publicação pública e corrigir a tela branca causada pelo encaminhamento incorreto da base do Vite.
- [x] Confirmar a presença das pastas `client`, `server`, `shared`, `docs`, `drizzle`, `patches`, `supabase` e `.github` no repositório.
- [x] Gerar pacotes ZIP atualizados para envio ao GitHub.

## Pedidos pelo Instagram

- [x] Confirmar o perfil oficial `@overziedmodas9`.
- [x] Remover o fluxo público de WhatsApp e gateway de pagamento.
- [x] Adaptar o carrinho e checkout para gerar resumo com produtos, tamanhos, quantidades e total.
- [x] Preparar cópia automática do resumo antes de abrir o atendimento no Instagram.
- [x] Manter botão para o cliente conferir e copiar manualmente o resumo.
- [x] Fazer o botão de atendimento tentar abrir o aplicativo Instagram no celular e usar o Instagram web como fallback.
- [x] Validar a interface móvel após trocar os pontos de contato para o link profundo do Instagram.
- [ ] Enviar a nova versão ao GitHub e confirmar o link profundo em um aparelho real.

## Painel do dono

- [x] Criar painel administrativo protegido por role `admin`.
- [x] Preparar gestão de produtos, categorias, preços, estoque, tamanhos, descrições e imagens.
- [x] Preparar gestão de pedidos e status de atendimento.
- [x] Preparar configurações editáveis da página inicial, incluindo banner, textos, benefícios, destaques, categorias e avisos.
- [x] Personalizar a navegação do painel com áreas reais da loja.
- [x] Preparar retorno do Google OAuth diretamente para `#/admin`.
- [ ] Conectar o projeto Supabase real com a URL e a chave pública fornecidas pelo responsável.
- [ ] Confirmar a conta Google do dono e atribuir role `admin` no Supabase.

## Supabase e manutenção

- [x] Preparar migração SQL com catálogo, perfis, pedidos, configurações da vitrine e RLS.
- [x] Documentar que Supabase guarda dados e não processa pagamentos.
- [x] Preparar workflow diário somente de leitura do catálogo público, sem chave privada.
- [x] Documentar o roteiro de ativação do Supabase, Google OAuth, painel e workflow de manutenção.
- [ ] Cadastrar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` nos secrets do GitHub.
- [ ] Aplicar a migração SQL no projeto Supabase real.
- [ ] Confirmar a execução diária do workflow depois que os secrets forem cadastrados.

## Qualidade e segurança

- [x] Validar TypeScript, testes automatizados e build estático após as principais alterações.
- [x] Não armazenar dados de cartão, chaves Pix privadas ou credenciais bancárias no site.
- [x] Manter RLS e permissões administrativas restritas ao role `admin`.
- [x] Documentar que pagamentos continuam sendo combinados diretamente pelo Instagram enquanto não houver gateway.
- [ ] Fazer teste final em aparelho móvel real após publicar a correção do link profundo.

## Decisões pendentes do responsável

- [ ] Fornecer URL e chave pública do projeto Supabase.
- [ ] Confirmar se o login Google dos clientes será opcional ou obrigatório; recomendação atual: opcional.
- [ ] Confirmar o e-mail Google do dono que receberá role `admin`.
- [ ] Definir, no futuro, se a loja adotará gateway para Pix, cartão e boleto.

## Histórico da correção atual

- A correção passou a priorizar `instagram://direct?username=overziedmodas9` no iPhone/iPad e `intent://direct?username=overziedmodas9` no Android, mantendo `https://ig.me/m/overziedmodas9` como fallback web direto da conversa; a confirmação no aparelho real ainda depende do responsável.
- Últimos checkpoints relevantes: `760cb8e3` (guia de ativação), `ea79c045` (OAuth e pacote atualizado), `ecea2b34` (Instagram, rotina diária e painel ampliado).

## Fim do checklist

- O projeto permanece funcional enquanto as integrações reais aguardam as credenciais e confirmações do responsável.
- Não adicionar conteúdo fictício de avaliações, depoimentos ou opiniões de clientes.
- Não publicar automaticamente; após o checkpoint, o responsável deve usar o botão Publish ou atualizar o repositório GitHub conforme o guia.

## Registro da recuperação

- O checklist foi reorganizado após uma tentativa de atualização que inseriu texto repetitivo; nenhum arquivo da aplicação foi alterado por esse incidente.

## Correção do link Instagram no Android

- [x] Ajustar a finalização do pedido para tentar o formato Android `intent://` antes do fallback web.
- [ ] Testar novamente a abertura do aplicativo Instagram no celular do responsável e publicar a correção.

### Evidência

O teste real inicial do checkout abriu o Instagram na versão web em vez do aplicativo nativo; a correção agora tenta `intent://` no Android, `instagram://` no iPhone/iPad e mantém a versão web como fallback.

Fim do registro da evidência.

### Encerramento

Fim.

### Registro final

Fim.

## Conversa direta do Instagram

- [x] Priorizar o deep link nativo de conversa direta no aplicativo e usar `https://ig.me/m/overziedmodas9` como fallback web da conversa.
- [x] Manter resumo do pedido copiável e fallback web quando o aplicativo não aceitar a abertura nativa.
- [ ] Testar em aparelho real se a conversa abre diretamente ou se o Instagram exige tocar em “Mensagem”.

Fim do registro.

## Ativação do Supabase real

- [ ] Criar a organização pessoal e o projeto gratuito `overzied-modas` no Supabase.
- [ ] Obter a URL e a chave pública do projeto para conectar a loja e o workflow diário.
- [ ] Aplicar a migração SQL, configurar o Google OAuth e promover a conta do dono para `admin`.

## Melhoria solicitada na tela de produto

- [x] Exibir nome, preço, modelo, opções e botão de compra no primeiro viewport da tela de detalhe, especialmente em celulares.
- [x] Validar a nova ordem visual no navegador, nos tamanhos desktop e mobile.
- [x] Atualizar testes e marcar a melhoria como concluída após validar o build.

## Ajustes solicitados na vitrine

- [x] Remover a promessa não confirmada de envio para todo o Brasil.
- [x] Remover a frase sobre funcionamento das 12h às 18h.

## Galeria de fotos dos produtos

- [x] Permitir que o dono cadastre múltiplas URLs de fotos para cada produto no painel.
- [x] Persistir as fotos adicionais no modelo e na migração do Supabase, mantendo compatibilidade com a imagem principal.
- [x] Exibir galeria com miniaturas, setas, indicadores e gesto de deslizar no detalhe do produto.
- [x] Criar testes automatizados para cadastro, fallback da imagem principal e navegação da galeria.
- [x] Validar a galeria em desktop e celular antes do checkpoint.

## Controle completo do catálogo pelo dono

- [x] Permitir editar nome, descrição, categoria, preço, preço promocional, tamanhos, estoque, selo, cor e fotos sem alterar código.
- [x] Permitir ocultar, reativar e remover produtos conforme disponibilidade dos modelos.

## Editor visual completo da vitrine

- [x] Permitir alterar cores globais da loja por controles seguros no painel.
- [x] Permitir alterar imagem, textos e link do banner principal.
- [x] Permitir ativar ou ocultar o banner principal sem apagar seus dados.
- [x] Permitir ativar ou ocultar seções públicas da página inicial sem editar código.

## Validação pré-GitHub

- [x] Executar verificação TypeScript sem erros.
- [x] Executar todos os testes automatizados sem falhas.
- [x] Executar o build de produção e o build estático para GitHub Pages.
- [x] Validar visualmente desktop e celular.
- [x] Testar navegação, categorias, detalhe do produto, galeria, carrinho e fluxo do Instagram.
- [x] Testar os controles administrativos e proteger os fluxos sem Supabase configurado.
- [x] Gerar novo pacote ZIP somente depois de toda a validação passar.

## Envio assistido ao GitHub

- [ ] Confirmar o username e o repositório do dono antes do envio.
- [ ] Conectar a conta do dono sem solicitar ou armazenar a senha.
- [ ] Enviar a versão final completa, incluindo `.github`, `supabase`, `docs` e os arquivos de aplicação.
- [ ] Criar o commit inicial no repositório correto.
- [ ] Conferir o workflow e orientar a configuração do GitHub Pages e dos Secrets do Supabase.

## Correção de rolagem ao abrir produto

- [x] Reproduzir o problema ao clicar em uma camisa e abrir o detalhe.
- [x] Garantir que a rota do produto sempre comece no topo da página.
- [x] Validar o comportamento no desktop e no celular, incluindo galeria e botão voltar.
- [x] Atualizar testes e gerar novo checkpoint após a correção.

## Evidências adicionais da correção de rolagem

- [x] Validar explicitamente o fluxo Home ou Categoria → Produto e registrar que a rota inicia no topo.
- [x] Testar a página de produto em viewport mobile, incluindo galeria e botão voltar.
- [x] Salvar novo checkpoint após a correção de rolagem e a validação final.

## Selo flutuante de preview

- [x] Confirmar se o texto “Made with Manus” pertence ao preview ou ao código da aplicação; ele não aparece no código publicado, apenas em logs/configuração do ambiente.
- [x] Remover o selo da aplicação caso esteja incluído nos arquivos publicados; nenhuma ocorrência foi encontrada nos arquivos publicados.
- [x] Validar o build estático e a captura mobile sem o selo público.

## Ajuste da navegação de categorias

- [x] Remover da home a grade repetida de categorias, mantendo os nomes na barra superior.
- [x] Validar que a barra superior continua levando às categorias corretas em desktop e celular.

## Ordem mobile da página de produto

- [x] Mostrar galeria e imagem da camisa antes do preço e das informações no celular.
- [x] Manter imagem e informações lado a lado no desktop.
- [x] Confirmar que “Made with Manus” não está no build público.
- [x] Repetir testes, build e inspeção visual após a alteração.

## Revisão final solicitada pelo responsável

- [x] Remover os blocos grandes de Camisetas, Bermudas, Kits e demais categorias da home, mantendo apenas a barra superior.
- [x] Confirmar no celular que a imagem e a galeria do produto aparecem antes do preço e das informações.

- [x] Testar explicitamente a navegação da barra superior para uma categoria em desktop e celular e registrar a evidência.

- [x] Testar a barra superior no desktop abrindo uma categoria pelo próprio link do header.
- [x] Testar a faixa horizontal de categorias no celular abrindo uma categoria pelo próprio link do header.

## Correção solicitada: abertura imediata do produto

- [x] Remover o efeito de rolagem visível ao abrir uma camisa a partir da home ou categoria.
- [x] Garantir que imagem, modelo e preço apareçam imediatamente no topo sem animação de scroll.
- [x] Validar a abertura do produto em desktop e celular e atualizar testes e checkpoint.

## Auditoria final antes do GitHub e Supabase

- [x] Auditar o workflow do GitHub Pages, a base do Vite e os arquivos obrigatórios do pacote final.
- [x] Auditar a inicialização do frontend quando as variáveis públicas do Supabase ainda não estiverem configuradas.
- [x] Auditar a migração SQL, RLS, login Google, role de administrador e fluxo de catálogo sem exigir alteração no código.
- [x] Executar validação final de testes, tipos, build, rotas, carrinho, Instagram e painel.
- [x] Gerar o pacote final e o roteiro de configuração incremental sem apagar o repositório.

- [x] Validar em navegador as rotas principais `#/`, categoria, produto, checkout e `#/admin` na versão auditada.
- [x] Testar explicitamente o carrinho e o resumo do pedido para Instagram sem enviar uma mensagem real.
- [x] Validar o estado seguro do painel administrativo sem Supabase configurado.

- [x] Validar explicitamente a rota `#/` na versão auditada e registrar a evidência.
- [x] Validar explicitamente a rota `#/produto/camiseta-essentials-oversized` na versão auditada e registrar a evidência.
- [x] Reconfirmar a validação completa das rotas principais após cobrir home, categoria, produto, checkout e painel.

## Lacunas encontradas na auditoria de implementação

- [x] Aplicar primary_color e background_color da vitrine na Home por variáveis CSS reais.
- [x] Fazer hero_visible controlar a exibição do hero sem apagar os dados.
- [x] Fazer os flags de visibilidade controlarem as seções públicas correspondentes da Home.
- [x] Adicionar teste automatizado da navegação da galeria e do envio de image_urls pelo formulário administrativo. Cobertura real adicionada para miniaturas, setas, swipe e campo de fotos.

## Verificação estrita do selo no artefato público

- [x] Pesquisar exatamente “Made with Manus” e variantes nos arquivos públicos e no `dist/public` após o build; resultado: nenhuma ocorrência, com relatório atualizado.
- [x] Adicionar uma checagem automatizada que falhe se o selo aparecer em arquivos públicos gerados; `build:static` agora executa a checagem contra `dist/public`.
- [x] Capturar a versão mobile da prévia e confirmar visualmente que o selo não aparece na interface da loja; evidência registrada no relatório final.
