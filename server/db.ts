import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertProduct, InsertUser, orderItems, orders, products, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
}

export async function listAdminProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.updatedAt));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  const result = await db.insert(products).values(product);
  return Number(result[0].insertId);
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.update(products).set(product).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.delete(products).where(eq(products.id, id));
}

export type PendingOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  postalCode: string;
  address: string;
  paymentMethod: "pix" | "credit" | "boleto";
  items: Array<{
    productId: number;
    size: string;
    quantity: number;
  }>;
};

export function sumRequestedQuantities(items: PendingOrderInput["items"]) {
  const requestedQuantityByProduct = new Map<number, number>();
  for (const item of items) {
    requestedQuantityByProduct.set(item.productId, (requestedQuantityByProduct.get(item.productId) ?? 0) + item.quantity);
  }
  return requestedQuantityByProduct;
}

export async function createPendingOrder(input: PendingOrderInput) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  const requestedQuantityByProduct = sumRequestedQuantities(input.items);

  const items = [] as Array<{ productId: number; productName: string; size: string; unitPriceCents: number; quantity: number }>;
  for (const requestedItem of input.items) {
    const result = await db.select().from(products).where(eq(products.id, requestedItem.productId)).limit(1);
    const product = result[0];
    if (!product || !product.isActive) throw new Error("Um dos produtos selecionados não está mais disponível");

    let availableSizes: string[];
    try {
      availableSizes = JSON.parse(product.sizes) as string[];
    } catch {
      availableSizes = product.sizes.split(",").map((size) => size.trim()).filter(Boolean);
    }
    if (!availableSizes.includes(requestedItem.size)) throw new Error("O tamanho selecionado não está disponível para este produto");
    if ((requestedQuantityByProduct.get(product.id) ?? 0) > product.stock) throw new Error("A quantidade solicitada não está disponível em estoque");

    items.push({
      productId: product.id,
      productName: product.name,
      size: requestedItem.size,
      unitPriceCents: product.priceCents,
      quantity: requestedItem.quantity,
    });
  }
  const totalCents = items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);

  const orderNumber = `IM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const result = await db.insert(orders).values({
    orderNumber,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    postalCode: input.postalCode,
    address: input.address,
    paymentMethod: input.paymentMethod,
    paymentStatus: "pending",
    totalCents,
  });
  const orderId = Number(result[0].insertId);
  await db.insert(orderItems).values(items.map((item) => ({ ...item, orderId })));
  return { id: orderId, orderNumber };
}

export async function listAdminOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}
