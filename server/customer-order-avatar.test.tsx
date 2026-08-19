import { afterEach, describe, expect, it } from "vitest";
import { CustomerOrderAvatar } from "../client/src/components/CustomerOrderAvatar";

describe("foto do cliente no painel", () => {
  it("mostra as iniciais quando o cliente não enviou foto", () => {
    const avatar = CustomerOrderAvatar({ name: "João da Silva" });
    expect(avatar.type).toBe("div");
    expect(avatar.props["aria-label"]).toBe("Cliente João da Silva sem foto de perfil");
    expect(avatar.props.children).toBe("JD");
  });

  it("mostra a foto opcional do cliente quando há uma referência válida", () => {
    const avatar = CustomerOrderAvatar({ name: "João da Silva", photoUrl: "https://example.com/foto.webp" });
    expect(avatar.type).toBe("img");
    expect(avatar.props.alt).toBe("Foto de João da Silva");
    expect(avatar.props.src).toBe("https://example.com/foto.webp");
  });
});
