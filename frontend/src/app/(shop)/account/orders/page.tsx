"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { orderApi } from "@/lib/api";
import { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const statuses = ["ALL", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  const filteredOrders = activeTab === "ALL" 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  return (
    <ProtectedRoute>
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
            <Button
              variant="none"
              size="none"
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
            </Button>
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
    </ProtectedRoute>
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
        "cinematic-transition rounded-xl p-8 group outline-none focus:outline-none focus-visible:outline-none overflow-hidden",
        isExpanded ? "bg-surface-container-lowest shadow-lg shadow-black/5" : "bg-surface-container-low hover:bg-surface-container/50 cursor-pointer transition-colors duration-300"
      )}
      onClick={!isExpanded ? onToggle : undefined}
    >
      {!isExpanded ? (
        // Collapsed Layout
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-x-12">
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest uppercase text-on-surface-variant">Order Reference</span>
              <h3 className="text-xl font-semibold">#{order.id.slice(-4).toUpperCase()}</h3>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest uppercase text-on-surface-variant">Date</span>
              <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest uppercase text-on-surface-variant">Status</span>
              <p className="text-sm font-semibold flex items-center gap-2">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  order.status === 'PENDING' ? 'bg-primary' :
                  order.status === 'PROCESSING' || order.status === 'SHIPPED' ? 'bg-secondary' : 
                  order.status === 'DELIVERED' ? 'bg-outline-variant' : 'bg-error'
                )} />
                <span className={cn("capitalize", 
                   order.status === 'PROCESSING' || order.status === 'SHIPPED' ? "text-secondary" : 
                   order.status === 'DELIVERED' ? "text-on-surface" : "text-on-surface-variant"
                )}>
                  {order.status.toLowerCase()}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-x-8">
            <p className="text-xl font-medium">{formatCurrency(order.total)}</p>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 cinematic-transition">chevron_right</span>
          </div>
        </div>
      ) : (
        // Expanded Header
        <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-widest uppercase text-on-surface-variant">Order Reference</span>
            <h3 className="text-xl font-semibold">#{order.id.slice(-4).toUpperCase()}</h3>
          </div>
          <div className="flex gap-x-12 relative">
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest uppercase text-on-surface-variant">Date Placed</span>
              <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest uppercase text-on-surface-variant">Total</span>
              <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
            </div>
            <div className="space-y-1 pr-12">
              <span className="text-[10px] tracking-widest uppercase text-on-surface-variant">Status</span>
              <p className={cn("flex items-center gap-2 text-sm font-semibold", 
                order.status === 'PROCESSING' || order.status === 'SHIPPED' ? "text-secondary" : 
                order.status === 'DELIVERED' ? "text-on-surface" : "text-on-surface-variant"
              )}>
                {order.status !== 'CANCELLED' && (
                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                    order.status === 'PROCESSING' || order.status === 'SHIPPED' ? "bg-secondary" : "bg-primary"
                  )}></span>
                )}
                <span className="capitalize">{order.status.toLowerCase()}</span>
              </p>
            </div>
            <Button variant="none" size="none" onClick={onToggle} className="absolute right-0 text-on-surface-variant hover:text-on-surface p-2 rounded-full cursor-pointer hover:bg-surface-container hover:rotate-90 transition-all duration-300">
              <span className="material-symbols-outlined">close</span>
            </Button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
            style={{ outline: "none", border: "none", boxShadow: "none" }}
          >
            <div>
              {/* Tracking Timeline */}
              <div className="mb-12 pt-4">
                <div className="relative flex justify-between items-center px-4">

                  
                  <TimelineStep label="Order Placed" active={true} />
                  <TimelineStep label="Processing" active={order.status !== 'PENDING' && order.status !== 'CANCELLED'} />
                  <TimelineStep 
                    label="Shipped" 
                    active={order.status === 'SHIPPED' || order.status === 'DELIVERED'} 
                    icon="local_shipping"
                    current={order.status === 'SHIPPED'}
                  />
                  <TimelineStep label="Out for Delivery" active={order.status === 'DELIVERED'} />
                  <TimelineStep label="Delivered" active={order.status === 'DELIVERED'} />
                </div>
              </div>

              {/* Item List */}
              <div className="space-y-0">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row gap-8 md:gap-x-12 items-center py-8 border-t border-outline-variant/10">
                    <div className="w-[100px] h-[120px] shrink-0 bg-surface-container overflow-hidden rounded-sm relative">
                      {item?.product?.images?.[0]?.url ? (
                        <img 
                          src={item?.product?.images?.[0]?.url || ""} 
                          alt={item?.product?.name || "Product"} 
                          className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-outline-variant bg-surface-container">
                          <span className="material-symbols-outlined mb-2 text-2xl">image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <h4 className="text-lg font-medium">{item?.product?.name || "Unknown Product"}</h4>
                        <p className="text-sm text-on-surface-variant mt-1">
                          {item.variant?.color || ""} / {item.variant?.size || ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-x-8">
                        <div className="text-sm">
                          <span className="text-on-surface-variant">Qty:</span> {item.quantity}
                        </div>
                        <div className="text-sm">
                          <span className="text-on-surface-variant">Price:</span> {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="pt-4 flex flex-wrap gap-4">
                        {order.status === "PENDING" && (
                          <Button 
                            variant="none" size="none"
                            onClick={(e: any) => { e.stopPropagation(); onCancel(); }}
                            className="bg-transparent text-on-surface px-8 py-3 rounded-md text-sm font-medium outline outline-1 outline-outline-variant/30 hover:bg-surface-container-low transition-colors"
                          >
                            Cancel Order
                          </Button>
                        )}
                        {order.status !== "PENDING" && order.status !== "CANCELLED" && (
                          <Button 
                            variant="none" size="none"
                            onClick={(e: any) => e.stopPropagation()}
                            className="bg-primary text-on-primary px-8 py-3 rounded-md text-sm font-medium hover:opacity-80 transition"
                          >
                            Track Order
                          </Button>
                        )}
                        {order.status === "DELIVERED" && (
                          <Button 
                            variant="none" size="none"
                            onClick={(e: any) => e.stopPropagation()}
                            className="bg-transparent text-on-surface px-8 py-3 rounded-md text-sm font-medium outline outline-1 outline-outline-variant/30 hover:bg-surface-container-low transition-colors"
                          >
                            Return
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2 shrink-0 md:self-start w-full md:w-auto text-left md:text-right pt-4 md:pt-0 border-t md:border-t-0 border-outline-variant/10">
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest hidden md:block">Tracking Number</p>
                      <p className="font-mono text-sm leading-tight text-on-surface hidden md:block">ED-{order.id.slice(-4).toUpperCase()}-US</p>
                      <p className="text-xs text-on-surface-variant uppercase tracking-widest md:hidden pb-1">Tracking # <span className="text-on-surface ml-2">ED-{order.id.slice(-4).toUpperCase()}-US</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function TimelineStep({ label, active, icon, current }: { label: string; active: boolean; icon?: string; current?: boolean }) {
  if (icon && current) {
    return (
      <div className="flex flex-col items-center gap-3" title={active ? label : undefined}>
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-4 ring-primary/10 transition-all duration-700">
          <span className="material-symbols-outlined text-[12px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <span className="text-[10px] font-bold tracking-widest uppercase text-primary">{label}</span>
      </div>
    );
  }
  return (
    <div className={cn("flex flex-col items-center gap-3", !active && "opacity-30")} title={active ? label : undefined}>
      <div className={cn(
        "rounded-full border-4 border-surface-container-lowest transition-all duration-700",
        active ? "bg-primary w-3 h-3" : "bg-transparent outline outline-1 outline-outline-variant/50 w-3 h-3"
      )}></div>
      <span className={cn(
        "text-[10px] font-bold tracking-widest uppercase",
        active ? "text-on-surface" : "text-on-surface-variant"
      )}>{label}</span>
    </div>
  );
}
