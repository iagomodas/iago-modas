export type ShippingPackage = {
  weightGrams?: number | null;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
};

export type ShippingQuoteReadiness = {
  ready: boolean;
  originCep: string | null;
  destinationCep: string | null;
  missing: string[];
};

export type PaymentWebhookSimulation = {
  signatureValid: boolean;
  providerPaymentId: string;
  externalReference: string;
  providerStatus: "approved" | "pending" | "rejected";
};

export type FuturePaymentTransitionState = "manual_pending" | "webhook_pending" | "paid" | "rejected";

export type FutureIntegrationCheck = {
  ready: boolean;
  missing: string[];
};

export type FutureCommerceActivationInput = {
  paymentsEnabled: boolean;
  webhookEnabled: boolean;
  paymentProvider: "manual" | "mercado_pago";
  shippingEnabled: boolean;
  shippingProvider: "manual" | "melhor_envio" | "correios";
  shippingOriginPostalCode: string;
  hasMercadoPagoAccessToken: boolean;
  hasMercadoPagoWebhookSecret: boolean;
  hasStoreUrl: boolean;
  hasCorreiosBearerToken: boolean;
};

export function normalizeBrazilianCep(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : null;
}

export function assessShippingQuoteReadiness(input: {
  originCep: string;
  destinationCep: string;
  packages: ShippingPackage[];
}): ShippingQuoteReadiness {
  const missing: string[] = [];
  const originCep = normalizeBrazilianCep(input.originCep);
  const destinationCep = normalizeBrazilianCep(input.destinationCep);
  if (!originCep) missing.push("CEP de origem da loja");
  if (!destinationCep) missing.push("CEP de destino do cliente");
  if (!input.packages.length) missing.push("produto do pedido");
  input.packages.forEach((item, index) => {
    const label = `produto ${index + 1}`;
    if (!Number.isFinite(item.weightGrams) || Number(item.weightGrams) <= 0) missing.push(`peso do ${label}`);
    if (!Number.isFinite(item.lengthCm) || Number(item.lengthCm) <= 0) missing.push(`comprimento do ${label}`);
    if (!Number.isFinite(item.widthCm) || Number(item.widthCm) <= 0) missing.push(`largura do ${label}`);
    if (!Number.isFinite(item.heightCm) || Number(item.heightCm) <= 0) missing.push(`altura do ${label}`);
  });
  return { ready: missing.length === 0, originCep, destinationCep, missing };
}

export function simulatePaymentWebhook(input: PaymentWebhookSimulation): {
  accepted: boolean;
  paymentStatus: "approved" | "pending" | "rejected";
  reason: string | null;
} {
  if (!input.signatureValid) return { accepted: false, paymentStatus: "pending", reason: "Assinatura do provedor inválida." };
  if (!input.providerPaymentId.trim() || !input.externalReference.trim()) return { accepted: false, paymentStatus: "pending", reason: "Identificadores obrigatórios ausentes." };
  return { accepted: true, paymentStatus: input.providerStatus, reason: null };
}

export function resolveFuturePaymentTransitionState(input: {
  paymentsEnabled: boolean;
  webhookEnabled: boolean;
  webhookStatus?: "approved" | "pending" | "rejected" | null;
}): FuturePaymentTransitionState {
  if (!input.paymentsEnabled || !input.webhookEnabled) return "manual_pending";
  if (input.webhookStatus === "approved") return "paid";
  if (input.webhookStatus === "rejected") return "rejected";
  return "webhook_pending";
}

export function checkMercadoPagoReadiness(input: Pick<FutureCommerceActivationInput, "paymentProvider" | "hasMercadoPagoAccessToken" | "hasMercadoPagoWebhookSecret" | "hasStoreUrl">): FutureIntegrationCheck {
  const missing: string[] = [];
  if (input.paymentProvider !== "mercado_pago") missing.push("Mercado Pago selecionado como provedor");
  if (!input.hasMercadoPagoAccessToken) missing.push("credencial de acesso do Mercado Pago no ambiente seguro");
  if (!input.hasMercadoPagoWebhookSecret) missing.push("segredo de assinatura do webhook no ambiente seguro");
  if (!input.hasStoreUrl) missing.push("endereço público da loja no ambiente seguro");
  return { ready: missing.length === 0, missing };
}

export function checkCorreiosReadiness(input: Pick<FutureCommerceActivationInput, "shippingProvider" | "shippingOriginPostalCode" | "hasCorreiosBearerToken">): FutureIntegrationCheck {
  const missing: string[] = [];
  if (input.shippingProvider !== "correios") missing.push("Correios selecionado como provedor");
  if (!normalizeBrazilianCep(input.shippingOriginPostalCode)) missing.push("CEP de origem da loja com 8 dígitos");
  if (!input.hasCorreiosBearerToken) missing.push("token dos Correios no ambiente seguro");
  return { ready: missing.length === 0, missing };
}

export function canCreateFuturePaymentPreference(input: Pick<FutureCommerceActivationInput, "paymentsEnabled" | "webhookEnabled" | "paymentProvider" | "hasMercadoPagoAccessToken" | "hasMercadoPagoWebhookSecret" | "hasStoreUrl">): FutureIntegrationCheck {
  const readiness = checkMercadoPagoReadiness(input);
  const missing = [...readiness.missing];
  if (!input.paymentsEnabled) missing.unshift("ativação de pagamento pelo administrador");
  if (!input.webhookEnabled) missing.unshift("ativação de notificações pelo administrador");
  return { ready: missing.length === 0, missing };
}

export function canRequestFutureShippingQuote(input: Pick<FutureCommerceActivationInput, "shippingEnabled" | "shippingProvider" | "shippingOriginPostalCode" | "hasCorreiosBearerToken">): FutureIntegrationCheck {
  const readiness = checkCorreiosReadiness(input);
  const missing = [...readiness.missing];
  if (!input.shippingEnabled) missing.unshift("ativação de frete pelo administrador");
  return { ready: missing.length === 0, missing };
}
