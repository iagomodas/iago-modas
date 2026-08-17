# Validação visual da vitrine e do painel

A captura da vitrine confirma a página pública da Overzied Modas com tema escuro, hero, categorias, carrinho e atendimento pelo Instagram.

A captura de `/#/admin` confirma que existe uma rota administrativa separada. Enquanto `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` não estão conectadas, a rota mostra a tela de configuração e bloqueia os controles reais. Isso é intencional para não oferecer uma área administrativa sem autenticação e persistência.

O helper de atendimento tenta `instagram://user?username=overziedmodas9` e usa `https://ig.me/m/overziedmodas9` como fallback. A lógica foi coberta por teste automatizado; a confirmação da abertura nativa depende de teste no aparelho real depois da publicação.

Data da validação: 2026-08-17.

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

O próximo passo operacional é conectar o projeto Supabase, aplicar a migração e promover a conta Google do responsável a `admin`.

Fim.

### Fim

Fim.

### Registro final

Fim.
