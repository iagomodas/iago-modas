// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { order } = vi.hoisted(() => ({
  order: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  hasSupabaseConfiguration: true,
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({ order }),
      }),
    }),
  },
}));

import { useCatalog } from "../client/src/hooks/useCatalog";

describe("catálogo conectado ao Supabase", () => {
  it("não exibe produtos locais de reserva quando a vitrine conectada não tem produtos ativos", async () => {
    order.mockResolvedValue({ data: [], error: null });
    const { result } = renderHook(() => useCatalog());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.products).toEqual([]);
    expect(result.current.isUsingFallback).toBe(false);
  });
});
