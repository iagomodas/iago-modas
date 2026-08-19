// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { addToCart, galleryProduct, productList } = vi.hoisted(() => ({
  addToCart: vi.fn(),
  galleryProduct: {
  id: 9,
  slug: "camiseta-essentials-oversized",
  name: "Camiseta Essentials Oversized",
  category: "Camisetas",
  price: 89.9,
  oldPrice: undefined,
  badge: "NOVO",
  sizes: ["P", "M", "G"],
  color: "#82ffc5",
  description: "Produto de teste para a galeria.",
  image: "https://cdn.example.com/principal.jpg",
  images: [
    "https://cdn.example.com/principal.jpg",
    "https://cdn.example.com/frente.jpg",
    "https://cdn.example.com/costas.jpg",
  ],
  },
  productList: [] as Array<Record<string, unknown>>,
}));

productList.push(galleryProduct);

vi.mock("@/contexts/StoreContext", () => ({ useStore: () => ({ addToCart }) }));
vi.mock("@/hooks/useCatalog", () => ({ useCatalog: () => ({ products: productList, isLoading: false }) }));
vi.mock("@/lib/catalog", () => ({
  categorySlug: (category: string) => category.toLowerCase(),
  products: [galleryProduct],
  toMoney: (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`,
}));
vi.mock("@/lib/instagramOrder", () => ({ instagramDirectUrl: "https://ig.me/m/overziedmodas9" }));
vi.mock("wouter", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="#">{children}</a>,
  useRoute: () => [false, { slug: galleryProduct.slug }],
}));

import ProductPage from "../client/src/pages/ProductPage";

describe("interações da galeria do produto", () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    addToCart.mockClear();
    productList.splice(0, productList.length, galleryProduct);
  });

  it("troca a imagem ativa ao clicar em miniatura e nas setas", () => {
    render(<ProductPage />);
    expect(screen.getAllByAltText(/foto 1$/i).at(-1)!.getAttribute("src")).toBe(galleryProduct.images[0]);

    fireEvent.click(screen.getByRole("button", { name: /ver foto 3 de 3/i }));
    expect(screen.getAllByAltText(/foto 3$/i).at(-1)!.getAttribute("src")).toBe(galleryProduct.images[2]);

    fireEvent.click(screen.getByRole("button", { name: /foto anterior/i }));
    expect(screen.getAllByAltText(/foto 2$/i).at(-1)!.getAttribute("src")).toBe(galleryProduct.images[1]);

    fireEvent.click(screen.getByRole("button", { name: /próxima foto/i }));
    expect(screen.getAllByAltText(/foto 3$/i).at(-1)!.getAttribute("src")).toBe(galleryProduct.images[2]);
  });

  it("troca a imagem ativa ao deslizar para a esquerda e para a direita", () => {
    render(<ProductPage />);
    const mainImage = screen.getAllByAltText(/foto 1$/i).at(-1)!;
    const galleryFrame = mainImage.parentElement as HTMLElement;

    fireEvent.touchStart(galleryFrame, { touches: [{ clientX: 220 }] });
    fireEvent.touchEnd(galleryFrame, { changedTouches: [{ clientX: 120 }] });
    expect(screen.getAllByAltText(/foto 2$/i).at(-1)!.getAttribute("src")).toBe(galleryProduct.images[1]);

    fireEvent.touchStart(galleryFrame, { touches: [{ clientX: 120 }] });
    fireEvent.touchEnd(galleryFrame, { changedTouches: [{ clientX: 220 }] });
    expect(screen.getAllByAltText(/foto 1$/i).at(-1)!.getAttribute("src")).toBe(galleryProduct.images[0]);
  });

  it("não transforma uma URL de produto inexistente em item vendável de reserva", () => {
    productList.splice(0);
    render(<ProductPage />);

    expect(screen.getByText("PRODUTO NÃO PUBLICADO")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /adicionar ao carrinho/i })).toBeNull();
  });
});
