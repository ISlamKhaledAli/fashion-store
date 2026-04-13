"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { orderApi, wishlistApi } from "@/lib/api";
import { Order, WishlistItem } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCartStore } from "@/store/cartStore";

export default function AccountPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, wishlistRes] = await Promise.all([
          orderApi.getMine({ limit: 5 }),
          wishlistApi.getAll()
        ]);

        if (ordersRes.data.success) setOrders(ordersRes.data.data);
        if (wishlistRes.data.success) setWishlist(wishlistRes.data.data);
      } catch (err) {
        console.error("Failed to fetch account data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReorder = async (order: Order) => {
    // Add each order item back to cart
    for (const item of order.items) {
      const variant = item.variant;
      if (!variant) continue;
      
      await useCartStore.getState().addItem({
        id: '', // Server handles IDs
        cartItemId: '',
        variantId: item.variantId,
        productId: item.productId,
        name: item.product?.name || '',
        image: item.product?.images?.[0]?.url || '',
        price: item.price,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        stock: 99, // Fallback for reorder
      });
    }
    
    // Open cart drawer
    useCartStore.getState().toggleDrawer();
    
    // Show toast
    import("sonner").then(({ toast }) => toast.success("Items added to bag for reorder"));
  };

  return (
    <ProtectedRoute>
      <div className="flex bg-surface min-h-screen">
        <AccountSidebar />
        
        <main className="flex-1 p-12">
          <header className="mb-12">
            <h1 className="text-3xl font-medium text-on-surface tracking-tight">
              Good morning, {user?.name.split(" ")[0]}
            </h1>
            <p className="text-on-surface-variant mt-1">Everything you need to manage your boutique experience.</p>
          </header>

        {/* Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <MetricCard 
            label="Total Orders" 
            value={loading ? undefined : orders.length.toString()} 
          />
          <MetricCard 
            label="Pending Delivery" 
            value={loading ? undefined : orders.filter(o => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "SHIPPED").length.toString()} 
            hasIndicator
          />
          <MetricCard 
            label="Wishlist Items" 
            value={loading ? undefined : wishlist.length.toString()} 
          />
          <MetricCard 
            label="Reward Points" 
            value={loading ? undefined : "2,450"} 
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-on-surface">Recent Orders</h2>
              <Link href="/account/orders" className="text-sm font-medium text-secondary hover:underline underline-offset-4">
                View All
              </Link>
            </div>
            
            <div className="bg-surface-container-lowest rounded-sm border border-outline-variant/10 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Order Number</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-6"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-6 py-6"><Skeleton className="h-6 w-24 rounded-full" /></td>
                        <td className="px-6 py-6"><Skeleton className="h-4 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : orders.length > 0 ? (
                    orders.slice(0, 3).map((order) => (
                      <tr key={order.id} className="group">
                        <td className="px-6 py-6 font-medium text-on-surface">#{order.id.slice(-4).toUpperCase()}</td>
                        <td className="px-6 py-6">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-6 text-right">
                          <Link href={`/account/orders?id=${order.id}`} className="text-on-surface font-semibold hover:text-secondary transition-colors">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-on-surface-variant">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Reorder */}
          <div>
            <h2 className="text-xl font-semibold text-on-surface mb-6">Quick Reorder</h2>
            <div className="space-y-6">
              {loading ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-24 h-24" />
                    <div className="flex flex-col justify-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-surface-container-low rounded-sm border border-outline-variant/10 mb-6">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">From Your Last Order</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">#{orders[0].id.slice(-4).toUpperCase()}</span>
                      <Button 
                        variant="none" 
                        size="none" 
                        onClick={() => handleReorder(orders[0])}
                        className="text-xs font-bold text-primary hover:underline underline-offset-4"
                      >
                        Reorder All
                      </Button>
                    </div>
                  </div>
                  {orders[0].items.slice(0, 2).map((item) => (
                    <QuickReorderItem 
                      key={item.id}
                      name={item.product?.name || "Product"} 
                      price={item.price} 
                      image={item.product?.images?.[0]?.url || ""} 
                      onReorder={() => handleReorder({ ...orders[0], items: [item] })}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic">Start your collection to enable quick reordering.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}

function MetricCard({ label, value, hasIndicator }: { label: string; value?: string; hasIndicator?: boolean }) {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-sm border border-outline-variant/5 shadow-sm transition-all hover:border-outline-variant/20 hover:shadow-md cursor-default group">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-3">{label}</p>
      <div className="flex items-center gap-3">
        {value === undefined ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <p className="text-3xl font-medium text-on-surface tracking-tighter">{value}</p>
        )}
        {hasIndicator && value && parseInt(value) > 0 && (
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-[#fff7ed] text-[#c2410c] border-[#ffedd5]",
    PROCESSING: "bg-[#fffbeb] text-[#b45309] border-[#fef3c7]",
    SHIPPED: "bg-[#eff6ff] text-[#1d4ed8] border-[#dbeafe]",
    DELIVERED: "bg-[#f0fdf4] text-[#15803d] border-[#dcfce7]",
    CANCELLED: "bg-[#f9fafb] text-[#4b5563] border-[#f3f4f6]",
  };

  return (
    <span className={cn(
      "inline-flex items-center py-1 px-3 rounded-full font-medium text-[10px] uppercase tracking-wider border",
      styles[status] || styles.PENDING
    )}>
      {status.toLowerCase()}
    </span>
  );
}

function QuickReorderItem({ name, price, image, onReorder }: { name: string; price: number; image: string; onReorder: () => void }) {
  return (
    <div 
      onClick={onReorder}
      className="group bg-surface-container-lowest p-4 rounded-sm flex gap-4 transition-all duration-500 hover:bg-surface-container-low border border-outline-variant/5 cursor-pointer"
    >
      <div className="w-20 h-20 bg-surface-container overflow-hidden rounded-sm ring-1 ring-outline-variant/10">
        <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={name} />
      </div>
      <div className="flex flex-col justify-between py-1">
        <div>
          <h4 className="text-sm font-semibold text-on-surface">{name}</h4>
          <p className="text-xs text-on-surface-variant">{formatCurrency(price)}</p>
        </div>
        <Button 
          variant="none" 
          size="none" 
          onClick={(e) => { e.stopPropagation(); onReorder(); }}
          className="text-[9px] uppercase tracking-widest font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
        >
          Reorder <span className="material-symbols-outlined !text-[12px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}
