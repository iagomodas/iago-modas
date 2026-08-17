import { z } from "zod";
import { createPendingOrder } from "../db";
import { publicProcedure, router } from "../_core/trpc";

export const pendingOrderSchema = z.object({
  customerName: z.string().trim().min(3).max(180),
  customerEmail: z.string().trim().email().max(320),
  customerPhone: z.string().trim().min(8).max(32),
  postalCode: z.string().trim().min(8).max(16),
  address: z.string().trim().min(8).max(2000),
  paymentMethod: z.enum(["pix", "credit", "boleto"]),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    size: z.string().trim().min(1).max(32),
    quantity: z.number().int().positive().max(50),
  })).min(1).max(50),
});

export const ordersRouter = router({
  create: publicProcedure.input(pendingOrderSchema).mutation(async ({ input }) => createPendingOrder(input)),
});
