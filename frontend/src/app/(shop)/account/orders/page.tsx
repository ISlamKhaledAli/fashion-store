"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { orderApi } from "@/lib/api";
import { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const statuses = ["ALL", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await orderApi.getMine();
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, router]);

  const filteredOrders = activeTab === "ALL" 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  if (!isAuthenticated) return null;

  return (
    <div className="flex bg-surface min-h-screen">
      <AccountSidebar />
      
      <main className="flex-1 p-12">
        <header className="mb-12">
          <h1 className="text-5xl font-medium tracking-tight text-on-surface mb-4">My Orders</h1>
          <p className="text-on-surface-variant max-w-xl leading-relaxed">
            Track your recent purchases, manage returns, and explore your history with the collection.
          </p>
        </header>

        {/* Filter Tabs */}
        <div className="flex gap-x-10 mb-12 relative border-b border-outline-variant/15">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={cn(
                "pb-4 text-sm font-medium transition-all relative capitalize",
                activeTab === status 
                  ? "text-primary" 
                  : "text-on-surface-variant hover:text-primary"
              )}
            >
              {status.toLowerCase()}
              {activeTab === status && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                />
              )}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                isExpanded={expandedOrder === order.id}
                onToggle={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                onCancel={async () => {
                  if (confirm("Are you sure you want to cancel this order?")) {
                    const res = await orderApi.cancel(order.id);
                    if (res.data.success) {
                      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'CANCELLED' } : o));
                    }
                  }
                }}
              />
            ))
          ) : (
            <div className="py-24 text-center">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-4">package_2</span>
              <p className="text-on-surface-variant">No orders found in this category.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function OrderCard({ order, isExpanded, onToggle, onCancel }: { 
  order: Order; 
  isExpanded: boolean; 
  onToggle: () => void;
  onCancel: () => Promise<void>;
}) {
  return (
    <section 
      className={cn(
        " cinematic-transition rounded-xl p-8 group overflow-hidden border border-outline-variant/5",
        isExpanded ? "bg-surface-container-lowest shadow-lg" : "bg-surface-container-low hover:bg-surface-container cursor-pointer"
      )}
      onClick={!isExpanded ? onToggle : undefined}
    >
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-x-12">
          <div className="space-y-1">
            <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Order Reference</span>
            <h3 className="text-xl font-semibold">#{order.id.slice(-4).toUpperCase()}</h3>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Date</span>
            <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] tracking-widest uppercase text-on-surface-variant font-bold">Status</span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                order.status === "SHIPPED" || order.status === "DELIVERED" ? "bg-secondary" : 
                order.status === "CANCELLED" ? "bg-outline-variant" : "bg-primary"
              )} />
              <p className={cn(
                "text-sm font-semibold capitalize",
                order.status === "SHIPPED" ? "text-secondary" : "text-on-surface"
              )}>
                {order.status.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-x-8">
          <p className="text-xl font-medium tracking-tighter">{formatCurrency(order.total)}</p>
          {!isExpanded && (
            <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 cinematic-transition">
              chevron_right
            </span>
          )}
          {isExpanded && (
            <button onClick={onToggle} className="p-2 rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">expand_less</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pt-12 mt-8 border-t border-outline-variant/10">
              {/* Tracking Timeline */}
              <div className="mb-16 pt-4 max-w-3xl mx-auto">
                <div className="relative flex justify-between items-center">
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-outline-variant/30 -translate-y-1/2 -z-10" />
                  <div 
                    className="absolute top-1/2 left-0 h-[1px] bg-primary -translate-y-1/2 -z-10 transition-all duration-1000" 
                    style={{ width: 
                      order.status === 'PENDING' ? '0%' : 
                      order.status === 'PROCESSING' ? '25%' : 
                      order.status === 'SHIPPED' ? '75%' : 
                      order.status === 'DELIVERED' ? '100%' : '0%' 
                    }}
                  />
                  
                  <TimelineStep label="Placed" active={true} />
                  <TimelineStep label="Processing" active={order.status !== 'PENDING' && order.status !== 'CANCELLED'} />
                  <TimelineStep 
                    label="Shipped" 
                    active={order.status === 'SHIPPED' || order.status === 'DELIVERED'} 
                    icon={order.status === 'SHIPPED' ? "local_shipping" : undefined}
                  />
                  <TimelineStep label="Delivered" active={order.status === 'DELIVERED'} />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-8">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-x-12 items-center py-6 first:pt-0 border-b last:border-0 border-outline-variant/5">
                    <div className="w-24 h-32 bg-surface-container overflow-hidden rounded-sm ring-1 ring-outline-variant/10">
                      <img 
                        src={item.product.images[0]?.url} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium">{item.product.name}</h4>
                      <p className="text-sm text-on-surface-variant uppercase tracking-widest text-[10px] mt-1">
                        {item.variant.color} / {item.variant.size}
                      </p>
                      <div className="mt-4 flex items-center gap-x-8 text-sm">
                        <p><span className="text-on-surface-variant">Qty:</span> {item.quantity}</p>
                        <p><span className="text-on-surface-variant">Price:</span> {formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-12 flex justify-between items-center bg-surface-container-low/50 p-6 rounded-sm border border-outline-variant/10">
                <div className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                  Reference: <span className="text-on-surface ml-2 font-mono uppercase">ED-9482-1049-US</span>
                </div>
                <div className="flex gap-4">
                  {order.status === "PENDING" && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onCancel(); }}
                      className="px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest text-error border border-error/20 hover:bg-error/5 transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button className="bg-primary text-on-primary px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:scale-[0.98] cinematic-transition">
                    Track Package
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function TimelineStep({ label, active, icon }: { label: string; active: boolean; icon?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-3", !active && "opacity-30")}>
      <div className={cn(
        "rounded-full border-4 border-surface-container-lowest outline outline-1 transition-all duration-700",
        active ? "bg-primary outline-primary" : "bg-outline-variant outline-outline-variant/30",
        icon ? "w-6 h-6 flex items-center justify-center ring-4 ring-primary/10 -mt-1.5" : "w-3 h-3"
      )}>
        {icon && active && <span className="material-symbols-outlined text-[12px] text-white fill-1">{icon}</span>}
      </div>
      <span className={cn(
        "text-[9px] font-bold tracking-widest uppercase",
        active ? "text-primary" : "text-on-surface-variant"
      )}>
        {label}
      </span>
    </div>
  );
}
