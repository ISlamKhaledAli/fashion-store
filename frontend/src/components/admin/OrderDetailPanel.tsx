"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, RefreshCw, Printer, Truck } from "lucide-react";
import { Order } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/Button";
import { CloseButton } from "@/components/ui/CloseButton";
import { cn } from "@/lib/utils";

// Atomic Sub-components
import { OrderSummary } from "./order-detail/OrderSummary";
import { CustomerSection } from "./order-detail/CustomerSection";
import { OrderTimeline } from "./order-detail/OrderTimeline";

// Premium Invoice Components (for printing)
import { InvoiceHeader } from "@/components/invoice/InvoiceHeader";
import { Status as InvoiceStatus } from "@/components/invoice/Status";
import { CustomerInfo as InvoiceCustomerInfo } from "@/components/invoice/CustomerInfo";
import { OrderSummary as InvoiceOrderSummary } from "@/components/invoice/OrderSummary";
import { Pricing as InvoicePricing } from "@/components/invoice/Pricing";
import { Timeline as InvoiceTimeline } from "@/components/invoice/Timeline";

interface OrderDetailPanelProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const OrderDetailPanel = React.memo(({ order, onClose, onUpdateStatus }: OrderDetailPanelProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (order) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [order, onClose]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const paymentStatus = useMemo(() => order?.paymentStatus === "PAID", [order?.paymentStatus]);

  const actionConfig = useMemo(() => {
    if (!order) return null;
    switch (order.status) {
      case "PENDING":
        return { label: "Confirm Order", nextStatus: "PROCESSING", icon: <CheckCircle size={14} /> };
      case "PROCESSING":
        return { label: "Ship Order", nextStatus: "SHIPPED", icon: <Truck size={14} /> };
      case "SHIPPED":
        return { label: "Mark Delivered", nextStatus: "DELIVERED", icon: <CheckCircle size={14} /> };
      default:
        return null;
    }
  }, [order]);

  const statusSteps = useMemo(() => {
    if (!order) return [];
    
    const statusWeights: Record<string, number> = {
      "PENDING": 1,
      "PROCESSING": 2,
      "SHIPPED": 3,
      "DELIVERED": 4
    };
    const stateWeight = statusWeights[order.status] || 0;

    return [
      { name: "Order Placed", date: new Date(order.createdAt).toLocaleString(), completed: true },
      { name: "Payment Confirmed", date: paymentStatus ? "Received" : "Pending", completed: paymentStatus },
      { name: "Sent to Warehouse", date: stateWeight >= 2 ? "Completed" : "Pending", completed: stateWeight >= 2 },
      { name: "Order Shipped", date: stateWeight >= 3 ? "Completed" : "Pending", completed: stateWeight >= 3 },
    ];
  }, [order, paymentStatus]);

  if (!mounted) return null;

  const content = (
    <AnimatePresence>
      {order && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] as const }}
            className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.2)] z-50 flex flex-col"
          >
            {/* Panel Header */}
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-zinc-900">Order #{order.id.slice(-4).toUpperCase()}</h2>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <CloseButton onClick={onClose} />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar relative">
              {/* Print Styles */}
              <link 
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
                rel="stylesheet" 
              />
              <style jsx global>{`
                @media print {
                  @page { size: A4 portrait; margin: 20mm; }
                  body * { visibility: hidden; }
                  .print-area, .print-area * {
                    visibility: visible;
                    box-sizing: border-box;
                    overflow: visible !important;
                  }
                  .print-area {
                    width: 100% !important;
                    max-width: 100% !important;
                    padding: 0 !important;
                    margin: 0 auto !important;
                    display: block !important;
                  }
                  section, .invoice-block { page-break-inside: avoid; }
                  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
              `}</style>

              <div className="print-area opacity-0 absolute -z-10 print:opacity-100 print:static print:z-auto w-full">
                <div className="space-y-12 leading-relaxed w-full">
                  <InvoiceHeader 
                    date={new Date(order.createdAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                    reference={order.id.slice(-8).toUpperCase()}
                  />
                  
                  <InvoiceStatus 
                    status={order.status}
                    paymentStatus={order.paymentStatus}
                  />

                  {order.address && (
                    <div className="py-6">
                      <InvoiceCustomerInfo 
                        address={order.address}
                        email={order.user?.email || ""}
                      />
                    </div>
                  )}

                  <div className="py-6">
                    <InvoiceOrderSummary items={order.items} />
                  </div>

                  <div className="grid grid-cols-2 gap-12 pt-10 border-t border-zinc-100">
                    <InvoiceTimeline events={[
                      { title: "Order placed", time: new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }), isCompleted: true },
                      { title: "Payment confirmed", time: order.paymentStatus === "PAID" ? "Oct 20, 10:45 AM" : "Pending", isCompleted: order.paymentStatus === "PAID" },
                      { title: "Sent to warehouse", time: order.status !== "PENDING" ? "Oct 21, 09:00 AM" : "Pending", isCompleted: order.status !== "PENDING" },
                      { title: "Shipped", time: order.status === "DELIVERED" || order.status === "SHIPPED" ? "Oct 22, 02:15 PM" : "Pending", isCompleted: order.status === "DELIVERED" || order.status === "SHIPPED" }
                    ]} />
                    <InvoicePricing 
                      subtotal={order.subtotal}
                      shipping={order.shipping}
                      tax={order.tax}
                      total={order.total}
                    />
                  </div>

                  <div className="pt-16 text-center pb-8 border-t border-zinc-100 mt-12">
                    <p className="text-xs text-zinc-400 tracking-widest uppercase italic leading-loose">
                      Thank you for choosing the curator.<br/>
                      All items are subject to archival care guidelines.
                    </p>
                  </div>
                </div>
              </div>

              {/* Original Screen UI */}
              <div className="print:hidden space-y-10">
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-6">Order Summary</h3>
                  <OrderSummary items={order.items || []} />

                  <div className="mt-8 pt-6 border-t border-zinc-100 space-y-3 bg-zinc-50/50 p-4 rounded-xl">
                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>Subtotal</span>
                      <span className="text-zinc-950 font-bold tabular-nums">${order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>Shipping</span>
                      <span className="text-green-600 font-bold">{order.shipping === 0 ? "Free" : `$${order.shipping}`}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-zinc-950 pt-2 border-t border-zinc-200/50 mt-2">
                      <span>Total Value</span>
                      <span className="tabular-nums">${order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">Customer Intelligence</h3>
                  <CustomerSection user={order.user} address={order.address} />
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-100 shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-zinc-400 mb-2 tracking-widest">Settlement</div>
                    <div className="flex">
                      <StatusBadge status={order.paymentStatus} />
                    </div>
                  </div>
                  <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-100 shadow-sm">
                    <div className="text-[10px] uppercase font-bold text-zinc-400 mb-2 tracking-widest">Status</div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </div>

                <section>
                  <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-6">Fulfillment Timeline</h3>
                  <OrderTimeline steps={statusSteps} />
                </section>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end gap-3 sticky bottom-0 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
              <Button 
                variant="outline"
                size="none"
                onClick={handlePrint}
                className="px-6 py-2.5 bg-white text-zinc-900 border border-zinc-200 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 active:scale-95 no-print w-auto shadow-sm"
                icon={<Printer size={14} />}
              >
                Print
              </Button>
              {actionConfig && (
                <Button 
                  variant="primary"
                  size="none"
                  onClick={() => onUpdateStatus(order.id, actionConfig.nextStatus)}
                  className="px-6 py-2.5 bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 w-auto shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
                  icon={actionConfig.icon}
                >
                  {actionConfig.label}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
});

OrderDetailPanel.displayName = "OrderDetailPanel";
