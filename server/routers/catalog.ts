import { productCategories } from "../../drizzle/schema";
import { getProductBySlug, listActiveProducts } from "../db";
import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const catalogRouter = router({
  list: publicProcedure.query(async () => listActiveProducts()),
  bySlug: publicProcedure.input(z.object({ slug: z.string().min(1).max(210) })).query(async ({ input }) => getProductBySlug(input.slug)),
  categories: publicProcedure.query(() => productCategories),
});
