import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: { user: User }) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (data) => {
        set({
          user: data.user,
          isAuthenticated: true,
        });

        // Merge guest cart with server cart
        try {
          const { items, syncFromServer } = (await import("./cartStore")).useCartStore.getState();
          const { cartApi } = await import("@/lib/api");
          
          if (items.length > 0) {
            // Push each local item to server
            for (const item of items) {
              try {
                await cartApi.addItem(item.variantId, item.quantity);
              } catch (_err) {
                // Silently ignore sync errors (likely duplicates on server)
              }
            }
            
            // Fetch the final merged cart from server
            const serverCart = await cartApi.get();
            if (serverCart.data.success) {
              syncFromServer(serverCart.data.data);
            }
          }
        } catch (err) {
          console.error("Cart merge failed during login:", err);
        }
      },
      setUser: (user) => set({ user }),
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
        try {
          import("./chatStore").then((m) => m.useChatStore.getState().clearChat());
        } catch (err) {
          console.error("Failed to clear chat on logout:", err);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
