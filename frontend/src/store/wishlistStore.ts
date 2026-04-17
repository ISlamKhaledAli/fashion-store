import { create } from "zustand";
import { WishlistItem } from "@/types";
import { wishlistApi } from "@/lib/api";

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  fetchWishlist: async () => {
    try {
      set({ isLoading: true });
      const res = await wishlistApi.getAll();
      if (res.data.success) {
        set({ items: res.data.data as WishlistItem[] });
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      set({ isLoading: false });
    }
  },
  addItem: async (productId) => {
    try {
      const res = await wishlistApi.add(productId);
      if (res.data.success) {
        set((state) => ({ items: [...state.items, res.data.data as WishlistItem] }));
      }
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
      throw err;
    }
  },
  removeItem: async (productId) => {
    try {
      await wishlistApi.remove(productId);
      set((state) => ({
        items: state.items.filter((item) => item.productId !== productId),
      }));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      throw err;
    }
  },
  isInWishlist: (productId) => {
    return get().items.some((item) => item.productId === productId);
  },
}));
