"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  CheckCircle,
  Printer,
  Truck,
  Save,
  Ban,
  FileText,
  Check,
  ExternalLink,
} from "lucide-react";
import type { Order } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { PriceDisplay } from "./PriceDisplay";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { AdminDrawer } from "./AdminDrawer";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

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
  onUpdateStatus: (
    id: string,
    status: string,
    trackingData?: { trackingNumber?: string; carrier?: string }
  ) => void;
}

interface TrackingFulfillmentSectionProps {
  order: Order;
  onSaveTracking: (trackingNumber: string, carrier: string) => void;
}

const TrackingFulfillmentSection = ({
  order,
  onSaveTracking,
}: TrackingFulfillmentSectionProps) => {
  const [trackingNumber, setTrackingNumber] = useState(
    () => order.trackingNumber || ""
  );
  const [carrier, setCarrier] = useState(() => order.carrier || "DHL");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSaveTracking(trackingNumber.trim(), carrier);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const getTrackingUrl = (num: string, car: string) => {
    const c = car.toLowerCase();
    if (c.includes("dhl"))
      return `https://www.dhl.com/en/express/tracking.html?AWB=${num}`;
    if (c.includes("fedex"))
      return `https://www.fedex.com/fedextrack/?trknbr=${num}`;
    if (c.includes("ups")) return `https://www.ups.com/track?tracknum=${num}`;
    if (c.includes("aramex"))
      return `https://www.aramex.com/track/results?shipmentNumber=${num}`;
    return `https://track.aftership.com/${num}`;
  };

  return (
    <section className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-[0.15em] text-zinc-500 uppercase">
          Shipment & Tracking
        </h3>
        {order.trackingNumber && (
          <a
            href={getTrackingUrl(
              order.trackingNumber,
              order.carrier || carrier
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-zinc-900 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-100"
          >
            Track Waybill <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            label="Carrier"
            value={carrier}
            onChange={setCarrier}
            options={[
              { value: "DHL", label: "DHL Express" },
              { value: "FedEx", label: "FedEx" },
              { value: "UPS", label: "UPS" },
              { value: "Aramex", label: "Aramex" },
              { value: "USPS", label: "USPS" },
              { value: "Other", label: "Other Carrier" },
            ]}
            className="w-full"
          />

          <div className="sm:col-span-2">
            <label className="mb-1 block text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              Tracking / Waybill Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 1234567890"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors focus:border-zinc-900 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                icon={<Save className="h-3.5 w-3.5" />}
                className="text-xs"
              >
                {isSaved ? "Saved!" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface InternalNotesSectionProps {
  order: Order;
  onNotesSaved?: (notes: string) => void;
}

const InternalNotesSection = ({
  order,
  onNotesSaved,
}: InternalNotesSectionProps) => {
  const [notes, setNotes] = useState(() => order.internalNotes || "");
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateOrderInternalNotes(order.id, notes);
      toast.success("Internal notes saved");
      setIsSaved(true);
      onNotesSaved?.(notes);
      setTimeout(() => setIsSaved(false), 2500);
    } catch {
      toast.error("Failed to save internal notes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-zinc-500" />
          <h3 className="text-xs font-bold tracking-[0.15em] text-zinc-500 uppercase">
            Internal Staff Notes (Private)
          </h3>
        </div>
        <span className="text-[10px] text-zinc-400 italic">
          Not visible to customer
        </span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add private handling notes, VIP requests, tailoring instructions..."
        rows={3}
        className="w-full resize-y rounded-lg border border-zinc-200 bg-white p-3 text-xs font-medium text-zinc-800 transition-colors focus:border-zinc-900 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
      />
      <div className="mt-2.5 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={saving}
          icon={
            isSaved ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )
          }
          className="text-xs"
        >
          {saving ? "Saving..." : isSaved ? "Saved!" : "Save Notes"}
        </Button>
      </div>
    </section>
  );
};

interface CancelOrderModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onCancelled: () => void;
}

const CancelOrderModal = ({
  orderId,
  isOpen,
  onClose,
  onCancelled,
}: CancelOrderModalProps) => {
  const [reason, setReason] = useState("");
  const [restock, setRestock] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await adminApi.cancelOrder(orderId, reason.trim() || undefined, restock);
      toast.success("Order cancelled and email dispatch triggered");
      onCancelled();
      onClose();
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Order Acquisition">
      <div className="space-y-4 pt-2">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Cancelling will transition the order stance to{" "}
          <span className="text-foreground font-semibold">CANCELLED</span> and
          dispatch an automated advisory email to the client.
        </p>

        <div>
          <label className="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
            Cancellation Reason
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Client requested alteration, inventory discrepancy..."
            className="border-border text-foreground w-full rounded-lg border bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
          />
        </div>

        <div className="pt-1">
          <Checkbox
            checked={restock}
            onCheckedChange={setRestock}
            label={
              <span className="text-foreground text-xs">
                Automatically return item quantities back to available inventory
              </span>
            }
          />
        </div>

        <div className="border-border/40 flex items-center justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={cancelling}
          >
            Keep Active
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCancel}
            disabled={cancelling}
            className="border-none bg-red-600 text-white hover:bg-red-700"
          >
            {cancelling ? "Processing..." : "Confirm Cancellation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const OrderDetailPanel = React.memo(
  ({ order, isOpen, onClose, onUpdateStatus }: OrderDetailPanelProps) => {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

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
            {order && order.status !== "CANCELLED" && (
              <Button
                variant="outline"
                size="none"
                onClick={() => setIsCancelModalOpen(true)}
                className="no-print flex w-auto items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-4 py-2.5 text-xs font-bold tracking-widest text-red-600 uppercase hover:bg-red-100 active:scale-95"
                icon={<Ban size={13} />}
              >
                Cancel
              </Button>
            )}
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

                <TrackingFulfillmentSection
                  key={order.id}
                  order={order}
                  onSaveTracking={(trackingNumber, carrier) => {
                    onUpdateStatus(order.id, order.status, {
                      trackingNumber,
                      carrier,
                    });
                  }}
                />

                <InternalNotesSection key={`notes-${order.id}`} order={order} />

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

        {order && (
          <CancelOrderModal
            orderId={order.id}
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            onCancelled={() => {
              onUpdateStatus(order.id, "CANCELLED");
            }}
          />
        )}
      </AdminDrawer>
    );
  }
);

OrderDetailPanel.displayName = "OrderDetailPanel";
