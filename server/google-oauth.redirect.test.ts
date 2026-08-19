import { describe, expect, it } from "vitest";
import { buildOAuthReturnUrl, normalizeLegacyOAuthCallbackUrl } from "../client/src/lib/oauthReturn";

describe("retorno do login Google", () => {
  it("preserva o subdiretório do GitHub Pages e reserva o fragmento para a sessão", () => {
    expect(buildOAuthReturnUrl("https://iagomodas.github.io/iago-modas/#/perfil", "/perfil"))
      .toBe("https://iagomodas.github.io/iago-modas/?iago_oauth_return=%2Fperfil");
    expect(buildOAuthReturnUrl("https://iagomodas.github.io/iago-modas/#/admin", "/admin"))
      .toBe("https://iagomodas.github.io/iago-modas/?iago_oauth_return=%2Fadmin");
  });

  it("preserva parâmetros normais da URL sem afetar a rota administrativa", () => {
    expect(buildOAuthReturnUrl("https://iagomodas.github.io/iago-modas/?verificacao=admin#/admin", "/admin"))
      .toBe("https://iagomodas.github.io/iago-modas/?verificacao=admin&iago_oauth_return=%2Fadmin");
  });

  it("normaliza o retorno legado que misturava a rota com o access token", () => {
    expect(normalizeLegacyOAuthCallbackUrl("https://iagomodas.github.io/iago-modas/#/perfil#access_token=abc&token_type=bearer"))
      .toBe("https://iagomodas.github.io/iago-modas/?iago_oauth_return=%2Fperfil#access_token=abc&token_type=bearer");
  });
});
