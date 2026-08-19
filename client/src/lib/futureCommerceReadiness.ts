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
