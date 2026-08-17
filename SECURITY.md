# Segurança e pagamentos — Overzied Modas

## Proteções implementadas

A loja mantém **produtos, pedidos e painel administrativo** separados por regras de acesso. O painel usa a role `admin` tanto na interface quanto nos procedimentos do servidor. Pessoas sem essa role não conseguem consultar nem alterar catálogo ou pedidos por meio da API.

O checkout registra um pedido como `pending`, mas não confia em preços, nomes de produtos ou total enviados pelo navegador. O servidor consulta o catálogo, calcula novamente o total, verifica se cada produto está ativo, confere o tamanho escolhido e soma itens repetidos antes de validar o estoque. A lista administrativa mostra apenas dados operacionais necessários — número do pedido, cliente, data, status e total — sem exibir informações de cartão ou credenciais de pagamento.

## Estado atual de pagamento

> Nenhum gateway de pagamento está conectado nesta versão. Portanto, a loja não gera cobranças reais, não recebe dados de cartão e não armazena chave Pix, senha bancária ou token de pagamento.

O cliente pode preencher o checkout e criar um pedido pendente. A finalização real por Pix, cartão ou boleto será adicionada somente depois que o responsável pela loja escolher uma plataforma e fornecer as credenciais de forma segura.

## Requisitos obrigatórios antes de ativar cobranças reais

| Controle | Como será aplicado |
|---|---|
| Credenciais privadas | Token do gateway guardado somente em variável de ambiente do servidor, nunca no código ou no navegador. |
| Pix e cartão | QR Code, copia-e-cola e campos de cartão emitidos/processados pelo gateway; o site não salvará esses dados. |
| Confirmação de pagamento | Atualização de status apenas por notificação autenticada do gateway. |
| Verificação de integridade | Assinatura do webhook, valor, moeda, referência do pedido e idempotência devem ser validados antes de qualquer atualização. |
| Estoque | A baixa/reserva definitiva deve ocorrer por uma operação atômica quando a cobrança for aprovada. |
| Auditoria operacional | O painel seguirá exibindo somente dados necessários para atendimento e acompanhamento. |

## Antes de publicar

O responsável pela Overzied Modas deve definir o gateway de pagamento e configurar a conta de recebimento. A integração deve ser testada primeiro no modo de testes da plataforma escolhida e, somente depois, ativada para cobranças reais.
