import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";
import { cartApi } from "@/lib/api";
import { useAuthStore } from "./authStore";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  promoCode: string | null;
  discountAmount: number;
  setPromo: (code: string | null, amount: number) => void;
  addItem: (item: CartItem) => void;
  setItems: (items: CartItem[]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  syncFromServer: (serverCart: any) => void;
  clearCart: () => void;
  toggleDrawer: (open?: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: null,
      discountAmount: 0,
      setPromo: (code, amount) => set({ promoCode: code, discountAmount: amount }),
      addItem: async (newItem) => {
        const { items } = get();
        const { isAuthenticated } = useAuthStore.getState();
        
        // 1. Always update local state first (Optimistic)
        const existingItem = items.find((item) => item.variantId === newItem.variantId);
        let updatedItems;

        if (existingItem) {
          updatedItems = items.map((item) =>
            item.variantId === newItem.variantId
              ? { ...item, id: item.id || `guest-${Date.now()}`, quantity: item.quantity + newItem.quantity }
              : item
          );
        } else {
          updatedItems = [...items, { ...newItem, id: newItem.id || `guest-${Date.now()}-${Math.random().toString(36).slice(2)}` }];
        }
        
        set({ items: updatedItems });

        // 2. Only sync with server if logged in
        if (isAuthenticated) {
          try {
            await cartApi.addItem(newItem.variantId, newItem.quantity);
            
            // Sync with server to get official IDs
            const serverCart = await cartApi.get();
            if (serverCart.data.success) {
              get().syncFromServer(serverCart.data.data);
            }
          } catch (err) {
            console.error("Failed to sync cart with server:", err);
          }
        }
      },
      setItems: (items) => set({ items }),
      syncFromServer: (serverData) => {
        if (!serverData?.items) return;
        
        const mappedItems = serverData.items.map((i: any) => ({
          id: i.id,
          cartItemId: i.id,
          variantId: i.variantId,
          productId: i.variant.product.id,
          name: i.variant.product.name,
          image: i.variant.product.images?.[0]?.url || "",
          price: i.variant.product.price,
          size: i.variant.size,
          color: i.variant.color,
          quantity: i.quantity,
          stock: i.variant.stock || 10,
        }));
        
        set({ items: mappedItems });
      },
      removeItem: async (id) => {
        const { isAuthenticated } = useAuthStore.getState();
        const item = get().items.find(i => i.id === id);
        
        // Update locally
        set({ items: get().items.filter((i) => i.id !== id) });
        
        // Sync server
        if (isAuthenticated && item?.cartItemId) {
          try {
            await cartApi.removeItem(item.cartItemId);
          } catch (err) {
            console.error("Failed to remove item from server:", err);
          }
        }
      },
      updateQuantity: async (id, quantity) => {
        const { isAuthenticated } = useAuthStore.getState();
        const item = get().items.find(i => i.id === id);
        
        // Update locally
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        });
        
        // Sync server
        if (isAuthenticated && item?.cartItemId) {
          try {
            await cartApi.updateQuantity(item.cartItemId, quantity);
          } catch (err) {
            console.error("Failed to update quantity on server:", err);
          }
        }
      },
      clearCart: () => set({ items: [] }),
      toggleDrawer: (open) =>
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: "cart-storage",
    }
  )
);
