import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createUserContext(role: "user" | "admin"): TrpcContext {
  return {
    user: { id: 1, openId: "test-user", name: "Test", email: "test@example.com", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin", () => {
  it("bloqueia a listagem administrativa de produtos para usuários sem role admin", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(caller.admin.products.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("bloqueia a listagem de pedidos para usuários sem role admin", async () => {
    const caller = appRouter.createCaller(createUserContext("user"));
    await expect(caller.admin.orders.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
