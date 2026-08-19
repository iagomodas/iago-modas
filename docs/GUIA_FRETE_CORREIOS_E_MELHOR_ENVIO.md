# Guia de frete: Correios e Melhor Envio

**Atualizado em 17 de agosto de 2026.**

> Esta orientação descreve a integração técnica e operacional do frete. Antes do cadastro, o responsável legal deve confirmar a elegibilidade e os documentos exigidos pelo fornecedor escolhido.

Para exibir automaticamente no checkout modalidades como **PAC**, **SEDEX** e eventuais opções de transportadoras, a loja precisa de uma fonte de cotação integrada. Não é adequado calcular valores no navegador com regras próprias, porque preço, prazo, serviços disponíveis e dimensões variam por rota e modalidade.

| Caminho | Cadastro necessário | Resultado | Adequação inicial |
| --- | --- | --- | --- |
| Correios API direta | Contrato comercial ativo com os Correios, conta PJ no Meu Correios, cartão de postagem e serviço de API vinculado ao contrato. [1] [2] | O site consulta diretamente preços, prazos e serviços contratados. | Não é o caminho indicado para a fase inicial: exige contrato e estrutura comercial. |
| Melhor Envio | Cadastro gratuito na plataforma, no nome do responsável legal para esta loja. [3] | O site pode cotar Correios e outras transportadoras, comprar etiqueta e obter rastreio sem contrato individual com cada transportadora. | Caminho mais simples para a futura loja nacional. |
| Pedido por Instagram/Pix manual | Nenhuma integração no site. | O dono consulta o frete manualmente antes de pedir o pagamento. | Adequado enquanto a logística não estiver cadastrada. |

## O que a cotação automática precisa saber

Para que o checkout exiba apenas as modalidades que realmente atendem o endereço, a integração deverá enviar CEP de origem, CEP de destino, peso, altura, largura, comprimento e valor declarado. Assim, uma camiseta, um kit e uma bermuda podem ter fretes diferentes. A API oficial dos Correios exige, entre outros, CEP de origem, peso e tipo do objeto; dimensões ajudam a tratar o peso cúbico. [1]

O responsável pelo envio também precisa manter um endereço de origem real e os dados corretos de cada embalagem. Em rotinas comerciais dos Correios, a etiqueta demanda dados completos de remetente e destinatário; o Melhor Envio informa que CPF ou CNPJ de ambos é obrigatório para gerar suas etiquetas dos Correios. [3]

## Resposta operacional para a IAGO MODAS

Para a loja mostrar **PAC, SEDEX e outras opções agora**, ela não precisa necessariamente abrir contrato direto com os Correios. A alternativa recomendada é cadastrar uma conta no **Melhor Envio**, no nome de pai, mãe ou responsável legal, e ligar o site a essa conta quando a família autorizar a integração. A plataforma afirma que permite cotar Correios e gerar etiquetas sem contrato individual com cada transportadora. [3]

Mesmo no Melhor Envio, não se deve usar conta ou dados de cadastro do adolescente para assumir obrigações comerciais. O responsável deverá ser o titular da conta de logística, escolher e pagar a etiqueta, enquanto o dono administra a venda e faz a postagem.

Até uma integração de logística ser autorizada, a IAGO MODAS permanece no fluxo manual: o cliente informa o endereço no checkout, recebe o aviso de que o frete será combinado pelo Instagram e o dono consulta o valor antes de combinar o Pix. Não há calculadora de frete, PAC, SEDEX ou tarifa automática exibida para o cliente.

## Referências

[1]: https://www.correios.com.br/atendimento/developers/manuais/manual-api-preco-1 "Correios — Manual da API Preço"
[2]: https://www.correios.com.br/atendimento/developers/arquivos/manual-para-integracao-correios-api "Correios — Manual de Integração"
[3]: https://melhorenvio.com.br/blog/frete-e-logistica/como-calcular-o-frete-dos-correios/ "Melhor Envio — Calculadora de frete dos Correios"
