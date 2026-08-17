import { Product } from "@/lib/catalog";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = Product & { size: string; quantity: number };

type StoreContextValue = {
  cart: CartItem[];
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size: string) => void;
  updateQuantity: (id: number, size: string, quantity: number) => void;
  removeFromCart: (id: number, size: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("om-cart") || "[]") as CartItem[];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("om-cart", JSON.stringify(cart));
  }, [cart]);

  const value = useMemo<StoreContextValue>(() => ({
    cart,
    isCartOpen,
    setCartOpen,
    addToCart: (product, size) => {
      setCart((items) => {
        const existing = items.find((item) => item.id === product.id && item.size === size);
        if (existing) return items.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
        return [...items, { ...product, size, quantity: 1 }];
      });
      setCartOpen(true);
    },
    updateQuantity: (id, size, quantity) => setCart((items) =>
      quantity <= 0 ? items.filter((item) => !(item.id === id && item.size === size)) : items.map((item) => item.id === id && item.size === size ? { ...item, quantity } : item)
    ),
    removeFromCart: (id, size) => setCart((items) => items.filter((item) => !(item.id === id && item.size === size))),
    clearCart: () => setCart([]),
    cartCount: cart.reduce((total, item) => total + item.quantity, 0),
    subtotal: cart.reduce((total, item) => total + item.price * item.quantity, 0),
  }), [cart, isCartOpen]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
