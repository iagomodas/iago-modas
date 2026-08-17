import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { sumRequestedQuantities } from "./db";
import { pendingOrderSchema } from "./routers/orders";

describe("orders.create", () => {
  it("rejects an incomplete checkout before any database write", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);
    await expect(caller.orders.create({
      customerName: "A",
      customerEmail: "email-inválido",
      customerPhone: "1",
      postalCode: "1",
      address: "x",
      paymentMethod: "pix",
      items: [],
    })).rejects.toBeDefined();
  });

  it("descarta preços, nomes e totais enviados pelo navegador", () => {
    const parsed = pendingOrderSchema.parse({
      customerName: "Cliente de Teste",
      customerEmail: "cliente@example.com",
      customerPhone: "11999999999",
      postalCode: "01001000",
      address: "Rua de Teste, 10",
      paymentMethod: "pix",
      totalCents: 1,
      items: [{ productId: 7, size: "M", quantity: 1, productName: "Valor forjado", unitPriceCents: 1 }],
    });

    expect(parsed).toEqual({
      customerName: "Cliente de Teste",
      customerEmail: "cliente@example.com",
      customerPhone: "11999999999",
      postalCode: "01001000",
      address: "Rua de Teste, 10",
      paymentMethod: "pix",
      items: [{ productId: 7, size: "M", quantity: 1 }],
    });
  });

  it("soma produtos repetidos antes de verificar o estoque", () => {
    const quantities = sumRequestedQuantities([
      { productId: 7, size: "M", quantity: 2 },
      { productId: 7, size: "G", quantity: 3 },
      { productId: 8, size: "Único", quantity: 1 },
    ]);

    expect(quantities.get(7)).toBe(5);
    expect(quantities.get(8)).toBe(1);
  });
});
