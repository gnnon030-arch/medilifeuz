import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url: string | null;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "medilife-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (item) => {
    setItems((prev) => {
      const found = prev.find((x) => x.id === item.id);
      if (found) return prev.map((x) => (x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x));
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const remove: CartCtx["remove"] = (id) => {
    setItems((prev) => {
      const found = prev.find((x) => x.id === id);
      if (!found) return prev;
      if (found.quantity <= 1) return prev.filter((x) => x.id !== id);
      return prev.map((x) => (x.id === id ? { ...x, quantity: x.quantity - 1 } : x));
    });
  };

  const setQty: CartCtx["setQty"] = (id, qty) => {
    setItems((prev) => (qty <= 0 ? prev.filter((x) => x.id !== id) : prev.map((x) => (x.id === id ? { ...x, quantity: qty } : x))));
  };

  const clear = () => setItems([]);
  const total = items.reduce((s, x) => s + x.price * x.quantity, 0);
  const count = items.reduce((s, x) => s + x.quantity, 0);

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, total, count }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
