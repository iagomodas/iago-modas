import { assessShippingQuoteReadiness, normalizeBrazilianCep, resolveFuturePaymentTransitionState, simulatePaymentWebhook } from "../client/src/lib/futureCommerceReadiness";
import { describe, expect, it } from "vitest";

describe("preparação futura de pagamento, CEP e frete", () => {
  it("normaliza CEP brasileiro sem consultar ou inventar um frete", () => {
    expect(normalizeBrazilianCep("57980-000")).toBe("57980-000");
    expect(normalizeBrazilianCep("57980000")).toBe("57980-000");
    expect(normalizeBrazilianCep("57980")).toBeNull();
  });

  it("só libera uma cotação futura quando origem, destino e embalagem estiverem completos", () => {
    expect(assessShippingQuoteReadiness({ originCep: "57980000", destinationCep: "01001000", packages: [{ weightGrams: 420, lengthCm: 30, widthCm: 22, heightCm: 6 }] })).toMatchObject({ ready: true, originCep: "57980-000", destinationCep: "01001-000", missing: [] });
    expect(assessShippingQuoteReadiness({ originCep: "", destinationCep: "01001000", packages: [{ weightGrams: 0 }] }).missing).toEqual(expect.arrayContaining(["CEP de origem da loja", "peso do produto 1", "comprimento do produto 1"]));
  });

  it("não confirma pagamento futuro quando a assinatura do webhook não é válida", () => {
    expect(simulatePaymentWebhook({ signatureValid: false, providerPaymentId: "pay_1", externalReference: "IM-1", providerStatus: "approved" })).toEqual({ accepted: false, paymentStatus: "pending", reason: "Assinatura do provedor inválida." });
    expect(simulatePaymentWebhook({ signatureValid: true, providerPaymentId: "pay_1", externalReference: "IM-1", providerStatus: "approved" })).toMatchObject({ accepted: true, paymentStatus: "approved", reason: null });
  });

  it("mantém o fluxo manual até a ativação explícita e traduz os estados do provedor", () => {
    expect(resolveFuturePaymentTransitionState({ paymentsEnabled: false, webhookEnabled: false })).toBe("manual_pending");
    expect(resolveFuturePaymentTransitionState({ paymentsEnabled: true, webhookEnabled: false })).toBe("manual_pending");
    expect(resolveFuturePaymentTransitionState({ paymentsEnabled: true, webhookEnabled: true, webhookStatus: "pending" })).toBe("webhook_pending");
    expect(resolveFuturePaymentTransitionState({ paymentsEnabled: true, webhookEnabled: true, webhookStatus: "approved" })).toBe("paid");
    expect(resolveFuturePaymentTransitionState({ paymentsEnabled: true, webhookEnabled: true, webhookStatus: "rejected" })).toBe("rejected");
  });
});
