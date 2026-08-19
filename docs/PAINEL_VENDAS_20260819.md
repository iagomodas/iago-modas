# Painel de Vendas Reais

O painel administrativo da IAGO MODAS passou a ter a seção **Vendas reais**, alimentada exclusivamente pelos pedidos registrados no Supabase. O painel não cria exemplos, vendas fictícias ou números estimados.

| Indicador | Regra aplicada |
|---|---|
| Vendido hoje | Soma dos pedidos confirmados na data local atual. |
| Vendido na semana | Soma dos pedidos confirmados a partir da segunda-feira da semana atual. |
| Vendido no mês | Soma dos pedidos confirmados desde o primeiro dia do mês atual. |
| Pagamentos pendentes | Quantidade de pedidos com pagamento ainda pendente e sem confirmação operacional. |
| Pedidos recebidos hoje | Todos os pedidos criados hoje, independentemente de confirmação de pagamento. |

> Um pedido é considerado venda confirmada quando o pagamento está aprovado ou quando o pedido foi movido para **pago**, **pronto para postagem** ou **enviado** pelo fluxo operacional do dono.

O gráfico de área mostra a tendência dos últimos sete dias, com o valor de vendas confirmadas em cada dia. Ele permite visualizar dias de alta, queda ou ausência de vendas sem misturar pedidos pendentes com faturamento confirmado.

Nos pedidos recentes, o painel mostra a foto de perfil do cliente somente se ele tiver escolhido enviar uma. Caso contrário, exibe as iniciais do nome em um avatar neutro. A foto é lida a partir da referência de perfil protegida, sem alterar o conteúdo original do pedido.

## Validação

Os cálculos de confirmação, período diário, semanal, mensal, pendências e tendência estão cobertos em `server/sales-analytics.test.ts`. A apresentação da foto do cliente e o fallback para iniciais estão cobertos em `server/customer-order-avatar.test.tsx`. Em 19 de agosto de 2026, a suíte completa passou com **83 testes** e a compilação TypeScript foi concluída sem erros.

## Publicação

O HTML consolidado do painel atualizado foi publicado diretamente na branch pública `gh-pages` em 19 de agosto de 2026, no commit [`580a001`](https://github.com/iagomodas/iago-modas/commit/580a001cdba4968f147aa4196a768a99ae3e3a9f), com a mensagem “IAGO MODAS — painel com vendas reais e foto de cliente”.

A versão pública foi carregada com sucesso em [https://iagomodas.github.io/iago-modas/?v=580a001](https://iagomodas.github.io/iago-modas/?v=580a001). O cabeçalho preserva o acesso **Entrar / Minha conta**, a busca e a sacola, comprovando que a nova publicação manteve o acesso dos clientes enquanto o painel administrativo permanece protegido pelo login Google.
