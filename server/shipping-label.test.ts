import { describe, expect, it } from "vitest";
import { buildShippingLabelDocument, formatPostalAddress } from "@/lib/shippingLabel";

const recipient = { name: "João da Silva", street: "Rua das Flores", number: "120", complement: "Casa 2", neighborhood: "Centro", city: "Recife", state: "PE", cep: "50000-000", phone: "81999999999" };
const sender = { name: "IAGO MODAS", street: "Rua da Loja", number: "9", complement: "", neighborhood: "Boa Vista", city: "Recife", state: "PE", cep: "50010-000", phone: "" };

describe("etiqueta de postagem manual", () => {
  it("organiza todas as linhas necessárias do endereço", () => {
    expect(formatPostalAddress(recipient)).toEqual(["João da Silva", "Rua das Flores, 120", "Casa 2", "Centro · Recife – PE", "CEP 50000-000", "Telefone: 81999999999"]);
  });

  it("gera uma etiqueta imprimível com remetente e destinatário sem inventar rastreio", () => {
    const document = buildShippingLabelDocument({ orderNumber: "IM-001", recipient, sender });

    expect(document).toContain("DESTINATÁRIO");
    expect(document).toContain("REMETENTE");
    expect(document).toContain("João da Silva");
    expect(document).toContain("IAGO MODAS");
    expect(document).toContain("Pedido IM-001");
    expect(document).toContain("código de rastreio é fornecido pelos Correios após a postagem");
    expect(document).not.toContain("AB123456789BR");
  });

  it("escapa texto inserido no endereço antes de gerar o HTML de impressão", () => {
    const document = buildShippingLabelDocument({ orderNumber: "<pedido>", recipient: { ...recipient, name: "<b>Cliente</b>" }, sender });
    expect(document).toContain("&lt;b&gt;Cliente&lt;/b&gt;");
    expect(document).toContain("Pedido &lt;pedido&gt;");
  });
});
