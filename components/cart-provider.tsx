"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getProduct } from "@/lib/products";
import {
  DEFAULT_PACKAGE_SIZE_ID,
  isPackageSizeId,
  unitPriceInr,
} from "@/lib/products/package-sizes";

export type CartLine = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  variant: string;
};

type CartState = { lines: CartLine[]; note: string };

type CartContextValue = {
  lines: CartLine[];
  ready: boolean;
  drawerOpen: boolean;
  note: string;
  setNote: (note: string) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  addLine: (line: Omit<CartLine, "id" | "qty"> & { qty?: number }) => void;
  hasProduct: (slug: string, variant?: string) => boolean;
  findLine: (slug: string, variant: string, price: number) => CartLine | undefined;
  setQty: (id: string, qty: number) => void;
  removeLine: (id: string) => void;
  clear: () => void;
  subtotal: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "instamealz-cart";
const empty: CartState = { lines: [], note: "" };

let state: CartState = typeof window === "undefined" ? empty : readStorage();
const listeners = new Set<() => void>();

function emit(next: CartState) {
  state = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function normalizeLine(line: CartLine): CartLine {
  if (isPackageSizeId(line.variant)) return line;
  const product = getProduct(line.slug);
  const variant = DEFAULT_PACKAGE_SIZE_ID;
  if (!product) return { ...line, variant };
  const defaultPrice = unitPriceInr(product.price, variant);
  const keepCustomPrice = line.price !== product.price && line.price !== defaultPrice;
  return {
    ...line,
    variant,
    price: keepCustomPrice ? line.price : defaultPrice,
  };
}

function readStorage(): CartState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return empty;
  try {
    const parsed = JSON.parse(saved) as CartState;
    const lines = (parsed.lines ?? []).map((line) => normalizeLine(line as CartLine));
    return { lines, note: parsed.note ?? "" };
  } catch {
    return empty;
  }
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return empty;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const cartState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = cartState.lines.reduce((sum, line) => sum + line.price * line.qty, 0);
    const count = cartState.lines.reduce((sum, line) => sum + line.qty, 0);
    return {
      lines: cartState.lines,
      ready: true,
      drawerOpen,
      note: cartState.note,
      setNote: (note) => emit({ ...getSnapshot(), note }),
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addLine: (line) => {
        const current = getSnapshot().lines;
        const match = current.find(
          (item) => item.slug === line.slug && item.variant === line.variant && item.price === line.price,
        );
        const lines = match
          ? current.map((item) => (item.id === match.id ? { ...item, qty: item.qty + (line.qty ?? 1) } : item))
          : [
              ...current,
              { ...line, qty: line.qty ?? 1, id: `${line.slug}-${line.variant}-${Date.now()}` },
            ];
        emit({ ...getSnapshot(), lines });
      },
      hasProduct: (slug, variant) =>
        cartState.lines.some((line) => line.slug === slug && (variant === undefined || line.variant === variant)),
      findLine: (slug, variant, price) =>
        cartState.lines.find(
          (item) => item.slug === slug && item.variant === variant && item.price === price,
        ),
      setQty: (id, qty) => {
        const lines =
          qty < 1
            ? getSnapshot().lines.filter((line) => line.id !== id)
            : getSnapshot().lines.map((line) => (line.id === id ? { ...line, qty } : line));
        emit({ ...getSnapshot(), lines });
      },
      removeLine: (id) => emit({ ...getSnapshot(), lines: getSnapshot().lines.filter((line) => line.id !== id) }),
      clear: () => emit(empty),
      subtotal,
      count,
    };
  }, [cartState, drawerOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export function lineFromSlug(slug: string, qty = 1, variant = DEFAULT_PACKAGE_SIZE_ID) {
  const product = getProduct(slug);
  if (!product) return null;
  return {
    slug: product.slug,
    name: product.name,
    price: unitPriceInr(product.price, variant),
    image: product.image,
    variant,
    qty,
  };
}
