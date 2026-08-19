# Implementação da conta do cliente — 18/08/2026

## Foto de perfil opcional

No projeto Supabase real `nqigoxncebescsdpeyjc`, foram aplicadas com sucesso a coluna `public.profiles.profile_photo_path` e a criação/atualização do bucket público `customer-profile-photos`. O bucket aceita apenas imagens JPEG, PNG ou WebP, com até 3 MB.

O editor SQL do Supabase exigiu o identificador de papel entre aspas, `"authenticated"`. Com essa correção, as políticas de inserção e remoção foram aplicadas usando o diretório do próprio usuário autenticado e a função segura de perfil foi criada para registrar somente o caminho da imagem da conta conectada. A aplicação troca uma imagem removendo primeiro a foto anterior e enviando a nova, sem liberar acesso à pasta de outro cliente.

## Estado confirmado no Supabase em 19 de agosto de 2026

No projeto [`nqigoxncebescsdpeyjc`](https://supabase.com/dashboard/project/nqigoxncebescsdpeyjc), a coluna opcional `profiles.profile_photo_path`, o bucket público controlado `customer-profile-photos` (limite de 3 MB e formatos JPEG, PNG e WebP), as políticas de **inserção** e **remoção** restritas ao diretório do usuário autenticado e a função segura de referência da foto foram criados com sucesso. A interface da conta usa esse fluxo de remoção seguida de novo envio para troca de imagem, preservando a mesma verificação de diretório baseada em `auth.uid()`.

## Publicação no GitHub Pages

Em 19 de agosto de 2026, a versão com a área de conta do cliente foi publicada na branch pública `gh-pages` no commit [`433d001`](https://github.com/iagomodas/iago-modas/commit/433d001fe4c5dacb920bad9ae5313f5fb7c52f52). A verificação visual identificou que o HTML inicial ainda não continha o ícone de conta; por isso, o pacote estático foi regenerado e reenviado no commit corretivo [`3b01f1b`](https://github.com/iagomodas/iago-modas/commit/3b01f1b3af651d36e370f6c11e6e8f565be8859e).

A versão pública foi confirmada em [https://iagomodas.github.io/iago-modas/](https://iagomodas.github.io/iago-modas/). O cabeçalho mostra o controle de conta antes da busca e da sacola, mantendo o restante da vitrine intacto.

A rota pública [https://iagomodas.github.io/iago-modas/#/perfil](https://iagomodas.github.io/iago-modas/#/perfil) também foi conferida após a publicação. Ela apresenta o formulário “Seu cadastro”, com edição de nome completo, telefone, CEP, rua/avenida, número, complemento, bairro, cidade e UF, além do botão “Salvar meu cadastro”.
