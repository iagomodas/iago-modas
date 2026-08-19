# Migração da identidade GitHub — IAGO MODAS

Em 18 de agosto de 2026, a conta GitHub anteriormente identificada como `overziedmodas` foi renomeada para `iagomodas`. O repositório da loja foi preservado e permanece identificado como `iago-modas`.

| Item | Endereço atual |
| --- | --- |
| Conta GitHub | `https://github.com/iagomodas` |
| Repositório | `https://github.com/iagomodas/iago-modas` |
| Endereço público esperado | `https://iagomodas.github.io/iago-modas/` |

> O GitHub não cria redirecionamento para antigos endereços do GitHub Pages após a mudança de nome da conta. Por isso, referências públicas, configurações de autenticação e o remote local devem apontar para os endereços acima.

## Verificação pública

A abertura de `https://iagomodas.github.io/iago-modas/` foi validada após a mudança de conta, com o título **IAGO MODAS — Moda Masculina**, logo IM e catálogo renderizados.

Em **Authentication → URL Configuration** no Supabase, o Site URL e a única URL permitida de redirecionamento foram atualizados para `https://iagomodas.github.io/iago-modas/`; a URL antiga foi removida. O início do login Google também foi validado: o provedor recebeu o `redirect_to` com a nova URL pública e preservou o callback seguro do Supabase. A conclusão da sessão depende apenas de o usuário autenticar a conta Google no seletor do próprio Google.

O teste de ponta a ponta foi concluído com `iago765gtb@gmail.com`: após o retorno do Google, a aplicação removeu o token da URL e abriu corretamente `#/perfil`, exibindo o cadastro de **Iago Silva**. A breve tela 404 apresentada durante o primeiro quadro do retorno não persiste; o tratamento de sessão conclui a navegação automaticamente.
