# Diagnóstico da tela branca no GitHub Pages

> **Registro histórico:** este diagnóstico reúne eventos de 17/08/2026, anteriores ao rebranding para IAGO MODAS. Eventuais menções ao nome anterior e à URL técnica legada descrevem apenas aquela evidência.

## Evidência inicial

Em 17 de agosto de 2026, a execução do workflow de publicação concluiu com sucesso e forneceu a URL `https://overziedmodas.github.io/overzied-modas/`. Contudo, a Home nessa URL exibiu uma tela totalmente branca no navegador, sem elementos interativos visíveis.

## Causa confirmada

O título HTML carregou como `Overzied Modas — Moda Masculina`, indicando que o `index.html` foi servido. Contudo, o HTML publicado referenciou os assets em URLs sem o segmento do repositório, como `https://overziedmodas.github.io/assets/index-0QmWSQ63.js`, quando o caminho correto deve começar por `https://overziedmodas.github.io/overzied-modas/assets/`.

A causa foi o argumento `--base` não ser encaminhado ao comando do Vite pelo script `build:static`, pois o script encadeia o Vite com uma verificação de branding. A correção define `VITE_BASE_PATH` no workflow e o `vite.config.ts` lê essa variável para produzir os caminhos com `/${{ github.event.repository.name }}/`. Essa correção não altera tabelas, dados ou políticas RLS do Supabase.

## Aplicação no repositório publicado

O repositório publicado está acessível em `https://github.com/overziedmodas/overzied-modas` com sessão de proprietário ativa. Em 17 de agosto de 2026, o arquivo `vite.config.ts` publicado ainda não continha a configuração `base`, portanto necessita receber a alteração aprovada pelo responsável antes de uma nova publicação.

Durante a primeira tentativa de edição visual, o conteúdo foi encaminhado ao campo de busca de arquivos do GitHub em vez do editor; nenhuma alteração foi confirmada nem salva. A próxima ação deve preencher exclusivamente o editor do arquivo e confirmar o commit.

O editor correto é o elemento CodeMirror com `role="textbox"` e `contenteditable="true"`, contendo o início de `vite.config.ts`. A identificação foi confirmada sem salvar nenhuma modificação externa.

A tentativa de substituir o arquivo completo pelo editor visual foi truncada antes do fim e a linha de `base` não foi inserida. Essa alteração incompleta permanece apenas no editor local do navegador e não foi confirmada por commit; ela deve ser descartada antes de aplicar a mudança pontual de uma linha.

Após descartar a edição local, a API interna do CodeMirror não está exposta diretamente no DOM do GitHub. A correção deve ser inserida de forma pontual pelo próprio editor, sem substituir o arquivo inteiro e sem publicar conteúdo truncado.

A tentativa de abrir a busca interna pelo atalho do navegador não mostrou um campo utilizável. A próxima etapa é localizar a linha de configuração no conteúdo renderizado do editor para inserir somente uma linha, preservando o arquivo original.

O editor carrega 87 linhas visíveis por vez e virtualiza o restante do arquivo; a linha `export default defineConfig` não está no trecho atualmente exibido. É necessário rolar o editor até essa configuração antes de inserir a alteração pontual.

O contêiner rolável foi identificado como `.cm-scroller`. A rolagem foi posicionada na região inferior do arquivo, e a próxima verificação aguardará a atualização visual das linhas virtualizadas antes da edição.

Após a atualização do editor, a linha `export default defineConfig({` foi localizada no conteúdo renderizado. A inserção será feita logo após essa linha, preservando todas as outras configurações do Vite.

O editor foi focado e o cursor foi posicionado no fim da linha de exportação. A próxima ação criará uma nova linha para inserir exclusivamente a configuração de base do GitHub Pages.

A linha `base: process.env.VITE_BASE_PATH || "/",` foi inserida imediatamente após `export default defineConfig({` e confirmada no conteúdo do editor. A alteração ainda não foi salva no repositório; o próximo passo é registrá-la em um commit aprovado pelo usuário.

A mensagem de commit `Corrige caminhos de assets no GitHub Pages` foi preenchida, mantendo o commit direto na branch `main`, conforme autorização do responsável.

O commit `c41533b` foi salvo no repositório com a configuração de base do Vite. A inspeção seguinte confirmou que o workflow publicado ainda usa `pnpm run build:static --base=...`, argumento que não alcança o Vite por causa do script encadeado. O workflow será alterado para definir `VITE_BASE_PATH` no ambiente e executar `pnpm run build:static` sem argumento direto.

As linhas de `VITE_SUPABASE_PUBLISHABLE_KEY` e do comando de build foram localizadas no editor do workflow. Como o arquivo é curto, a alteração será limitada à inserção da variável logo após a chave pública e à substituição do comando de build na linha seguinte.

A rolagem da página já estava no limite inferior, enquanto as duas linhas do editor permaneciam abaixo da área visível. A próxima tentativa usará o próprio elemento da linha para trazê-la ao centro, sem substituir ou reordenar o restante do workflow.

O editor CodeMirror não expôs uma instância pública de edição, e a rolagem visual não aproximou as linhas da área clicável. A alteração continuará limitada às duas linhas já identificadas, usando a interação de teclado do editor após posicionar o cursor no trecho correspondente.

O workflow completo foi substituído pelo conteúdo validado. A verificação no editor confirmou `VITE_BASE_PATH: /${{ github.event.repository.name }}/`, confirmou o comando `pnpm run build:static` e confirmou a ausência do argumento obsoleto `build:static --base=`. A alteração está pronta para o commit autorizado.

A mensagem `Corrige base do deploy no GitHub Pages` foi preenchida no diálogo de commit, mantendo a gravação direta na branch `main`, conforme a autorização prévia do responsável.

O commit foi concluído no repositório do responsável, com o identificador abreviado `8697c86`. O arquivo publicado confirma a presença da variável `VITE_BASE_PATH` e do comando de build atualizado. A execução iniciada por esse commit precisa terminar antes da validação visual do endereço público.

Na página de execuções do GitHub Actions, a execução nº 12 (`Corrige base do deploy no GitHub Pages`, commit `8697c86`) estava em andamento. A execução nº 11, que contém a alteração em `vite.config.ts`, já havia concluído com sucesso. A validação pública deve ocorrer após a conclusão da execução nº 12.

Validação pública: a Home abriu em `https://overziedmodas.github.io/overzied-modas/` sem tela branca, com o cabeçalho, as categorias, o bloco principal, a imagem do modelo, os botões e a seção de benefícios renderizados. O carregamento visual confirma que os assets agora são encontrados no caminho do repositório.

Validação final: o workflow `Publicar storefront estático no GitHub Pages`, execução nº 12 do commit `8697c86`, terminou com sucesso em `https://github.com/overziedmodas/overzied-modas/actions/workflows/deploy-pages.yml`. Localmente, a execução de `VITE_BASE_PATH=/overzied-modas/ pnpm run build:static` passou após 38 testes e a checagem de tipos; o `dist/public/index.html` gerou referências para `/overzied-modas/assets/index-ppCqzntE.js` e `/overzied-modas/assets/index-Cdj49hiG.css`.

Em 17/08/2026, a verificação da coluna `storefront_settings.logo_url` no SQL Editor foi bloqueada porque a sessão do Supabase não estava autenticada. A próxima ação requer login do responsável no projeto antes de executar a consulta somente de leitura e, se necessário, a migração incremental da logo.

Após o login, a consulta em `information_schema.columns` para `public.storefront_settings.logo_url` retornou zero linhas, comprovando que a coluna ainda não existia. A migração incremental `202608170002_add_storefront_logo.sql` foi então enviada ao SQL Editor do mesmo projeto em 17/08/2026; ela adiciona `logo_url` como texto opcional, documenta a coluna e preserva a configuração atual como nula. A execução foi iniciada e aguarda confirmação de sucesso.

Confirmação da migração: o SQL Editor retornou `Success. No rows returned` para a migração. A consulta subsequente em `information_schema.columns` retornou uma linha com `column_name = logo_url`, `data_type = text` e `is_nullable = YES`. A coluna de logo configurável está presente no projeto Supabase `nqigoxncebescsdpeyjc`.

Configuração de publicação: em `https://github.com/overziedmodas/overzied-modas/settings/secrets/actions`, os Secrets de repositório `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` foram adicionados com sucesso em 17/08/2026. Falta iniciar um novo deploy manual para que a publicação use os dados reais do Supabase.

O deploy manual nº 13 foi iniciado no workflow `Publicar storefront estático no GitHub Pages` em 17/08/2026, a partir da branch `main` e do commit `8697c86`. No momento do registro, o status estava `Queued`; a execução foi iniciada depois da confirmação visual dos dois Secrets na lista do repositório.

Conclusão do deploy conectado: a execução manual nº 13 terminou com status `Success` em 39 segundos, com a URL de publicação `https://overziedmodas.github.io/overzied-modas/`. O GitHub exibiu apenas um aviso informativo sobre a descontinuação do Node.js 20 em ações de terceiros; nenhuma etapa falhou. Esta é a primeira publicação gerada após os dois Secrets públicos do Supabase terem sido cadastrados.

Validação visual após o deploy: a Home publicada permanece renderizada corretamente, com cabeçalho, categorias, imagem principal, botões, produtos e atendimento pelo Instagram. Na inspeção de recursos do navegador, não apareceu ainda nenhuma requisição para `nqigoxncebescsdpeyjc.supabase.co`; a próxima etapa é conferir o código de configuração do cliente para assegurar que os valores de build sejam realmente consumidos no GitHub Pages.

O cliente contém a inicialização correta por `import.meta.env.VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, e o hook do catálogo só consulta `products` quando ambos os valores existem. A inspeção do contexto do console ficou inconsistente após a navegação de acompanhamento do GitHub Actions e não listou os scripts da página já renderizada; a validação deve prosseguir pela inspeção direta do artefato público e pela verificação da lista de Secrets, sem alterar dados.

Validação de configuração pública: a inspeção direta do HTML publicado identificou o bundle `/overzied-modas/assets/index-f4zWE1_C.js`, que contém a URL `nqigoxncebescsdpeyjc.supabase.co`; portanto, os Secrets foram incorporados ao build. A consulta somente de leitura ao endpoint REST público `products?select=id&is_active=eq.true&limit=1`, usando a chave publishable, retornou HTTP 200 após a RLS restaurada.
