"use client";

import React, { useMemo, useCallback } from "react";
import { CheckCircle, Printer, Truck } from "lucide-react";
import type { Order } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { PriceDisplay } from "./PriceDisplay";
import { Button } from "@/components/ui/Button";
import { AdminDrawer } from "./AdminDrawer";

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
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const OrderDetailPanel = React.memo(
  ({ order, isOpen, onClose, onUpdateStatus }: OrderDetailPanelProps) => {
    const handlePrint = useCallback(() => {
      window.print();
    }, []);

    const paymentStatus = useMemo(
      () => order?.paymentStatus === "PAID",
      [order?.paymentStatus]
    );

    const actionConfig = useMemo(() => {
      if (!order) return null;
      switch (order.status) {
        case "PENDING":
          return {
            label: "Confirm Order",
            nextStatus: "PROCESSING",
            icon: <CheckCircle size={14} />,
          };
        case "PROCESSING":
          return {
            label: "Ship Order",
            nextStatus: "SHIPPED",
            icon: <Truck size={14} />,
          };
        case "SHIPPED":
          return {
            label: "Mark Delivered",
            nextStatus: "DELIVERED",
            icon: <CheckCircle size={14} />,
          };
        default:
          return null;
      }
    }, [order]);

    const statusSteps = useMemo(() => {
      if (!order) return [];

      const statusWeights: Record<string, number> = {
        PENDING: 1,
        PROCESSING: 2,
        SHIPPED: 3,
        DELIVERED: 4,
      };
      const stateWeight = statusWeights[order.status] || 0;

      return [
        {
          name: "Order Placed",
          date: new Date(order.createdAt).toLocaleString(),
          completed: true,
        },
        {
          name: "Payment Confirmed",
          date: paymentStatus ? "Received" : "Pending",
          completed: paymentStatus,
        },
        {
          name: "Sent to Warehouse",
          date: stateWeight >= 2 ? "Completed" : "Pending",
          completed: stateWeight >= 2,
        },
        {
          name: "Order Shipped",
          date: stateWeight >= 3 ? "Completed" : "Pending",
          completed: stateWeight >= 3,
        },
      ];
    }, [order, paymentStatus]);

    // Remove hard block to allow Framer Motion to animate out when order states change
    if (!order && !isOpen) return null;

    return (
      <AdminDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={
          order ? `Order #${order.id.slice(-4).toUpperCase()}` : "Loading..."
        }
        subtitle={
          order
            ? `Placed on ${new Date(order.createdAt).toLocaleDateString()} at ${new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : ""
        }
        footer={
          <>
            <Button
              variant="outline"
              size="none"
              onClick={handlePrint}
              className="no-print flex w-auto items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-xs font-bold tracking-widest text-zinc-900 uppercase shadow-sm transition-all hover:bg-zinc-100 active:scale-95"
              icon={<Printer size={14} />}
            >
              Print
            </Button>
            {actionConfig && (
              <Button
                variant="primary"
                onClick={() =>
                  order && onUpdateStatus(order.id, actionConfig.nextStatus)
                }
                className="flex w-auto items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-xs font-bold tracking-widest text-white uppercase shadow-[0_4px_10px_rgba(0,0,0,0.2)] transition-all hover:opacity-90 active:scale-95"
                icon={actionConfig.icon}
              >
                {actionConfig.label}
              </Button>
            )}
          </>
        }
      >
        <div className="relative space-y-10">
          {/* Print Styles */}
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
              body * {
                visibility: hidden;
              }
              .print-area,
              .print-area * {
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
              section,
              .invoice-block {
                page-break-inside: avoid;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}</style>

          <div className="hidden w-full print:block">
            <div className="w-full space-y-12 leading-relaxed">
              <InvoiceHeader
                date={
                  order
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""
                }
                reference={order?.id.slice(-8).toUpperCase() || ""}
              />

              <InvoiceStatus
                status={order?.status || "PENDING"}
                paymentStatus={order?.paymentStatus || "UNPAID"}
              />

              {order?.address && (
                <div className="py-6">
                  <InvoiceCustomerInfo
                    address={order.address}
                    email={order.user?.email || ""}
                  />
                </div>
              )}

              <div className="py-6">
                <InvoiceOrderSummary items={order?.items || []} />
              </div>

              <div className="grid grid-cols-2 gap-12 border-t border-zinc-100 pt-10">
                {order ? (
                  <InvoiceTimeline
                    events={[
                      {
                        title: "Order placed",
                        time: new Date(order.createdAt).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }),
                        isCompleted: true,
                      },
                      {
                        title: "Payment confirmed",
                        time:
                          order.paymentStatus === "PAID"
                            ? "Oct 20, 10:45 AM"
                            : "Pending",
                        isCompleted: order.paymentStatus === "PAID",
                      },
                      {
                        title: "Sent to warehouse",
                        time:
                          order.status !== "PENDING"
                            ? "Oct 21, 09:00 AM"
                            : "Pending",
                        isCompleted: order.status !== "PENDING",
                      },
                      {
                        title: "Shipped",
                        time:
                          order.status === "DELIVERED" ||
                          order.status === "SHIPPED"
                            ? "Oct 22, 02:15 PM"
                            : "Pending",
                        isCompleted:
                          order.status === "DELIVERED" ||
                          order.status === "SHIPPED",
                      },
                    ]}
                  />
                ) : null}
                {order ? (
                  <InvoicePricing
                    subtotal={order.subtotal}
                    shipping={order.shipping}
                    tax={order.tax}
                    total={order.total}
                  />
                ) : null}
              </div>

              <div className="mt-12 border-t border-zinc-100 pt-16 pb-8 text-center">
                <p className="text-xs leading-loose tracking-widest text-zinc-400 uppercase italic">
                  Thank you for choosing the curator.
                  <br />
                  All items are subject to archival care guidelines.
                </p>
              </div>
            </div>
          </div>

          {/* Original Screen UI */}
          <div className="space-y-10 print:hidden">
            {order ? (
              <>
                <section>
                  <h3 className="mb-6 text-xs font-bold tracking-[0.15em] text-zinc-500 uppercase">
                    Order Summary
                  </h3>
                  <OrderSummary items={order.items || []} />

                  <div className="mt-8 space-y-3 rounded-xl border-t border-zinc-100 bg-zinc-50/50 p-4 pt-6">
                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>Subtotal</span>
                      <PriceDisplay amount={order.subtotal} size="sm" />
                    </div>
                    <div className="flex justify-between text-sm text-zinc-500">
                      <span>Shipping</span>
                      {order.shipping === 0 ? (
                        <span className="text-[10px] font-bold tracking-widest text-green-600 uppercase">
                          Free
                        </span>
                      ) : (
                        <PriceDisplay amount={order.shipping} size="sm" />
                      )}
                    </div>
                    <div className="mt-2 flex justify-between border-t border-zinc-200/50 pt-2 text-base font-black text-zinc-950">
                      <span>Total Value</span>
                      <PriceDisplay amount={order.total} size="md" />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-xs font-bold tracking-[0.15em] text-zinc-500 uppercase">
                    Customer Intelligence
                  </h3>
                  <CustomerSection user={order.user} address={order.address} />
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5 shadow-sm">
                    <div className="mb-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                      Settlement
                    </div>
                    <div className="flex">
                      <StatusBadge status={order.paymentStatus} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-5 shadow-sm">
                    <div className="mb-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                      Status
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </div>

                <section>
                  <h3 className="mb-6 text-xs font-bold tracking-[0.15em] text-zinc-500 uppercase">
                    Fulfillment Timeline
                  </h3>
                  <OrderTimeline steps={statusSteps} />
                </section>
              </>
            ) : (
              <div className="animate-pulse space-y-6">
                <div className="h-64 rounded-xl bg-zinc-100" />
                <div className="h-32 rounded-xl bg-zinc-100" />
                <div className="h-64 rounded-xl bg-zinc-100" />
              </div>
            )}
          </div>
        </div>
      </AdminDrawer>
    );
  }
);

OrderDetailPanel.displayName = "OrderDetailPanel";
