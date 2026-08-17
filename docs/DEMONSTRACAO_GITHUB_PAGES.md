# Demonstração da Overzied Modas no celular

Este roteiro permite publicar a vitrine atual para apresentar a loja ao responsável antes de decidir entre o modelo completo com Supabase ou o fechamento de pedidos exclusivamente pelo WhatsApp.

## Publicação no GitHub Pages

1. Extraia o arquivo ZIP do projeto em um computador.
2. Crie no GitHub um repositório novo, por exemplo `overzied-modas`, e identifique a ramificação principal. Geralmente ela se chama `main`, mas alguns repositórios usam `root`.
3. Envie todos os arquivos extraídos para o repositório, inclusive a pasta `.github`, pois ela contém a automação de publicação.
4. No repositório, abra **Settings → Pages** e selecione **GitHub Actions** como origem da publicação.
5. Abra a aba **Actions**. O workflow **Publicar storefront estático no GitHub Pages** será executado automaticamente depois do envio para `main` ou `root`.
6. Ao terminar, o GitHub mostrará um endereço neste formato:

```text
https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
```

7. Copie esse endereço e abra-o no navegador do celular. Esse é o link ideal para mostrar a vitrine ao responsável.

## O que mostrar na apresentação

| Tela | O que explicar |
|---|---|
| Página inicial | Marca, destaque visual, categorias e botão de atendimento. |
| Categoria | Produtos organizados por camisetas, bermudas, kits, calças, calçados, esportivo, perfumes e acessórios. |
| Página de produto | Fotos, preço, tamanhos, carrinho e botão do WhatsApp. |
| Carrinho e checkout | Experiência de compra preparada para a decisão do responsável. |
| Painel administrativo | Será liberado apenas para a conta Google autorizada se o responsável escolher o modelo com Supabase. |

## Limitações da demonstração antes do Supabase

Enquanto o Supabase não estiver conectado, o catálogo exibido é de demonstração e as alterações administrativas não ficam gravadas para todos os visitantes. O checkout também não registra pedidos reais nem processa pagamentos. Antes de divulgar a loja a clientes, será necessário informar o número oficial do WhatsApp e escolher um dos dois modelos abaixo.

| Escolha do responsável | Próxima configuração |
|---|---|
| Fechamento pelo WhatsApp | Configurar o número oficial e fazer o carrinho montar a mensagem do pedido para o atendimento. |
| Loja completa | Conectar Supabase, ativar a conta Google do dono, salvar produtos e pedidos e escolher o gateway de pagamento. |

> A demonstração visual pode ser publicada mesmo sem Supabase. As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` só serão necessárias quando o banco real for criado.
