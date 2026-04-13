"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, MapPin, CheckCircle, RefreshCw, Printer, Truck } from "lucide-react";
import { Order } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Premium Invoice Components
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

export const OrderDetailPanel = ({ order, onClose, onUpdateStatus }: OrderDetailPanelProps) => {
  const printRef = React.useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const paymentStatus = order.paymentStatus === "PAID";
  const statusSteps = [
    { name: "Order Placed", date: new Date(order.createdAt).toLocaleString(), completed: true },
    { name: "Payment Confirmed", date: paymentStatus ? "Received" : "Pending", completed: paymentStatus },
    { name: "Sent to Warehouse", date: order.status !== "PENDING" ? "Completed" : "Pending", completed: order.status !== "PENDING" },
    { name: "Order Shipped", date: order.status === "DELIVERED" || order.status === "SHIPPED" ? "Completed" : "Pending", completed: order.status === "DELIVERED" || order.status === "SHIPPED" },
  ];

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl border-l border-zinc-200 z-[70] flex flex-col"
        >
          {/* Panel Header */}
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Order #{order.id.slice(-4).toUpperCase()}</h2>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <Button 
              variant="icon"
              size="none"
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500"
              icon={<X size={20} />}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar relative">
            {/* 1. Global Print Styles & External Assets */}
            <link 
              href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
              rel="stylesheet" 
            />
            <style jsx global>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 20mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
                body * {
                  visibility: hidden;
                }
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
                  box-sizing: border-box !important;
                  display: block !important;
                }
                section, .invoice-block {
                  page-break-inside: avoid;
                }
                /* Ensure background colors are preserved */
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              }
            `}</style>

            <div className="print-area opacity-0 absolute -z-10 print:opacity-100 print:static print:z-auto" style={{ width: '100%', boxSizing: 'border-box' }}>
              <div style={{ width: '100%', boxSizing: 'border-box', padding: '0', margin: '0' }} className="space-y-12 leading-relaxed">
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

            {/* 3. Original Screen UI */}
            <div className="print:hidden space-y-8">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">Order Summary</h3>
              <div className="space-y-4">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-16 h-16 rounded bg-zinc-50 overflow-hidden flex-shrink-0 border border-zinc-100">
                      <img 
                        src={item.product?.images?.[0]?.url} 
                        alt={item.product?.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-zinc-900 truncate">{item.product?.name}</div>
                      <div className="text-xs text-zinc-500">Qty: {item.quantity} • {item.variant?.size} / {item.variant?.color}</div>
                      <div className="text-sm font-bold mt-1 text-zinc-900">${item.price.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-100 space-y-2">
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 font-medium">${order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">{order.shipping === 0 ? "Free" : `$${order.shipping}`}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-zinc-900 pt-2 border-t border-zinc-50/50 mt-2">
                  <span>Total</span>
                  <span>${order.total.toLocaleString()}</span>
                </div>
              </div>
            </section>

            {/* Customer Info */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">Customer Information</h3>
              <div className="bg-zinc-50 p-4 rounded-xl space-y-3 border border-zinc-100">
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-zinc-500" />
                  <span className="text-sm text-zinc-900">{order.user?.email}</span>
                </div>
                <div className="flex items-start gap-3 pt-2 border-t border-zinc-200/50">
                  <MapPin size={14} className="text-zinc-500 mt-0.5" />
                  <div className="text-sm text-zinc-900">
                    <p className="font-bold">{order.address?.firstName} {order.address?.lastName}</p>
                    {order.address ? (
                      <div className="text-zinc-500 mt-1 space-y-0.5">
                        <p>{order.address.street}{order.address.apartment ? `, ${order.address.apartment}` : ""}</p>
                        <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                        <p>{order.address.country}</p>
                      </div>
                    ) : (
                      <p className="text-zinc-400 mt-1 italic">No shipping address provided</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Status Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Payment Status</div>
                <div className={cn(
                  "flex items-center gap-2",
                  paymentStatus ? "text-green-600" : "text-amber-600"
                )}>
                  {paymentStatus ? <CheckCircle size={14} /> : <RefreshCw size={14} className="animate-spin-slow" />}
                  <span className="text-sm font-bold">{order.paymentStatus}</span>
                </div>
              </div>
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Order Status</div>
                <div className="flex items-center gap-2 text-zinc-900">
                  <StatusBadge status={order.status} />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <section>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4">Timeline</h3>
              <div className="relative space-y-6 pl-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-100">
                {statusSteps.map((step, i) => (
                  <div key={i} className="relative">
                    <div className={cn(
                      "absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-white transition-colors duration-500",
                      step.completed ? "bg-zinc-900" : "bg-zinc-200"
                    )}></div>
                    <div className={cn(
                      "text-sm font-medium",
                      step.completed ? "text-zinc-900" : "text-zinc-400"
                    )}>{step.name}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{step.date}</div>
                  </div>
                ))}
              </div>
              </section>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end gap-3 sticky bottom-0">
            <Button 
              variant="outline"
              size="none"
              onClick={handlePrint}
              className="px-4 py-2 bg-white text-zinc-900 border border-zinc-200 font-medium text-sm rounded-lg hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 active:scale-95 no-print w-auto"
              icon={<Printer size={14} />}
            >
              Print Invoice
            </Button>
            <Button 
              variant="primary"
              size="none"
              onClick={() => onUpdateStatus(order.id, order.status === "PROCESSING" ? "SHIPPED" : "DELIVERED")}
              className="px-4 py-2 bg-zinc-900 text-white font-medium text-sm rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 w-auto"
              icon={<Truck size={14} />}
            >
              {order.status === "PROCESSING" ? "Ship Order" : "Mark Delivered"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
