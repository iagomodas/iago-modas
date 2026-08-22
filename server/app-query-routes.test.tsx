// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  unsubscribe: vi.fn(),
}));

const profileLookupMock = vi.hoisted(() => ({
  from: vi.fn(),
  maybeSingle: vi.fn(),
}));

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
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: authMock.getSession,
      onAuthStateChange: authMock.onAuthStateChange,
    },
    from: profileLookupMock.from,
  },
}));
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
    authMock.getSession.mockResolvedValue({ data: { session: null } });
    authMock.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: authMock.unsubscribe } } });
    profileLookupMock.maybeSingle.mockResolvedValue({ data: { role: "customer" } });
    profileLookupMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({ maybeSingle: profileLookupMock.maybeSingle }),
      }),
    });
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

  it("aceita os atalhos diretos de sacola e finalizar pedido", () => {
    window.history.replaceState({}, "", "/iago-modas/#/sacola");
    const { unmount } = render(<App />);
    expect(screen.getByText("Checkout carregado")).toBeTruthy();
    unmount();

    window.history.replaceState({}, "", "/iago-modas/#/finalizar-pedido");
    render(<App />);
    expect(screen.getByText("Checkout carregado")).toBeTruthy();
  });

  it("mostra carregamento, e não a tela de erro, enquanto recebe a sessão do Google", () => {
    authMock.getSession.mockReturnValueOnce(new Promise(() => undefined));
    window.history.replaceState({}, "", "/iago-modas/?iago_oauth_return=%2Fperfil#access_token=temporario");

    render(<App />);

    expect(screen.getByText("Concluindo seu login")).toBeTruthy();
    expect(screen.queryByText("Página não encontrada")).toBeNull();
  });

  it("não mostra 404 se o fragmento OAuth chegar antes da query de retorno", () => {
    authMock.getSession.mockReturnValueOnce(new Promise(() => undefined));
    window.history.replaceState({}, "", "/iago-modas/#access_token=temporario&refresh_token=atualizacao");

    render(<App />);

    expect(screen.getByText("Concluindo seu login")).toBeTruthy();
    expect(screen.queryByText("Página não encontrada")).toBeNull();
  });

  it("leva o administrador ao painel depois do retorno Google", async () => {
    authMock.getSession.mockResolvedValueOnce({ data: { session: { user: { id: "owner-id" } } } });
    profileLookupMock.maybeSingle.mockResolvedValueOnce({ data: { role: "admin" } });
    window.history.replaceState({}, "", "/iago-modas/?iago_oauth_return=%2Fperfil#access_token=temporario");

    render(<App />);

    await vi.waitFor(() => {
      expect(window.location.hash).toBe("#/admin");
    });
    expect(screen.getByText("Painel administrativo carregado")).toBeTruthy();
  });

  it("mantém o cliente em seu perfil depois do retorno Google", async () => {
    authMock.getSession.mockResolvedValueOnce({ data: { session: { user: { id: "customer-id" } } } });
    profileLookupMock.maybeSingle.mockResolvedValueOnce({ data: { role: "customer" } });
    window.history.replaceState({}, "", "/iago-modas/?iago_oauth_return=%2Fperfil#access_token=temporario");

    render(<App />);

    await vi.waitFor(() => {
      expect(window.location.hash).toBe("#/perfil");
    });
    expect(screen.getByText("Perfil")).toBeTruthy();
  });
});
