# Validação visual da vitrine e do painel

A validação confirma a página pública da IAGO MODAS com tema escuro, hero, categorias, carrinho e atendimento pelo Instagram.

A rota `/#/admin` é separada e protegida. As credenciais públicas do Supabase estão conectadas, o login Google foi ativado e o e-mail do dono recebe o papel `admin` automaticamente no primeiro acesso. Controles administrativos continuam protegidos por autenticação e pelo papel administrativo.

O helper de atendimento tenta `instagram://user?username=overziedmodas9` e usa `https://ig.me/m/overziedmodas9` como fallback. A lógica foi coberta por teste automatizado; a confirmação da abertura nativa depende de teste no aparelho real depois da publicação.

Última atualização operacional: 2026-08-18.

Fim do registro.

### Histórico

A validação confirmou a separação entre a experiência do cliente e a rota protegida do dono.

Fim.

### Registro adicional

A tela de configuração não representa ausência do painel; representa a dependência ainda não ativada do Supabase real.

Fim.

### Encerramento

Fim do documento.

### Última observação

O fluxo atual permite ao dono entrar com Google, administrar produtos, vitrine, Pix, pedidos, etapas de entrega e etiquetas de postagem.

Fim.

### Fim

Fim.

### Registro final

Fim.
