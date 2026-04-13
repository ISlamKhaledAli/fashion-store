import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";
import { cartApi } from "@/lib/api";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  setItems: (items: CartItem[]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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
      addItem: async (newItem) => {
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

        try {
          // 2. Save to server immediately to prevent optimistic wipes
          await cartApi.addItem(newItem.variantId, newItem.quantity);
          
          // 3. Sync local state with authoritative server IDs
          const serverCart = await cartApi.get();
          const serverData = serverCart.data.data as any;
          
          if (serverCart.data.success && serverData?.items) {
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
          }
        } catch (err) {
          console.error("Failed to sync cart with server:", err);
        }
      },
      setItems: (items) => set({ items }),
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
    }),
    {
      name: "cart-storage",
    }
  )
);
