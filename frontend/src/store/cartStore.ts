import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";
import { cartApi } from "@/lib/api";
import { useAuthStore } from "./authStore";
import { toast } from "sonner";

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
  syncFromServer: (serverCart: unknown) => void;
  clearCart: () => void;
  toggleDrawer: (open?: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncingIds: string[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      promoCode: null,
      discountAmount: 0,
      syncingIds: [],
      setPromo: (code, amount) => set({ promoCode: code, discountAmount: amount }),
      addItem: async (newItem) => {
        const { items, syncingIds } = get();
        const { isAuthenticated } = useAuthStore.getState();
        
        const existingItem = items.find((item) => item.variantId === newItem.variantId);
        const tempId = newItem.id || `temp-${Date.now()}`;
        
        const previousItems = items;
        let updatedItems;

        if (existingItem) {
          updatedItems = items.map((item) =>
            item.variantId === newItem.variantId
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        } else {
          updatedItems = [...items, { ...newItem, id: tempId }];
        }
        
        set({ items: updatedItems, syncingIds: [...syncingIds, tempId] });

        if (isAuthenticated) {
          try {
            await cartApi.addItem(newItem.variantId, newItem.quantity);
            const serverCart = await cartApi.get();
            if (serverCart.data.success) {
              get().syncFromServer(serverCart.data.data);
            }
          } catch (err) {
            set({ items: previousItems });
            toast.error("Failed to add item to cart. Please try again.");
          } finally {
            set((state) => ({ syncingIds: state.syncingIds.filter(id => id !== tempId) }));
          }
        } else {
          set((state) => ({ syncingIds: state.syncingIds.filter(id => id !== tempId) }));
        }
      },
      setItems: (items) => set({ items }),
      syncFromServer: (serverData: unknown) => {
        const data = serverData as { items?: any[] };
        if (!data?.items) return;
        
        const mappedItems = data.items.map((i: {
          id: string;
          variantId: string;
          variant: {
            stock?: number;
            size: string;
            color: string;
            product: {
              id: string;
              name: string;
              price: number;
              images?: { url: string }[];
            };
          };
          quantity: number;
        }) => ({
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
        const { items, syncingIds } = get();
        const item = items.find(i => i.id === id);
        const previousItems = items;
        
        // Update locally
        set({ 
          items: items.filter((i) => i.id !== id),
          syncingIds: [...syncingIds, id]
        });
        
        // Sync server
        if (isAuthenticated && item?.cartItemId) {
          try {
            await cartApi.removeItem(item.cartItemId);
          } catch (err) {
            set({ items: previousItems });
            toast.error("Failed to remove item. Please try again.");
          } finally {
            set((state) => ({ syncingIds: state.syncingIds.filter(sid => sid !== id) }));
          }
        } else {
          set((state) => ({ syncingIds: state.syncingIds.filter(sid => sid !== id) }));
        }
      },
      updateQuantity: async (id, quantity) => {
        const { isAuthenticated } = useAuthStore.getState();
        const { items, syncingIds } = get();
        const item = items.find(i => i.id === id);
        const previousItems = items;
        
        if (!item) return;

        // Update locally
        set({
          items: items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
          syncingIds: [...syncingIds, id]
        });
        
        // Sync server
        if (isAuthenticated && item.cartItemId) {
          try {
            await cartApi.updateQuantity(item.cartItemId, quantity);
          } catch (err) {
            set({ items: previousItems });
            toast.error("Failed to update quantity. Please try again.");
          } finally {
            set((state) => ({ syncingIds: state.syncingIds.filter(sid => sid !== id) }));
          }
        } else {
          set((state) => ({ syncingIds: state.syncingIds.filter(sid => sid !== id) }));
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
