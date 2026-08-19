# Requisitos oficiais para integrações futuras

> **Estado de implementação:** em 19/08/2026, as migrações inativas de preparação foram aplicadas no Supabase de produção com sucesso. Além dos campos de provedor, peso, dimensões e CEP, o pedido possui estados explícitos de transição (`manual_pending`, `webhook_pending`, `paid` e `rejected`). Nenhuma cobrança, webhook, cotação ou geração de etiqueta automática foi ativada.

## Objetivo

Este registro organiza os requisitos técnicos para uma futura ativação de pagamento automático e cálculo de frete na IAGO MODAS. A loja permanece no modo atual: Pix manual, pagamento em dinheiro local e frete combinado no atendimento. Nenhuma credencial de pagamento ou frete é armazenada neste repositório ou exibida no navegador.

## Pagamento automático

Uma integração futura com Mercado Pago deverá criar o pagamento no servidor, manter credenciais apenas em variáveis protegidas e atualizar o pedido somente após receber e validar uma notificação HTTPS do provedor. A notificação deve ter a assinatura secreta verificada no cabeçalho `x-signature`; não é aceitável aprovar pedido apenas por dados enviados pelo navegador.

Enquanto a automação estiver desativada, os pedidos novos permanecem em `manual_pending`. A transição para `webhook_pending` só poderá ocorrer depois de uma ativação administrativa explícita, com credenciais guardadas no servidor. Os estados `paid` e `rejected` são reservados para um resultado confirmado e validado pelo provedor.

O Mercado Pago oferece ambiente de teste, URL de webhook separada para produção, evento de pagamento/order e simulação de notificações. A integração deverá usar ambiente de teste antes de produção e registrar eventos de forma idempotente, para que a repetição de uma notificação não altere o mesmo pedido mais de uma vez.

## Frete automático

Para cotar frete, cada produto precisará ter peso, largura, altura e comprimento confiáveis, além do CEP de origem da loja. A cotação dependerá também do CEP de destino e do valor dos itens. Esses dados devem ser validados no servidor e não podem ser alterados pelo cliente.

O Melhor Envio disponibiliza ambiente Sandbox separado do ambiente de produção. Esse ambiente permite simular cotações, etiquetas e atualizações de status sem gerar envio real. A migração futura deverá começar no Sandbox, manter o token OAuth2 somente no servidor e usar HTTPS.

## CEP para qualquer cidade brasileira

O CEP serve para localizar e validar o endereço do cliente; ele não é, por si só, um preço de frete. Na evolução futura, o formulário aceitará apenas oito dígitos, consultará o endereço e preencherá de forma assistida logradouro, bairro, cidade e UF. O número e o complemento continuarão sob responsabilidade do cliente. CEP inválido, inexistente ou não encontrado deve bloquear apenas o avanço do endereço, com uma mensagem clara para conferência.

Enquanto a integração de frete estiver desativada, a consulta de CEP poderá auxiliar o preenchimento do endereço, mas não exibirá prazo, modalidade ou valor de entrega. Quando houver um provedor contratado, a cotação será formada pelo CEP de origem configurado pelo dono, CEP de destino informado pelo cliente, peso e dimensões embaladas de cada produto, quantidade e modalidades habilitadas. Assim, o site poderá atender clientes de qualquer cidade sem inventar preço ou prazo.

Os Correios oferecem APIs de CEP, preço, prazo e pré-postagem, porém seu uso formal requer cadastro e credenciais apropriadas conforme o contrato. Uma alternativa de preenchimento de endereço é o ViaCEP, que recebe CEP com oito dígitos e retorna dados de endereçamento; ele não substitui o provedor responsável por preço, prazo ou postagem.[9] [10]

## Controles obrigatórios antes de ativar

| Controle | Regra de implementação |
| --- | --- |
| Credenciais | Nunca expor token, chave secreta, refresh token ou chave privada no navegador, código versionado ou banco público. |
| Autorização | Somente a função administrativa autenticada pode ativar, pausar ou alterar configuração financeira e logística. |
| Webhook | Validar assinatura, consultar o provedor antes de marcar como pago, registrar o identificador externo e rejeitar duplicidade. |
| Valores | Recalcular total, desconto e frete no servidor com preços oficiais do catálogo; nunca confiar em preço enviado pelo navegador. |
| Sandbox | Executar testes de aprovação, recusa, expiração, duplicação e reembolso antes de ativar produção. |
| Frete | Validar CEP, peso e dimensões; salvar a cotação aceita no pedido antes de comprar ou gerar uma etiqueta. |
| Auditoria | Registrar alterações administrativas de canal, Pix, fornecedor de pagamento e origem de postagem. |

## Controles de segurança atuais e contínuos

As tabelas expostas no Supabase devem ter RLS habilitada e privilégios mínimos para os papéis `anon` e `authenticated`. A política deve diferenciar catálogo público, pedidos do próprio cliente e ações exclusivas de administrador. Criar uma policy não basta: os privilégios de tabela devem ser revisados para que nenhuma operação de escrita permaneça liberada indevidamente.

O bucket de fotos deve limitar leitura e escrita ao usuário proprietário e à pasta correspondente. A chave de serviço do Supabase jamais pode ser enviada ao navegador, porque ela ignora RLS. Funções que precisem de `security definer` devem declarar `search_path` seguro e receber somente a menor permissão necessária.

Antes de cada entrega importante, devem ser conferidos o Security Advisor do Supabase, as migrações de RLS, a autorização do painel e os testes de tentativas não autorizadas de atualização de produto, Pix, pedido e perfil de outro cliente.

## Referências

[1] Mercado Pago. [Webhooks — Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/notifications/webhooks).

[2] Mercado Pago. [Configurar notificações de orders](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/notifications).

[3] Melhor Envio. [Cotação de fretes](https://docs.melhorenvio.com.br/docs/cotacao-de-fretes).

[4] Melhor Envio. [Introdução à API e Sandbox](https://docs.melhorenvio.com.br/reference/introducao-api-melhor-envio).

[5] Supabase. [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

[6] Supabase. [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control).

[7] Supabase. [Database Functions](https://supabase.com/docs/guides/database/functions).

[8] Supabase. [Performance and Security Advisors](https://supabase.com/docs/guides/database/database-advisors).

[9] ViaCEP. [Webservice de consulta e pesquisa de CEP](https://viacep.com.br/).

[10] Correios. [Manual de Integração das APIs](https://www.correios.com.br/atendimento/developers/arquivos/manual-para-integracao-correios-api).
