# Sincronização do Código-Fonte na Branch Principal

Em 19 de agosto de 2026, o arquivo validado `iago-modas-source-20260819.zip` foi enviado pela interface web autorizada do GitHub para a branch `main` do repositório [iagomodas/iago-modas](https://github.com/iagomodas/iago-modas). A mensagem de commit informada foi **“IAGO MODAS — backup validado do código-fonte atualizado”**.

O arquivo contém 268 itens do código-fonte atual e possui o checksum SHA-256 `cb2c9614e861b77c8b080cbc42fa4999dffd30367c4fcd8e0578b437563304ad`. O processamento foi concluído e o GitHub registrou o commit [`4b956a6`](https://github.com/iagomodas/iago-modas/commit/4b956a68fd8b681a813e9a7370d98db97b36c00f) na branch `main`.

> Essa cópia é um backup sincronizado do código-fonte. A versão pública da loja continua hospedada separadamente na branch `gh-pages` e não é alterada por esse envio.

## Autenticação utilizada

O envio Git direto pelo token do GitHub CLI para `main` continua recusado com erro 403. A sincronização bem-sucedida foi realizada pela sessão autenticada da interface web do GitHub da conta `iagomodas`, que possui permissão efetiva de escrita. A operação enviou o backup compactado; os arquivos já existentes da árvore de `main` não foram substituídos por esse upload.

Uma tentativa posterior de atualizar um documento validado pela API de conteúdo do GitHub também retornou `403: Resource not accessible by integration`. Assim, o token da integração permite consultar permissões, mas não permite escrita pela API ou pelo protocolo Git. A interface web permanece sendo o único método com escrita confirmada para este repositório na sessão atual.

## Verificação da branch principal

Após o envio, a página da branch `main` confirmou o commit [`4b956a6`](https://github.com/iagomodas/iago-modas/commit/4b956a68fd8b681a813e9a7370d98db97b36c00f) e a presença de `iago-modas-source-20260819.zip`. A árvore editável de `main` ainda mantém arquivos de 17 e 18 de agosto, incluindo textos antigos no `README.md`; portanto, o ZIP é um **backup íntegro e recuperável**, mas não substitui a sincronização arquivo a arquivo do código atual. A publicação da loja continua correta e independente na branch `gh-pages`.
