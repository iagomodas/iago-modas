import { productCategories } from "../../drizzle/schema";
import { createProduct, deleteProduct, listAdminOrders, listAdminProducts, updateProduct } from "../db";
import { adminProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(210).regex(/^[a-z0-9-]+$/, "Use letras minúsculas, números e hífens."),
  category: z.enum(productCategories),
  description: z.string().trim().min(10).max(2000),
  priceCents: z.number().int().positive(),
  compareAtPriceCents: z.number().int().positive().nullable().optional(),
  sizes: z.array(z.string().trim().min(1).max(32)).min(1).max(20),
  imageUrl: z.string().trim().min(1).max(2000),
  badge: z.enum(["NOVO", "LANÇAMENTO"]).nullable().optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  stock: z.number().int().min(0).max(100000),
  isActive: z.boolean(),
});

const serializeProduct = (input: z.infer<typeof productInputSchema>) => ({
  ...input,
  sizes: JSON.stringify(input.sizes),
  compareAtPriceCents: input.compareAtPriceCents ?? null,
  badge: input.badge ?? null,
});

export const adminRouter = router({
  products: router({
    list: adminProcedure.query(() => listAdminProducts()),
    create: adminProcedure.input(productInputSchema).mutation(async ({ input }) => ({ id: await createProduct(serializeProduct(input)) })),
    update: adminProcedure.input(z.object({ id: z.number().int().positive(), product: productInputSchema })).mutation(async ({ input }) => {
      await updateProduct(input.id, serializeProduct(input.product));
      return { success: true };
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      await deleteProduct(input.id);
      return { success: true };
    }),
  }),
  orders: router({
    list: adminProcedure.query(() => listAdminOrders()),
  }),
});
