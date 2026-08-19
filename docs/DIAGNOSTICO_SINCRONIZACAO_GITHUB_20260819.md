# Diagnóstico da Sincronização da Branch Principal

Em 19 de agosto de 2026, a credencial inválida da conta histórica `overziedmodas` foi removida da configuração local do GitHub CLI. Após a limpeza, a conta `iagomodas` permaneceu autenticada e a consulta de leitura às branches do repositório continuou funcionando.

Em seguida, foi executado um envio de teste, sem alteração remota, para a branch `main` usando a credencial ativa obtida pelo GitHub CLI. O GitHub devolveu `403: Permission to iagomodas/iago-modas.git denied to iagomodas`. Portanto, a credencial antiga não era a única causa do bloqueio: a sessão tem leitura pela API e consegue operar na interface web da branch pública, mas o token atual não possui permissão de escrita Git para a branch principal.

O código-fonte atualizado continua preservado nos checkpoints do projeto e no backup publicado da branch isolada. A sincronização editável de `main` permanece dependente de uma permissão de escrita Git concedida ao token ou de um envio manual autorizado pela interface do GitHub.
