// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/StoreShell", () => ({
  StoreShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));
vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/contexts/ThemeContext", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/contexts/StoreContext", () => ({
  StoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/lib/supabase", () => ({ supabase: null }));
vi.mock("../client/src/components/ErrorBoundary", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock("@/pages/AdminPage", () => ({ default: () => <main>Painel administrativo carregado</main> }));
vi.mock("@/pages/CheckoutPage", () => ({ default: () => <main>Checkout carregado</main> }));
vi.mock("@/pages/Home", () => ({ default: () => <main>Início</main> }));
vi.mock("@/pages/CategoryPage", () => ({ default: () => <main>Categoria</main> }));
vi.mock("@/pages/ProductPage", () => ({ default: () => <main>Produto</main> }));
vi.mock("@/pages/SearchPage", () => ({ default: () => <main>Busca</main> }));
vi.mock("@/pages/CustomerProfilePage", () => ({ default: () => <main>Perfil</main> }));
vi.mock("@/pages/NotFound", () => ({ default: () => <main>Página não encontrada</main> }));

import App from "../client/src/App";

describe("rotas reais da aplicação com parâmetros de consulta", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  afterEach(() => cleanup());

  it("renderiza o painel administrativo em #/admin mesmo quando há query string", () => {
    window.history.replaceState({}, "", "/iago-modas/?verificacao=admin#/admin");
    render(<App />);
    expect(screen.getByText("Painel administrativo carregado")).toBeTruthy();
  });

  it("renderiza o checkout em #/checkout mesmo quando há query string", () => {
    window.history.replaceState({}, "", "/iago-modas/?verificacao=checkout#/checkout");
    render(<App />);
    expect(screen.getByText("Checkout carregado")).toBeTruthy();
  });
});
