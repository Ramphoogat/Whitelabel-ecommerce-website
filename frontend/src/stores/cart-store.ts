import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  slug: string;
  name: string;
  price: number;
  tone: string;
  color: string;
  size: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeLine: (slug: string, color: string, size: string) => void;
  setQuantity: (slug: string, color: string, size: string, quantity: number) => void;
  clear: () => void;
}

const sameLine = (a: CartLine, slug: string, color: string, size: string) =>
  a.slug === slug && a.color === color && a.size === size;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addLine: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => sameLine(l, line.slug, line.color, line.size));
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                sameLine(l, line.slug, line.color, line.size)
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
              isOpen: true,
            };
          }
          return { lines: [...state.lines, { ...line, quantity }], isOpen: true };
        }),
      removeLine: (slug, color, size) =>
        set((state) => ({
          lines: state.lines.filter((l) => !sameLine(l, slug, color, size)),
        })),
      setQuantity: (slug, color, size, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (sameLine(l, slug, color, size) ? { ...l, quantity } : l))
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "cart-storage" },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.price * l.quantity, 0);
