import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, ApiResponse } from "@/types";
import { cartApi } from "@/lib/api";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleDrawer: (open?: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setItems: (items: CartItem[]) => void;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find((item) => item.variantId === newItem.variantId);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.variantId === newItem.variantId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, newItem] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      toggleDrawer: (open) =>
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),
      setItems: (items) => set({ items }),
      fetchCart: async () => {
        try {
          const res = await cartApi.get();
          if (res.data.success) {
            // Note: res.data.data.items should match CartItem type
            set({ items: (res.data.data as any).items || [] });
          }
        } catch (error: any) {
          if (error.response?.status === 401) {
            get().clearCart();
          }
        }
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
