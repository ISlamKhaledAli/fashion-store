"use client";

import React, { useEffect, useState } from "react";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { orderApi } from "@/lib/api";
import type { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const statuses = ["ALL", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

import { toast } from "sonner";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setCancelling(true);
    try {
      const res = await orderApi.cancel(orderToCancel);
      if (res.data.success) {
        setOrders(
          orders.map((o) =>
            o.id === orderToCancel ? { ...o, status: "CANCELLED" } : o
          )
        );
        toast.success("Order cancelled successfully");
      }
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setCancelling(false);
      setOrderToCancel(null);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getMine();
        if (res.data.success) {
          setOrders(res.data.data as Order[]);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleTrackOrder = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    // If order has tracking number, open tracking URL
    // Otherwise show toast with order status
    if (order.trackingNumber) {
      const carrier = (order.carrier || "").toLowerCase();
      let trackingUrl = `https://track.aftership.com/${order.trackingNumber}`;
      if (carrier.includes("dhl")) {
        trackingUrl = `https://www.dhl.com/en/express/tracking.html?AWB=${order.trackingNumber}`;
      } else if (carrier.includes("fedex")) {
        trackingUrl = `https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`;
      } else if (carrier.includes("ups")) {
        trackingUrl = `https://www.ups.com/track?tracknum=${order.trackingNumber}`;
      } else if (carrier.includes("aramex")) {
        trackingUrl = `https://www.aramex.com/track/results?shipmentNumber=${order.trackingNumber}`;
      }
      window.open(trackingUrl, "_blank");
    } else {
      toast.info(
        `Order #${order.id.slice(-4).toUpperCase()} is currently ${order.status.toLowerCase()}`,
        {
          description:
            "A tracking number will be provided once the order has shipped.",
        }
      );
    }
  };

  const handleReturn = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation();
    toast.info(
      `Return Request for Order #${order.id.slice(-4).toUpperCase()}`,
      {
        description:
          "Complimentary courier collection can be arranged via concierge@thecurator.com.",
        action: {
          label: "Return Policy",
          onClick: () => {
            window.location.href = "/returns";
          },
        },
      }
    );
  };

  const filteredOrders =
    activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-surface">
        <AccountSidebar />

        <main className="flex-1 p-12">
          <header className="mb-12">
            <h1 className="mb-4 text-5xl font-medium tracking-tight text-on-surface">
              My Orders
            </h1>
            <p className="max-w-xl leading-relaxed text-on-surface-variant">
              Track your recent purchases, manage returns, and explore your
              history with the collection.
            </p>
          </header>

          {/* Filter Tabs */}
          <div className="relative mb-12 flex gap-x-10 border-b border-outline-variant/15">
            {statuses.map((status) => (
              <Button
                variant="none"
                size="none"
                key={status}
                onClick={() => setActiveTab(status)}
                className={cn(
                  "relative pb-4 text-sm font-medium capitalize transition-all",
                  activeTab === status
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary"
                )}
              >
                {status.toLowerCase()}
                {activeTab === status && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary"
                  />
                )}
              </Button>
            ))}
          </div>

          <div className="space-y-6">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isExpanded={expandedOrder === order.id}
                  onToggle={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                  onTrack={(e) => handleTrackOrder(e, order)}
                  onReturn={(e) => handleReturn(e, order)}
                  onCancel={() => setOrderToCancel(order.id)}
                />
              ))
            ) : (
              <div className="py-24 text-center">
                <span className="material-symbols-outlined mb-4 text-4xl text-outline-variant">
                  package_2
                </span>
                <p className="text-on-surface-variant">
                  No orders found in this category.
                </p>
              </div>
            )}
          </div>
        </main>
        <ConfirmDialog
          isOpen={Boolean(orderToCancel)}
          onClose={() => setOrderToCancel(null)}
          onConfirm={handleConfirmCancel}
          title="Cancel Order?"
          description="Are you sure you want to cancel this order? This action will halt fulfillment and initiate your refund process."
          confirmBrand="danger"
          confirmText="Cancel Order"
          cancelText="Keep Order"
          isLoading={cancelling}
        />
      </div>
    </ProtectedRoute>
  );
}

function OrderCard({
  order,
  isExpanded,
  onToggle,
  onCancel,
  onTrack,
  onReturn,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
  onTrack: (e: React.MouseEvent) => void;
  onReturn: (e: React.MouseEvent) => void;
  onCancel: () => void;
}) {
  return (
    <section
      className={cn(
        "cinematic-transition group overflow-hidden rounded-xl p-8 outline-none focus:outline-none focus-visible:outline-none",
        isExpanded
          ? "bg-surface-container-lowest shadow-lg shadow-black/5"
          : "cursor-pointer bg-surface-container-low transition-colors duration-300 hover:bg-surface-container/50"
      )}
      onClick={!isExpanded ? onToggle : undefined}
    >
      {!isExpanded ? (
        // Collapsed Layout
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-x-12">
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">
                Order Reference
              </span>
              <h3 className="text-xl font-semibold">
                #{order.id.slice(-4).toUpperCase()}
              </h3>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">
                Date
              </span>
              <p className="text-sm font-medium">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">
                Status
              </span>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    order.status === "PENDING"
                      ? "bg-primary"
                      : order.status === "PROCESSING" ||
                          order.status === "SHIPPED"
                        ? "bg-secondary"
                        : order.status === "DELIVERED"
                          ? "bg-outline-variant"
                          : "bg-error"
                  )}
                />
                <span
                  className={cn(
                    "capitalize",
                    order.status === "PROCESSING" || order.status === "SHIPPED"
                      ? "text-secondary"
                      : order.status === "DELIVERED"
                        ? "text-on-surface"
                        : "text-on-surface-variant"
                  )}
                >
                  {order.status.toLowerCase()}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-x-8">
            <p className="text-xl font-medium">{formatCurrency(order.total)}</p>
            <span className="material-symbols-outlined cinematic-transition text-on-surface-variant group-hover:translate-x-1">
              chevron_right
            </span>
          </div>
        </div>
      ) : (
        // Expanded Header
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">
              Order Reference
            </span>
            <h3 className="text-xl font-semibold">
              #{order.id.slice(-4).toUpperCase()}
            </h3>
          </div>
          <div className="relative flex gap-x-12">
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">
                Date Placed
              </span>
              <p className="text-sm font-medium">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">
                Total
              </span>
              <p className="text-sm font-medium">
                {formatCurrency(order.total)}
              </p>
            </div>
            <div className="space-y-1 pr-12">
              <span className="text-[10px] tracking-widest text-on-surface-variant uppercase">
                Status
              </span>
              <p
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold",
                  order.status === "PROCESSING" || order.status === "SHIPPED"
                    ? "text-secondary"
                    : order.status === "DELIVERED"
                      ? "text-on-surface"
                      : "text-on-surface-variant"
                )}
              >
                {order.status !== "CANCELLED" && (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 animate-pulse rounded-full",
                      order.status === "PROCESSING" ||
                        order.status === "SHIPPED"
                        ? "bg-secondary"
                        : "bg-primary"
                    )}
                  ></span>
                )}
                <span className="capitalize">{order.status.toLowerCase()}</span>
              </p>
            </div>
            <Button
              variant="none"
              size="none"
              onClick={onToggle}
              className="absolute right-0 cursor-pointer rounded-full p-2 text-on-surface-variant transition-all duration-300 hover:rotate-90 hover:bg-surface-container hover:text-on-surface"
            >
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
                <div className="relative flex items-center justify-between px-4">
                  <TimelineStep label="Order Placed" active={true} />
                  <TimelineStep
                    label="Processing"
                    active={
                      order.status !== "PENDING" && order.status !== "CANCELLED"
                    }
                  />
                  <TimelineStep
                    label="Shipped"
                    active={
                      order.status === "SHIPPED" || order.status === "DELIVERED"
                    }
                    icon="local_shipping"
                    current={order.status === "SHIPPED"}
                  />
                  <TimelineStep
                    label="Out for Delivery"
                    active={order.status === "DELIVERED"}
                  />
                  <TimelineStep
                    label="Delivered"
                    active={order.status === "DELIVERED"}
                  />
                </div>
              </div>

              {/* Item List */}
              <div className="space-y-0">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center gap-8 border-t border-outline-variant/10 py-8 md:flex-row md:gap-x-12"
                  >
                    <div className="relative h-[120px] w-[100px] shrink-0 overflow-hidden rounded-sm bg-surface-container">
                      {item?.product?.images?.[0]?.url ? (
                        <img
                          src={item?.product?.images?.[0]?.url || ""}
                          alt={item?.product?.name || "Product"}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-surface-container text-outline-variant">
                          <span className="material-symbols-outlined mb-2 text-2xl">
                            image
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="w-full flex-1 space-y-4">
                      <div>
                        <h4 className="text-lg font-medium">
                          {item?.product?.name || "Unknown Product"}
                        </h4>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {item.variant?.color || ""} /{" "}
                          {item.variant?.size || ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-x-8">
                        <div className="text-sm">
                          <span className="text-on-surface-variant">Qty:</span>{" "}
                          {item.quantity}
                        </div>
                        <div className="text-sm">
                          <span className="text-on-surface-variant">
                            Price:
                          </span>{" "}
                          {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 pt-4">
                        {order.status === "PENDING" && (
                          <Button
                            variant="none"
                            size="none"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onCancel();
                            }}
                            className="rounded-md bg-transparent px-8 py-3 text-sm font-medium text-on-surface outline outline-1 outline-outline-variant/30 transition-colors hover:bg-surface-container-low"
                          >
                            Cancel Order
                          </Button>
                        )}
                        {order.status !== "PENDING" &&
                          order.status !== "CANCELLED" && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={(e) => onTrack(e)}
                              className="rounded-md"
                            >
                              Track Order
                            </Button>
                          )}
                        {order.status === "DELIVERED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => onReturn(e)}
                            className="rounded-md"
                          >
                            Return
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="w-full shrink-0 space-y-2 border-t border-outline-variant/10 pt-4 text-left text-right md:w-auto md:self-start md:border-t-0 md:pt-0 md:text-right">
                      <p className="hidden text-xs tracking-widest text-on-surface-variant uppercase md:block">
                        Tracking Number
                      </p>
                      <p className="hidden font-mono text-sm leading-tight text-on-surface md:block">
                        ED-{order.id.slice(-4).toUpperCase()}-US
                      </p>
                      <p className="pb-1 text-xs tracking-widest text-on-surface-variant uppercase md:hidden">
                        Tracking #{" "}
                        <span className="ml-2 text-on-surface">
                          ED-{order.id.slice(-4).toUpperCase()}-US
                        </span>
                      </p>
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

function TimelineStep({
  label,
  active,
  icon,
  current,
}: {
  label: string;
  active: boolean;
  icon?: string;
  current?: boolean;
}) {
  if (icon && current) {
    return (
      <div
        className="flex flex-col items-center gap-3"
        title={active ? label : undefined}
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary ring-4 ring-primary/10 transition-all duration-700">
          <span
            className="material-symbols-outlined text-[12px] text-white"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
        </div>
        <span className="text-[10px] font-bold tracking-widest text-primary uppercase">
          {label}
        </span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3",
        !active && "opacity-30"
      )}
      title={active ? label : undefined}
    >
      <div
        className={cn(
          "rounded-full border-4 border-surface-container-lowest transition-all duration-700",
          active
            ? "h-3 w-3 bg-primary"
            : "h-3 w-3 bg-transparent outline outline-1 outline-outline-variant/50"
        )}
      ></div>
      <span
        className={cn(
          "text-[10px] font-bold tracking-widest uppercase",
          active ? "text-on-surface" : "text-on-surface-variant"
        )}
      >
        {label}
      </span>
    </div>
  );
}
