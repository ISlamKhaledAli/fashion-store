import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (access: string, refresh: string) => void;
  login: (data: { user: User; accessToken: string; refreshToken: string }) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),
      login: async (data) => {
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
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
              } catch (err) {
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
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
