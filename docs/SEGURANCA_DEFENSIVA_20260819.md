# Segurança defensiva — IAGO MODAS

**Data:** 19 de agosto de 2026  
**Escopo:** loja pública, painel administrativo, Supabase Auth, PostgreSQL e fotos de perfil.

## Princípios adotados

> A IAGO MODAS não armazena senhas bancárias, cartões, tokens de Pix ou credenciais de provedores de pagamento. A chave Pix é um dado de recebimento exibido somente no fluxo de pedido e sua alteração depende de autorização administrativa no banco.

| Área | Controle aplicado | Resultado esperado |
|---|---|---|
| Catálogo e vitrine | Políticas RLS exigem papel administrativo para criar, editar ou excluir produtos e configurações. | Visitantes não podem mudar produtos, Pix, canais ou textos. |
| Pedidos | O painel só permite leitura e atualização ao administrador. O pedido é criado por função de banco que calcula o total a partir do catálogo. | O navegador não escolhe preços nem altera status de pagamento. |
| Fotos de clientes | Bucket `customer-profile-photos` privado, com URLs assinadas de cinco minutos e acesso somente ao dono da foto ou administrador. | Fotos não ficam expostas em links públicos permanentes. |
| Conta do cliente | Login Google e perfil próprio. Funções de perfil filtram a atualização por `auth.uid()`. | Um cliente não edita dados de outro cliente. |
| Código-fonte | Branch `main` sincronizada pela sessão autorizada do dono; a loja pública usa `gh-pages`. | A manutenção fica rastreável sem expor segredos. |
| Dependências | SDKs AWS de armazenamento atualizados para a linha `3.1113.0` após auditoria de dependências. | Reduz a exposição a vulnerabilidades transitivas já corrigidas pelo fornecedor. |

## Endurecimento do checkout

O arquivo `supabase/migrations/202608190002_security_hardening_checkout_authorization.sql` adiciona as seguintes barreiras ao pedido:

1. exige uma sessão autenticada antes de criar qualquer pedido;
2. exige que o e-mail informado no pedido seja o mesmo e-mail da conta Google conectada;
3. aceita somente os meios atualmente habilitados (`pix` e `cash`), bloqueando cartão e boleto até uma integração real;
4. preserva o cálculo de preço no banco com base no produto ativo e no estoque;
5. remove a permissão de execução da função de checkout para visitantes anônimos.

## Estado de aplicação

| Controle | Código e testes | Banco Supabase real |
|---|---|---|
| Fotos privadas | Concluído | Concluído no SQL Editor em 19/08/2026. |
| URLs assinadas para foto no cabeçalho e no painel | Concluído | Depende das políticas privadas já aplicadas. |
| Bloqueio explícito de checkout anônimo | Concluído | Concluído no SQL Editor em 19/08/2026. |
| Validação de e-mail contra a conta conectada | Concluído | Concluído no SQL Editor em 19/08/2026. |

## Operação segura no futuro

Quando pagamento automático for contratado, as chaves do provedor devem ser armazenadas como segredos do ambiente, jamais em arquivos públicos, no JavaScript do navegador ou na configuração da vitrine. A confirmação deve chegar por webhook assinado, ser validada no servidor e atualizar o pedido somente depois da verificação da assinatura e da consulta oficial ao provedor.

Para frete automático, CEP, origem, peso e dimensões devem ser validados no servidor. A etiqueta de endereçamento atual não cria rastreio nem cobra frete; ela apenas organiza dados de entrega depois da confirmação manual.

## Limites responsáveis

Não existe garantia honesta de risco zero em software exposto à internet. A proteção depende de políticas de menor privilégio, atualizações, cópias de segurança, senhas e contas bem protegidas, revisão de permissões e resposta rápida a alertas. O dono deve manter o e-mail Google, GitHub e Supabase protegidos com senha exclusiva e verificação em duas etapas.
