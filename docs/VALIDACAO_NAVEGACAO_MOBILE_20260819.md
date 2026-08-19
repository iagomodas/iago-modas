# Validação da Navegação de Categorias no Celular

Em 19 de agosto de 2026, a barra de categorias da IAGO MODAS foi conferida no viewport móvel de **375 × 812 px**. A navegação usa rolagem horizontal sem barra visível, permitindo que o cliente deslize para acessar as categorias que não cabem na primeira área da tela. Não há indicador verde, seta ou camada visual sobreposta aos nomes das categorias.

Também foi acrescentado o teste automatizado `mantém as categorias móveis em rolagem horizontal sem indicador visual sobreposto` em `server/home.storefront-content.test.ts`. A execução direcionada concluiu com **6 de 6 testes aprovados**, verificando que o contêiner preserva rolagem horizontal e que o componente não contém o antigo marcador `scroll-indicator`.
