// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { storefrontSettings, catalogProducts, clearCart } = vi.hoisted(() => ({
  storefrontSettings: {
    local_city: "Maceió",
    local_state: "AL",
    local_pickup_enabled: true,
    local_delivery_enabled: true,
    local_pickup_label: "Buscar na loja em",
    local_delivery_label: "Motoboy disponível em",
    outside_delivery_label: "Moro fora da cidade",
    outside_delivery_notice: "O frete é confirmado no Direct antes da postagem.",
    pix_key: "pix-atualizado@exemplo.com",
    instagram_enabled: true,
    instagram_handle: "iagomodas9",
    whatsapp_enabled: false,
    whatsapp_number: "",
  },
  catalogProducts: [{ id: 1 }],
  clearCart: vi.fn(),
}));

const { getUser, maybeSingle, rpc, clipboardWrite, openInstagramApp, openWhatsAppChat, supabaseClient } = vi.hoisted(() => {
  const getUser = vi.fn();
  const maybeSingle = vi.fn();
  const rpc = vi.fn();
  const clipboardWrite = vi.fn();
  const openInstagramApp = vi.fn();
  const openWhatsAppChat = vi.fn();
  return {
    getUser,
    maybeSingle,
    rpc,
    clipboardWrite,
    openInstagramApp,
    openWhatsAppChat,
    supabaseClient: {
      auth: { getUser },
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({ maybeSingle })),
        })),
      })),
      rpc,
    },
  };
});

vi.mock("@/contexts/StoreContext", () => ({
  useStore: () => ({
    cart: [{ id: 1, name: "Camiseta teste", size: "M", quantity: 1, price: 89.9, image: "https://images.example.com/camiseta.jpg" }],
    subtotal: 89.9,
    clearCart,
  }),
}));
vi.mock("@/hooks/useCatalog", () => ({ useCatalog: () => ({ products: catalogProducts, isLoading: false }) }));
vi.mock("@/hooks/useStorefrontSettings", () => ({ useStorefrontSettings: () => ({ settings: storefrontSettings }) }));
vi.mock("@/lib/catalog", () => ({ toMoney: (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}` }));
vi.mock("@/lib/instagramOrder", () => ({
  formatInstagramOrder: () => "Pedido de teste",
  formatOrderDeliveryDetails: () => "Entrega de teste",
  formatPixPayment: () => "Pix de teste",
  getInstagramOpenUrl: () => "intent://instagram-test",
  getWhatsAppChatUrl: () => "https://wa.me/5582999999999",
  openInstagramApp,
  openWhatsAppChat,
}));
vi.mock("@/lib/supabase", () => ({ supabase: supabaseClient }));
vi.mock("wouter", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a href="#">{children}</a> }));

import CheckoutPage from "../client/src/pages/CheckoutPage";

describe("checkout com configurações da vitrine", () => {
  beforeEach(() => {
    rpc.mockReset();
    clipboardWrite.mockReset();
    openInstagramApp.mockReset();
    openWhatsAppChat.mockReset();
    getUser.mockResolvedValue({ data: { user: null } });
    maybeSingle.mockResolvedValue({ data: null });
    rpc.mockResolvedValue({ data: [{ order_number: "IM-0001" }], error: null });
    clipboardWrite.mockResolvedValue(undefined);
    catalogProducts.splice(0, catalogProducts.length, { id: 1 });
    clearCart.mockReset();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: clipboardWrite } });
    window.location.hash = "";
    window.sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renderiza os textos de entrega e a chave Pix definidos pelo administrador", () => {
    render(<CheckoutPage />);

    expect(screen.getByText("Buscar na loja em Maceió — AL")).toBeTruthy();
    expect(screen.getByText("Motoboy disponível em Maceió — AL")).toBeTruthy();
    expect(screen.getByText("Moro fora da cidade")).toBeTruthy();
    expect(screen.queryByText("O frete é confirmado no Direct antes da postagem.")).toBeNull();
    expect(screen.queryByText("pix-atualizado@exemplo.com")).toBeNull();
    fireEvent.click(screen.getByLabelText("Moro fora da cidade"));
    expect(screen.getAllByText("O frete é confirmado no Direct antes da postagem.")).toHaveLength(2);
    fireEvent.click(screen.getByRole("radio", { name: /pix/i }));
    expect(screen.getByText("pix-atualizado@exemplo.com")).toBeTruthy();
  });

  it("bloqueia a finalização de cliente autenticado sem nome completo salvo e direciona ao perfil", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "cliente-sem-perfil", email: "cliente@exemplo.com" } } });
    maybeSingle.mockResolvedValue({ data: null });
    render(<CheckoutPage />);

    await waitFor(() => expect(screen.getByText(/complete seu cadastro com google/i)).toBeTruthy());
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: /finalizar pedido/i }));

    expect(screen.getByRole("status").textContent).toContain("Entre com Google e informe seu nome completo antes de enviar o pedido.");
    act(() => { vi.advanceTimersByTime(850); });
    expect(window.location.hash).toBe("#/perfil");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("libera o pedido depois que o nome completo próprio está salvo no perfil", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "cliente-com-perfil", email: "cliente@exemplo.com" } } });
    maybeSingle.mockResolvedValue({ data: { display_name: "Maria da Silva" } });
    render(<CheckoutPage />);

    await waitFor(() => expect(screen.getByText("Maria da Silva")).toBeTruthy());
    fireEvent.click(screen.getByRole("radio", { name: /pix/i }));
    fireEvent.click(screen.getByRole("button", { name: /finalizar pedido/i }));

    await waitFor(() => expect(rpc).toHaveBeenCalledWith("create_manual_delivery_order_once", expect.objectContaining({
      p_customer_name: "Maria da Silva",
      p_customer_email: "cliente@exemplo.com",
      p_delivery_mode: "local",
      p_payment_method: "pix",
      p_items: [{ productId: 1, size: "M", quantity: 1 }],
    })));
    expect(screen.getByRole("status").textContent).toContain("Pedido IM-0001 registrado");
    expect(screen.getByRole("heading", { name: /pedido IM-0001 enviado para a loja/i })).toBeTruthy();
    expect(screen.getByRole("region", { name: /chave pix da loja/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /copiar chave pix/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /abrir conversa no instagram/i })).toBeTruthy();
    expect(openInstagramApp).not.toHaveBeenCalled();
    expect(window.location.hash).toBe("");
  });

  it("permite dinheiro apenas na retirada ou entrega local e não exibe a chave Pix", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "cliente-dinheiro", email: "cliente@exemplo.com" } } });
    maybeSingle.mockResolvedValue({ data: { display_name: "Maria da Silva" } });
    render(<CheckoutPage />);

    await waitFor(() => expect(screen.getByText("Maria da Silva")).toBeTruthy());
    fireEvent.click(screen.getByRole("radio", { name: /dinheiro/i }));
    expect(screen.queryByText("pix-atualizado@exemplo.com")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /finalizar pedido/i }));

    await waitFor(() => expect(rpc).toHaveBeenCalledWith("create_manual_delivery_order_once", expect.objectContaining({
      p_delivery_mode: "local",
      p_payment_method: "cash",
    })));
    await waitFor(() => expect(screen.queryByRole("region", { name: /chave pix da loja/i })).toBeNull());
    expect(screen.queryByRole("button", { name: /copiar chave pix/i })).toBeNull();
  });

  it("preenche o endereço dos Correios apenas com os dados salvos do próprio perfil e mantém a edição disponível", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "cliente-com-endereco", email: "cliente@exemplo.com" } } });
    maybeSingle.mockResolvedValue({ data: {
      display_name: "Maria da Silva",
      delivery_phone: "82999990000",
      delivery_postal_code: "57000000",
      delivery_street: "Rua das Flores",
      delivery_number: "25",
      delivery_complement: "Casa",
      delivery_district: "Centro",
      delivery_city: "Maceió",
      delivery_state: "AL",
    } });
    render(<CheckoutPage />);

    await waitFor(() => expect(screen.getByText("Maria da Silva")).toBeTruthy());
    fireEvent.click(screen.getByLabelText("Moro fora da cidade"));

    expect((screen.getByPlaceholderText("CEP") as HTMLInputElement).value).toBe("57000000");
    expect((screen.getByPlaceholderText("Rua ou avenida") as HTMLInputElement).value).toBe("Rua das Flores");
    fireEvent.change(screen.getByPlaceholderText("Número"), { target: { value: "30" } });
    expect((screen.getByPlaceholderText("Número") as HTMLInputElement).value).toBe("30");

    fireEvent.click(screen.getByRole("radio", { name: /pix/i }));
    fireEvent.click(screen.getByRole("button", { name: /finalizar pedido/i }));
    await waitFor(() => expect(rpc).toHaveBeenCalledWith("create_manual_delivery_order_once", expect.objectContaining({
      p_customer_phone: "82999990000",
      p_postal_code: "57000000",
      p_address: "Rua das Flores",
      p_delivery_number: "30",
      p_delivery_mode: "correios",
      p_payment_method: "pix",
      p_items: [{ productId: 1, size: "M", quantity: 1 }],
    })));
  });

  it("não abre o Instagram antes de registrar o pedido quando há produto indisponível", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "cliente-sem-catalogo", email: "cliente@exemplo.com" } } });
    maybeSingle.mockResolvedValue({ data: { display_name: "Maria da Silva" } });
    rpc.mockResolvedValue({ data: null, error: { message: "Um dos produtos selecionados não está disponível" } });
    render(<CheckoutPage />);

    await waitFor(() => expect(screen.getByText("Maria da Silva")).toBeTruthy());
    fireEvent.click(screen.getByRole("radio", { name: /pix/i }));
    fireEvent.click(screen.getByRole("button", { name: /finalizar pedido/i }));

    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("ainda não está cadastrado"));
    expect(clipboardWrite).toHaveBeenLastCalledWith(expect.stringContaining("Pedido de teste"));
    expect(openInstagramApp).not.toHaveBeenCalled();
    expect(screen.queryByRole("link", { name: /tentar abrir o atendimento novamente/i })).toBeNull();
  });

  it("não chama o RPC quando o carrinho guardado contém produto que não existe no catálogo Supabase", async () => {
    catalogProducts.splice(0);
    getUser.mockResolvedValue({ data: { user: { id: "cliente-com-carrinho-antigo", email: "cliente@exemplo.com" } } });
    maybeSingle.mockResolvedValue({ data: { display_name: "Maria da Silva" } });
    render(<CheckoutPage />);

    await waitFor(() => expect(screen.getByText("Maria da Silva")).toBeTruthy());
    fireEvent.click(screen.getByRole("radio", { name: /pix/i }));
    fireEvent.click(screen.getByRole("button", { name: /finalizar pedido/i }));

    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("ainda não está publicado"));
    expect(rpc).not.toHaveBeenCalled();
    expect(clipboardWrite).toHaveBeenCalled();
    expect(openInstagramApp).not.toHaveBeenCalled();
  });

  it("inclui a forma maquininha e as parcelas no resumo copiado", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "cliente-maquininha", email: "cliente@exemplo.com" } } });
    maybeSingle.mockResolvedValue({ data: { display_name: "Maria da Silva" } });
    render(<CheckoutPage />);

    await waitFor(() => expect(screen.getByText("Maria da Silva")).toBeTruthy());
    fireEvent.click(screen.getByRole("radio", { name: /maquininha/i }));
    fireEvent.change(screen.getByRole("combobox", { name: /quantas vezes/i }), { target: { value: "3" } });
    expect(screen.getByText(/A opção de maquininha e as parcelas serão enviadas/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /finalizar pedido/i }));

    await waitFor(() => expect(rpc).toHaveBeenCalledWith("create_manual_delivery_order_once", expect.objectContaining({
      p_payment_method: "credit",
    })));
    await waitFor(() => expect(screen.queryByRole("region", { name: /chave pix da loja/i })).toBeNull());
    expect(screen.queryByRole("button", { name: /copiar chave pix/i })).toBeNull();
    expect(clipboardWrite).toHaveBeenCalledWith(expect.stringContaining("Maquininha — 3x"));
  });
});
