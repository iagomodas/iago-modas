# Ativação do Supabase e do painel do dono

## Objetivo

Este roteiro ativa os recursos que dependem do Supabase sem alterar o modelo comercial definido para a **IAGO MODAS**: o cliente escolhe as peças no site e envia o pedido para o Instagram **@overziedmodas9**; o dono administra produtos, preços, estoque, pedidos e textos da vitrine pelo painel privado.

> O Supabase guarda e protege os dados da loja. Ele não processa pagamentos, não recebe o dinheiro das vendas e não substitui a conversa do pedido no Instagram.

## Informações que o responsável deve fornecer

| Informação | Onde encontrar | Pode ser pública no frontend? |
|---|---|---|
| URL do projeto | Supabase → **Connect** | Sim |
| Chave `anon` ou `publishable` | Supabase → **Connect** | Sim |
| E-mail Google do dono | Conta que receberá o acesso administrativo | Não divulgar publicamente |

A chave `service_role`, senhas bancárias, chaves Pix privadas e segredos do Google **não devem ser colocados no frontend, no GitHub Pages nem enviados por mensagem**.

## Estado configurado

| Recurso | Estado atual |
|---|---|
| Loja pública | `https://iagomodas.github.io/iago-modas/` |
| Login Google | Ativo pelo Supabase com o cliente OAuth gratuito da IAGO MODAS |
| Acesso do dono | `iago765gtb@gmail.com` recebe o papel `admin` automaticamente no primeiro login |
| Pedidos | Registrados no Supabase antes de abrir o Direct do Instagram |
| Frete | Calculado e confirmado manualmente pelo dono; não há rastreio ou cobrança automática |

## Sequência de ativação para uma instalação nova

### 1. Criar o projeto Supabase e aplicar a migração

No Supabase, crie o projeto, abra **SQL Editor** e execute integralmente o arquivo:

```text
supabase/migrations/202608150001_overzied_modas.sql
```

Esse arquivo cria as tabelas, o catálogo, os perfis, as configurações editáveis da vitrine e as políticas RLS que restringem alterações ao administrador.

### 2. Cadastrar os segredos públicos no GitHub

No repositório, abra **Settings → Secrets and variables → Actions → New repository secret** e cadastre:

| Nome do segredo | Valor |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave `anon` ou `publishable` do projeto |

Esses valores aparecem no navegador por serem credenciais públicas de conexão. A segurança dos dados é garantida pelas políticas RLS no Supabase, não por esconder essas duas variáveis.

### 3. Configurar o login Google

No Supabase, abra **Authentication → Providers → Google** e ative o provedor. Configure as credenciais OAuth do projeto Google conforme as instruções do próprio Supabase. Em **Authentication → URL Configuration**, inclua o endereço público da loja:

```text
https://iagomodas.github.io/iago-modas/
```

Depois do primeiro login do dono, no SQL Editor do Supabase, atribua o papel administrativo ao e-mail correto. Na loja IAGO MODAS já publicada, essa atribuição é automática somente para `iago765gtb@gmail.com`:

```sql
update public.profiles
set role = 'admin'
where email = 'EMAIL_GOOGLE_DO_DONO';
```

Substitua `EMAIL_GOOGLE_DO_DONO` pelo e-mail real da conta Google do responsável. Somente essa conta deve receber `role = 'admin'`.

### 4. Atualizar os arquivos no GitHub e publicar

Envie o pacote atualizado ao repositório ou substitua os arquivos modificados. Em especial, confirme a presença de:

```text
.github/workflows/deploy-pages.yml
.github/workflows/supabase-weekly-check.yml
```

O arquivo chamado `supabase-weekly-check.yml` agora está configurado para uma consulta **diária**, apesar de manter o nome histórico. O workflow consulta somente o campo público `id` de no máximo um produto ativo e não faz alterações no banco.

Faça um commit na branch `main` e aguarde o GitHub Actions terminar a publicação. O workflow de manutenção será executado diariamente e também pode ser disparado manualmente pela aba **Actions**.

### 5. Conferir o painel do dono

Na loja publicada, abra:

```text
https://iagomodas.github.io/iago-modas/#/admin
```

Entre com a conta Google promovida a administradora. O painel permitirá alterar catálogo, preços, estoque, pedidos e os textos da vitrine. Clientes comuns não poderão acessar essas alterações.

## Operação diária de pedidos

O dono controla as opções de **retirada local** e **entrega na cidade** em **Painel → Vitrine → Opções locais no checkout**. A cidade, a UF e a chave Pix também são editáveis no painel. Se ambas as opções locais forem desativadas, o cliente verá apenas o envio pelos Correios com endereço completo.

Cada pedido possui dois controles independentes no painel. O primeiro confirma o **pagamento**; o segundo registra a **operação**: calcular frete, frete informado, aguardar Pix, Pix confirmado, pronto para postar, postado ou cancelado. A etiqueta serve para impressão manual e não inventa código de rastreio.

## Limites do modelo atual

O pedido é enviado ao Instagram e o Pix é combinado diretamente pelo dono. Assim, o painel pode registrar o andamento do pedido, mas não identifica automaticamente um pagamento bancário. Para confirmação automática de Pix, cartão ou boleto no futuro, será necessária uma integração com instituição de pagamento.

## Referências

- [Supabase — Project Pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Supabase — Auth com Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub Actions — Secrets](https://docs.github.com/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions)
