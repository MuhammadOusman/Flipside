// Wishlist Store with persistence
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  slug: string;
  size: string;
  condition: number;
};

type WishlistStore = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
};

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        set((state) => {
          const exists = state.items.find((i) => i.id === item.id);
          if (exists) return state;
          return { items: [...state.items, item] };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      isInWishlist: (id) => {
        return get().items.some((item) => item.id === id);
      },
      
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: "flipside-wishlist",
    }
  )
);
