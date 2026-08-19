# Project TODO

## Loja e publicação

- [x] Corrigir o título interno que ainda exibe "Overzied Modas" na prévia mobile e garantir o nome oficial "OVERSIZED MODAS".
- [x] Corrigir a quebra literal `\n` no título principal do hero e revisar a legibilidade no mobile.
- [x] Ajustar a navegação horizontal de categorias para não cortar opções sem indicação de rolagem no celular.
- [x] Remover a marca visual "Made with Manus" da experiência pública antes de publicar.
- [x] Conferir e tornar explícito no painel administrativo o campo editável de chave Pix, para que o dono atualize banco, tipo ou chave sem alterar código.
- [x] Configurar iago765gtb@gmail.com como valor inicial da chave Pix editável informada pelo dono.
- [x] Corrigir a imagem da logo para exibir exatamente “OVERSIZED MODAS”, com a letra Z, preservando a identidade visual atual.
- [x] Substituir a logo antiga em todas as áreas públicas e administrativas que usem a imagem e validar a leitura no celular.
- [x] Gerar e entregar uma versão quadrada em alta qualidade da logo corrigida para publicação no Instagram.
- [x] Receber o novo nome oficial escolhido pelo dono antes de qualquer publicação final: IAGO MODAS.
- [x] Substituir a marca atual por IAGO MODAS no site, logo, painel, configurações públicas e materiais de Instagram, sem excluir produtos, clientes, pedidos ou tabelas do Supabase.
- [x] Preservar o projeto e o banco Supabase existentes durante a troca de marca; não recriar o banco de dados.
- [x] Atualizar o nome exibido do projeto Supabase para o novo nome oficial quando ele for definido, preservando a URL técnica e todos os dados existentes.
- [x] Verificar e registrar que o nome exibido do projeto Supabase permanece salvo como IAGO MODAS após a atualização.
- [x] Atualizar o nome visível da organização/conta Supabase para IAGO MODAS, preservando o projeto, o banco e as permissões existentes.
- [x] Criar a logo IAGO MODAS com o monograma IM, mantendo o fundo preto, o desenho branco e a coroa sobre a letra I.
- [x] Trocar as menções visíveis restantes de OVERSIZED MODAS e OM no pedido do Instagram, nos cartões de produto e nas etiquetas de postagem para IAGO MODAS e IM.
- [x] Atualizar o guia de demonstração pública para a operação real pelo Instagram e Supabase da IAGO MODAS.
- [x] Confirmar que o texto IAGO MODAS aparece de forma legível ao lado da logo IM no cabeçalho de celular e computador.
- [x] Manter a logo IM incorporada como fallback na publicação GitHub Pages quando a configuração remota usar caminho interno de armazenamento.
- [x] Adicionar campos de marca e coleção no cadastro administrativo de todos os produtos, incluindo camisas, calças, bermudas, calçados, acessórios, perfumes e kits.
- [x] Exibir marca e coleção no catálogo público e permitir que o dono edite esses dados em qualquer produto já cadastrado.
- [x] Cobrir a gestão de marca e coleção com migração, tipos e testes automatizados antes da publicação.
- [x] Corrigir todas as ocorrências visíveis de "Overzied Modas" para o nome oficial "OVERSIZED MODAS" no site, painel e metadados públicos.
- [x] Revisar todos os arquivos em `docs/` e padronizar a marca atual para IAGO MODAS em conteúdo operacional e público, mantendo o nome antigo apenas onde for estritamente histórico e explicitamente rotulado como registro de data.
- [x] Adicionar uma varredura automatizada que falhe se documentos públicos não históricos contiverem “Overzied Modas” ou “OVERSIZED MODAS”, exceto em identificadores técnicos e arquivos explicitamente arquivados.
- [x] Corrigir o valor padrão residual de marca no cadastro administrativo de produtos para IAGO MODAS e ampliar a verificação automatizada do código-fonte.
- [x] Renomear o repositório GitHub para "oversized-modas" e ajustar a base de publicação do GitHub Pages.
- [x] Criar a vitrine responsiva da Overzied Modas com tema escuro, logo OM, hero, categorias, catálogo, busca e carrinho.
- [x] Manter o nome completo “Overzied Modas” e a identidade visual preta, cinza e verde-neon.
- [x] Preparar o build estático para GitHub Pages com rotas por hash.
- [x] Corrigir o workflow do GitHub Pages para publicar a partir da branch `root` e usar a base do repositório.
- [x] Validar a publicação pública e corrigir a tela branca causada pelo encaminhamento incorreto da base do Vite.
- [x] Confirmar a presença das pastas `client`, `server`, `shared`, `docs`, `drizzle`, `patches`, `supabase` e `.github` no repositório.
- [x] Gerar pacotes ZIP atualizados para envio ao GitHub.

## Pedidos pelo Instagram

- [x] Tornar configuráveis no painel a cidade, o estado, retirada local, entrega local e textos exibidos ao cliente.
- [x] Adicionar campos editáveis no painel para os textos públicos de entrega, retirada local e frete combinado pelo Instagram.
- [x] Substituir no checkout as strings fixas de entrega e frete pelos valores configurados pelo dono e cobrir essa integração com testes.
- [x] Validar com testes que a chave Pix pode ser alterada pelo dono no painel e aparece atualizada no checkout.
- [x] Adicionar teste de interface do checkout para os rótulos configuráveis de retirada, entrega local, outra cidade e aviso de frete.
- [x] Exibir a chave Pix configurável no checkout e validar sua atualização por teste de interface.
- [x] Criar solicitação de pedido com nome obrigatório, endereço completo apenas para pedidos de outra cidade e sem cálculo ou cobrança de frete no site.
- [x] Registrar pedidos e endereços no Supabase com acesso exclusivo de administrador.
- [x] Abrir a mensagem direta do Instagram `@overziedmodas9` após o pedido, sem navegar intencionalmente ao perfil público.
- [x] Adicionar ao painel estados de frete manual, confirmação de Pix Nubank, postagem e etiqueta de endereço imprimível sem rastreio fictício.
- [x] Confirmar o perfil oficial `@overziedmodas9`.
- [x] Remover o fluxo público de WhatsApp e gateway de pagamento.
- [x] Adaptar o carrinho e checkout para gerar resumo com produtos, tamanhos, quantidades e total.
- [x] Preparar cópia automática do resumo antes de abrir o atendimento no Instagram.
- [x] Manter botão para o cliente conferir e copiar manualmente o resumo.
- [x] Fazer o botão de atendimento tentar abrir o aplicativo Instagram no celular e usar o Instagram web como fallback.
- [x] Validar a interface móvel após trocar os pontos de contato para o link profundo do Instagram.
- [x] Enviar a nova versão ao GitHub.
- [x] Resolver a permissão externa de escrita no GitHub para publicar o HTML atualizado da versão com textos configuráveis de entrega.
- [x] Identificar e corrigir o repositório GitHub exibido como `juliosan765/OVERZIEDMODAS`, alinhando seu nome e publicação à IAGO MODAS.
- [x] Atualizar a base do build, o workflow do GitHub Pages e os links de OAuth para o novo endereço `/iago-modas/`.
- [x] Publicar o bundle estático validado na branch usada pelo GitHub Pages do repositório `iago-modas`.
- [x] Corrigir a tela branca da loja pública regenerando e enviando o HTML consolidado sem referências externas de assets; publicação validada no commit `a85256a`.
- [x] Renomear a conta GitHub `overziedmodas` para uma identidade disponível de IAGO MODAS e substituir esse nome nos endereços públicos da loja.
- [x] Atualizar Supabase, Google OAuth, documentação e o remote local após a mudança da conta GitHub.
- [x] Validar o retorno do login Google com token no fragmento e confirmar a abertura automática de `#/perfil` na IAGO MODAS.
- [ ] Sincronizar o código-fonte e a documentação atualizados com a branch principal de `iagomodas/iago-modas`.
- [ ] Preparar e validar o pacote de sincronização autorizado para a branch principal, incluindo código-fonte, documentação e evidências da publicação recuperada.
- [x] Gerar e publicar uma cópia ZIP verificável da versão validada na branch isolada, enquanto a sincronização editável da branch principal estiver bloqueada por autorização.
- [ ] Identificar e resolver a autorização técnica que continua causando erro 403 no envio Git à branch principal; a credencial inválida de `overziedmodas` foi removida, mas o token ativo de `iagomodas` ainda não tem escrita Git em `main`.
- [x] Reexecutar o fluxo de sincronização da branch principal após remover a credencial antiga e registrar evidência objetiva de sucesso ou novo erro; o backup validado foi enviado com sucesso pela interface web no commit `4b956a6`.
- [x] Documentar qual autenticação efetivamente é usada no envio à branch principal, distinguindo o token de ambiente da configuração local do GitHub CLI; o token do CLI continua sem escrita Git e a sessão web de `iagomodas` tem escrita efetiva.
- [x] Gerar e verificar um arquivo compactado íntegro com o código-fonte atual antes de qualquer sincronização manual na branch principal; arquivo `iago-modas-source-20260819.zip` validado por integridade, com 268 itens e SHA-256 `cb2c9614e861b77c8b080cbc42fa4999dffd30367c4fcd8e0578b437563304ad`.
- [x] Validar uma autorização GitHub com permissão efetiva de escrita antes de reenviar a branch principal; a sessão autorizada publicou com sucesso os commits `2df23bf`, `433d001` e `3b01f1b` na branch pública.
- [x] Gerar um arquivo ZIP completo do código-fonte atualizado como backup profissional da IAGO MODAS.
- [x] Disponibilizar o arquivo ZIP atualizado no repositório GitHub pela interface autorizada enquanto a sincronização automática permanecer bloqueada.
- [x] Atualizar o README público da branch principal, que ainda exibe o nome antigo e referências desatualizadas da loja.
- [ ] Corrigir uma referência documental residual ao perfil de atendimento, trocando `@overziedmodas9` por `@iagomodas9`.

## Painel do dono

- [x] Exigir que cada cliente preencha e salve o próprio nome completo após o primeiro login Google, sem usar automaticamente o nome público da conta Google nos pedidos.
- [x] Validar por teste integrado o bloqueio do checkout até que o cliente conclua o cadastro próprio com nome completo.
- [x] Adicionar teste integrado do checkout com cliente autenticado sem nome completo salvo no perfil, confirmando bloqueio do envio e redirecionamento para `#/perfil`.
- [x] Adicionar no mesmo fluxo o cenário de desbloqueio após salvar nome completo próprio, confirmando que o pedido pode ser enviado normalmente.
- [x] Permitir que o cliente complete e atualize seus dados de entrega apenas na própria conta, mantendo acesso administrativo somente para o dono da loja.
- [x] Adicionar campos opcionais de entrega ao perfil, com política RLS que permita ao cliente atualizar apenas os próprios dados.
- [x] Preencher o endereço dos Correios no checkout com os dados salvos do próprio cliente, preservando a possibilidade de editar antes do pedido.
- [x] Cobrir por testes a migração de segurança e o preenchimento de entrega do próprio perfil.
- [x] Executar a suíte completa de testes após a validação de publicação e registrar o resultado verde para o fluxo de perfil de entrega.
- [x] Criar painel administrativo protegido por role `admin`.
- [x] Preparar gestão de produtos, categorias, preços, estoque, tamanhos, descrições e imagens.
- [x] Preparar gestão de pedidos e status de atendimento.
- [x] Preparar configurações editáveis da página inicial, incluindo banner, textos, benefícios, destaques, categorias e avisos.
- [x] Personalizar a navegação do painel com áreas reais da loja.
- [x] Preparar retorno do Google OAuth diretamente para `#/admin`.
- [x] Conectar o projeto Supabase real com a URL e a chave pública fornecidas pelo responsável; URL exata e Publishable key validadas pelo endpoint REST de produtos.
- [x] Confirmar o primeiro login Google do dono; a promoção automática para `admin` de `iago765gtb@gmail.com` já foi configurada no Supabase.
- [x] Corrigir o retorno do OAuth para preservar `/oversized-modas/` no GitHub Pages, testar novamente o login Google e confirmar o acesso administrativo do dono.
- [x] Processar o fragmento de sessão do Supabase antes da rota com hash para impedir a página 404 após o login Google.
- [x] Corrigir a consulta administrativa de pedidos para utilizar os campos de endereço existentes no Supabase, eliminando o erro `orders.customer_cep`.
- [x] Configurar a URL publicada do GitHub Pages como retorno permitido do Google OAuth no Supabase.
- [x] Retomar a criação das credenciais Google OAuth depois que o dono conseguir entrar na conta Google sem travamento.
- [x] Verificar a sessão conectada de `iago765gtb@gmail.com` no Google Cloud e criar as credenciais OAuth da loja.
- [x] Criar o projeto e as credenciais Google OAuth somente no modo gratuito, sem cartão, perfil de pagamentos ou serviço pago.
- [ ] Localizar uma página oficial do Google que exiba explicitamente o país ou região da conta antes de retomar o OAuth; a verificação atual confirma apenas idioma Português (Brasil), endereços não definidos e ausência de perfil de pagamentos ou cobrança.
- [x] Consultar a configuração de país da conta Google Cloud sem criar projeto, cobrança ou credencial OAuth; não há perfil de pagamentos, forma de pagamento ou cobrança.
- [x] Registrar separadamente que nenhum projeto Google Cloud, credencial OAuth ou cobrança foi criada nesta etapa.
- [x] Recuperar a resposta dos controles do painel Supabase após o travamento da sessão de autenticação Google.
- [ ] Retomar o login Google pelo controle remoto ou fechar a tomada com segurança caso o campo de senha não responda; pendência externa histórica sem evidência objetiva de encerramento.
- [x] Substituir a tela de autenticação Google travada por uma página limpa do painel Supabase.
- [x] Encerrar a sessão de controle remoto que ficou presa na tela de senha Google.
- [ ] Fechar a visualização de controle remoto que continuou visível na tela do usuário após o encerramento da sessão; pendência externa histórica sem evidência objetiva de encerramento.

## Supabase e manutenção

- [x] Preparar migração SQL com catálogo, perfis, pedidos, configurações da vitrine e RLS.
- [x] Documentar que Supabase guarda dados e não processa pagamentos.
- [x] Preparar workflow diário somente de leitura do catálogo público, sem chave privada.
- [x] Documentar o roteiro de ativação do Supabase, Google OAuth, painel e workflow de manutenção.
- [x] Cadastrar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` nos secrets do GitHub; ambos foram confirmados na lista de Secrets em 17/08/2026.
- [x] Iniciar e concluir uma publicação manual após cadastrar os Secrets públicos do Supabase; workflow nº 13 terminou com sucesso.
- [x] Confirmar que o bundle publicado contém a URL do Supabase e que a consulta pública ao catálogo responde HTTP 200 após a publicação.
- [x] Aplicar a migração SQL no projeto Supabase real; esquema, GRANTs e validação HTTP 200 concluídos.
- [x] Confirmar a execução diária do workflow depois que os secrets forem cadastrados.

## Qualidade e segurança

- [x] Validar TypeScript, testes automatizados e build estático após as principais alterações.
- [x] Não armazenar dados de cartão, chaves Pix privadas ou credenciais bancárias no site.
- [x] Manter RLS e permissões administrativas restritas ao role `admin`.
- [x] Documentar que pagamentos continuam sendo combinados diretamente pelo Instagram enquanto não houver gateway.
- [ ] Responsável testar em Android ou iPhone a abertura do Direct do Instagram a partir do checkout publicado e informar se abre a conversa diretamente ou pede o toque em “Mensagem”.
- [x] Diagnosticar e corrigir a falha de registro de pedido exibida no checkout Android antes da abertura do Instagram; produtos locais de reserva não são mais oferecidos como itens vendáveis em uma loja conectada ao Supabase.
- [x] Garantir que o botão de finalizar pedido tente abrir o aplicativo Instagram no Android após registrar o pedido, mantendo cópia do resumo e link de nova tentativa como fallback; carrinhos antigos com item não publicado não chamam o RPC.
- [x] Adicionar teste de regressão para a falha de registro de pedido e executar a suíte completa antes de publicar a correção; 29 arquivos e 73 testes aprovados, incluindo catálogo vazio e carrinho persistido.
- [x] Alinhar o payload `p_items` do checkout ao contrato real da função Supabase, usando `productId` e validando o caminho de sucesso do pedido.
- [x] Ocultar o catálogo local de reserva na publicação quando o Supabase estiver conectado e não tiver produtos ativos, evitando carrinhos com itens inexistentes no banco.
- [x] Validar no checkout se os itens persistidos no carrinho existem no catálogo Supabase antes de chamar o RPC de pedido.
- [x] Adicionar ao painel campos configuráveis para @ do Instagram, número do WhatsApp e ativação independente de cada canal.
- [x] Atualizar a vitrine e o checkout para exibirem somente os canais de atendimento ativados, com ícones e links corretos.
- [x] Aplicar no Supabase real a migração dos campos de atendimento e cobrir as configurações com testes automatizados.
- [x] Publicar no GitHub Pages a correção de catálogo e checkout preparada no HTML consolidado; commit `5e33e15` propagado e validado na URL pública.
- [ ] Dono cadastrar e ativar ao menos um produto real no painel `#/admin` antes de repetir um pedido de teste registrado no Supabase.
- [ ] Sincronizar a cópia validada do código-fonte atual com a branch principal `main` por uma operação autorizada no GitHub, sem alterar a branch pública `gh-pages`.
- [ ] Verificar a sessão do navegador e a API do GitHub para corrigir a autorização que bloqueia a sincronização da branch `main`.
- [ ] Registrar a decisão do responsável de manter login Google obrigatório, nome completo próprio e perfil de entrega antes de finalizar pedidos.
- [ ] Acompanhar o teste real no Android: conta do cliente, produto ativo, Pix, criação de pedido e abertura da conversa com @iagomodas9.
- [x] Corrigir o indicador verde de rolagem da barra horizontal de categorias para não cobrir nem cortar os nomes no celular; a navegação atual não sobrepõe indicador aos rótulos e foi conferida na versão mobile.
- [x] Validar visualmente e registrar em imagem a barra horizontal de categorias no celular, comprovando que não há indicador verde sobrepondo ou cortando os nomes.
- [x] Adicionar uma verificação automatizada ou um registro técnico objetivo da ausência do indicador problemático na navegação horizontal mobile.
- [x] Exibir no painel administrativo a foto de perfil opcional do cliente junto aos dados de cada pedido, com ícone neutro quando não houver foto.
- [x] Garantir que o painel resolva a foto somente a partir da referência protegida do perfil do cliente, sem alterar os dados do pedido.
- [x] Adicionar testes automatizados para a foto do cliente no painel de pedidos.
- [x] Publicar no GitHub Pages a atualização do painel com a foto opcional do cliente após validação.
- [x] Adicionar ao painel um resumo de vendas reais do dia, da semana e do mês, calculado apenas a partir dos pedidos registrados.
- [x] Adicionar um gráfico de tendência com vendas por período, permitindo comparar alta e baixa nas últimas semanas.
- [x] Mostrar claramente a diferença entre pedidos recebidos, pagamentos pendentes e vendas confirmadas nos indicadores.
- [x] Cobrir os cálculos dos indicadores e da tendência de vendas com testes automatizados, sem usar dados fictícios em produção.
- [x] Publicar no GitHub Pages a atualização do painel com foto de cliente e gráficos de vendas após validação.
- [x] Adicionar escolha explícita de pagamento no checkout entre Pix e dinheiro na entrega/retirada.
- [x] Exibir a chave Pix e as instruções de comprovante somente quando o cliente selecionar Pix.
- [x] Atualizar testes do checkout e validar visualmente as opções de pagamento no mobile antes da publicação.
- [x] Substituir a nomenclatura pública “Checkout” por “Finalizar pedido” ou “Seu pedido”, preservando o endereço técnico compatível.
- [x] Atualizar todas as referências de atendimento do Instagram para @iagomodas9, incluindo links, resumo do pedido, checkout, rodapé e documentação operacional.
- [x] Exibir de forma visível que a IAGO MODAS envia para todo o Brasil, mantendo o frete combinado pelo Instagram.
- [x] Aplicar no Supabase real a migração que permite dinheiro em retirada/entrega local e inclui a forma de pagamento no pedido; execução confirmada com sucesso no editor SQL em 18/08/2026.
- [x] Prosseguir autonomamente com os ajustes técnicos e de experiência já identificados, solicitando participação do responsável somente para login, publicação pública ou teste em aparelho.
- [x] Publicar no GitHub Pages o HTML consolidado com canais configuráveis, pagamento Pix/Dinheiro, “FINALIZAR PEDIDO” e @iagomodas9.
- [x] Atualizar a Home para respeitar os canais de atendimento ativados no painel, incluindo CTA e botão flutuante dinâmicos.
- [x] Adicionar testes da Home para a exibição condicional e os links configuráveis de Instagram e WhatsApp.
- [x] Adicionar um botão visível de “Entrar / Minha conta” na navegação pública da loja para clientes.
- [x] Garantir que o perfil do cliente permita criar e atualizar nome completo, telefone e endereço de entrega após o login Google.
- [x] Cobrir o botão de conta e o acesso ao perfil do cliente com testes automatizados.
- [x] Publicar no GitHub Pages a melhoria de acesso e perfil do cliente após a validação.
- [x] Permitir que o cliente envie, troque ou remova uma foto de perfil opcional, armazenada com segurança e sem usar a foto do Google automaticamente.
- [x] Exibir no topo a foto enviada pelo cliente ou, na ausência dela, um ícone neutro e as iniciais do nome cadastrado.
- [x] Cobrir a foto de perfil opcional e seu armazenamento seguro com testes automatizados.
- [x] Investigar e corrigir a tela vazia ao abrir a versão publicada com parâmetro de URL e rota administrativa; o painel carregou após a autenticação e a rota foi testada ao vivo.
- [x] Informar publicamente no checkout e no resumo do pedido que o frete será combinado pelo Instagram antes da postagem.
- [x] Adicionar teste de regressão específico para carregamento com parâmetros de consulta em `#/checkout`.
- [x] Adicionar teste integrado renderizando as rotas reais para validar `#/admin` com query string e o carregamento da tela administrativa.
- [x] Adicionar teste integrado renderizando as rotas reais para validar `#/checkout` com query string e o carregamento da tela de checkout.
- [x] Validar no navegador publicado a rota `#/checkout` com query string e registrar a evidência antes de marcar a cobertura completa como concluída.

## Decisões pendentes do responsável

- [x] Fornecer URL e chave pública do projeto Supabase.
- [x] Confirmar formalmente que o login Google dos clientes continua obrigatório antes do checkout; o responsável confirmou a decisão em 19/08/2026 e o perfil segue editável.
- [x] Confirmar o e-mail Google do dono que receberá role `admin`.
- [x] Definir o fluxo atual sem gateway: Pix Nubank manual e confirmação pelo dono no painel; eventual gateway permanece como melhoria futura, sem bloquear a loja.
- [x] Executar e registrar uma suíte final verde que cubra perfil obrigatório, redirecionamento para `#/perfil` e liberação do checkout após salvar o nome; `pnpm test` passou com 27 arquivos e 68 testes em 18/08/2026.

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
- [x] Consolidar esta validação externa no teste único de aparelho real descrito na seção de qualidade.

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
- [x] Consolidar esta validação externa no teste único de aparelho real descrito na seção de qualidade.

Fim do registro.

## Ativação do Supabase real

- [x] Criar a organização pessoal e o projeto gratuito `overzied-modas` no Supabase.
- [x] Obter a URL e a chave pública do projeto para conectar a loja e o workflow diário; ambos foram validados no endpoint REST.
- [x] Aplicar a migração SQL, configurar o Google OAuth e promover a conta do dono para `admin`.

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

- [x] Confirmar o username e o repositório do dono antes do envio.
- [x] Conectar a conta do dono por sessão autenticada e OAuth, sem solicitar nem armazenar senha.
- [x] Publicar a versão completa como backup validado, incluindo `.github`, `supabase`, `docs` e os arquivos de aplicação; a sincronização editável de `main` permanece registrada separadamente.
- [x] Criar e validar commits no repositório correto `iagomodas/iago-modas`.
- [x] Conferir o workflow e orientar a configuração do GitHub Pages e dos Secrets do Supabase.

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

## Validação runtime do Supabase real

- [x] Validar a loja e o painel usando as credenciais reais do Supabase em runtime, confirmando leitura do catálogo sem fallback indevido; Home, configurações e painel foram confirmados após o login Google.
- [x] Promover `iago765gtb@gmail.com` ao papel `admin` no Supabase após a conta concluir o primeiro login Google.
- [x] Aplicar a migração SQL no projeto Supabase real e revalidar `products` e configurações com o cliente Supabase da aplicação; tabelas, GRANTs e respostas HTTP 200 confirmados.
- [x] Após a migração, confirmar resposta 200 do catálogo real por teste de integração, não apenas ausência de 401/403; `products` e `storefront_settings` responderam 200 no runtime da Home.

## Migração parcial do Supabase

- [x] Diagnosticar quais tipos, tabelas, funções, políticas e jobs da migração já existem no projeto real; todos os objetos esperados foram confirmados.
- [x] Preparar um complemento idempotente que finalize somente os objetos ausentes; nenhum complemento foi necessário porque o diagnóstico confirmou o esquema completo.
- [x] Aplicar o complemento no SQL Editor do projeto correto sem apagar dados existentes; etapa não necessária após a confirmação de que a migração já estava completa.
- [x] Validar runtime do catálogo e do painel após a migração completa; catálogo, autenticação Google e painel administrativo foram confirmados no site publicado.

- [x] Atualizar o teste de credenciais para exigir status HTTP 200 em `products` e `storefront_settings` usando as credenciais reais.
- [x] Executar o teste de integração explícito após os GRANTs e registrar a evidência; ambos os endpoints responderam HTTP 200.

## Nova solicitação: identidade visual e Instagram

- [x] Verificar e aplicar a migração incremental `202608170002_add_storefront_logo.sql` no Supabase real; a coluna opcional `storefront_settings.logo_url` foi confirmada como `text` e aceita valores nulos.

- [x] Permitir que o dono altere a logo da loja pelo painel, sem editar código.
- [x] Persistir a logo configurada e aplicá-la na barra superior e demais pontos da vitrine.
- [x] Substituir o ícone incorreto da seção “Pedido pelo Instagram” pelo ícone oficial do Instagram.
- [x] Adicionar testes e validar a alteração no desktop e no celular.

## Correção da publicação no GitHub Pages

- [x] Diagnosticar a tela branca observada na URL publicada após uma execução de deploy bem-sucedida; os assets foram publicados sem o prefixo `/overzied-modas/`.
- [x] Aplicar no GitHub a correção da base configurável no Vite e do `VITE_BASE_PATH` no workflow; os commits `c41533b` e `8697c86` foram salvos na branch `main`.
- [x] Aguardar a conclusão verde do workflow mais recente do GitHub Pages, iniciado pelo commit `8697c86`; execução nº 12 concluída com sucesso.
- [x] Executar e registrar o build estático com a base configurável e confirmar os caminhos gerados dos assets; 38 testes, TypeScript, build estático e caminhos `/overzied-modas/assets/` validados.

## Alteração oficial do nome da loja

- [x] Atualizar a marca visível de "Overzied Modas" para "OVERSIZED MODAS" em toda a vitrine, painel, metadados e documentação pública; a marca evoluiu posteriormente para IAGO MODAS.
- [x] Manter o endereço técnico atual do repositório e GitHub Pages até que o dono solicite explicitamente uma alteração de URL.
- [x] Validar e publicar a identidade corrigida no GitHub Pages.

## Nova solicitação: loja nacional completa

- [x] Adiar a integração de gateway profissional por decisão do responsável; o fluxo atual usa Pix manual e Instagram, sem cobrança automática.
- [x] Registrar que qualquer futuro cadastro de gateway ou logística deverá ser feito pelo responsável legal adulto, sem bloquear o fluxo manual atual.
- [x] Pesquisar e documentar, com termos oficiais, quais provedores aceitam menores de idade e quais permitem efetivamente recebimentos de vendas por checkout.
- [x] Definir o frete sem cálculo automático: o valor é combinado pelo Instagram antes da postagem, sem PAC, SEDEX ou tarifas fictícias no site.
- [x] Implementar checkout com endereço completo para envios pelos Correios e retirada/entrega local simplificadas, sem exibir cálculo de frete automático.
- [x] Implementar etiqueta de endereço imprimível no painel para pedidos manuais, sem rastreio fictício.
- [x] Confirmar, com fontes oficiais, se a exibição automática de PAC, SEDEX e demais serviços exige contrato direto com os Correios ou uma conta de plataforma intermediadora de fretes.
- [x] Documentar o fluxo operacional manual dos Correios: o dono confirma frete no Instagram, imprime a etiqueta, embala, pesa e posta; rastreio somente é informado após a postagem real.
- [x] Implementar cadastro Google obrigatório para checkout, perfil com nome e endereço editáveis, registro de pedidos e acesso administrativo restrito.
- [x] Definir os dados estritamente necessários ao fluxo atual e aplicar controles de privacidade por RLS: nome completo, dados de entrega e pedidos próprios.
- [x] Validar cadastro, perfil, endereço, pedido e administração no ambiente publicado; o teste do Direct em aparelho real permanece como validação externa separada.
- [x] Renomear a etapa interna de frete para “Frete a combinar pelo Instagram”, mantendo o site sem calculadora e sem tarifa automática para o cliente.
- [x] Substituir a instrução administrativa “calcule o frete” por uma orientação clara de combinar o frete manualmente pelo Instagram.
