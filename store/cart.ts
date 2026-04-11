import { create } from "zustand";

export interface CartItem {
  id: string;
  title: string;
  brand: string;
  size: string;
  price: number;
  image: string;
  slug: string;
  reservedUntil?: string | null;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateReservation: (id: string, reservedUntil: string | null) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    set((state) => {
      // Check if item already exists (shouldn't happen in thrift, but just in case)
      const exists = state.items.find((i) => i.id === item.id);
      if (exists) {
        return state; // Don't add duplicate
      }
      return { items: [...state.items, item] };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateReservation: (id, reservedUntil) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, reservedUntil } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.price, 0);
  },

  getItemCount: () => {
    return get().items.length;
  },
}));
