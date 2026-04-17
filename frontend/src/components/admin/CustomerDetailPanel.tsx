"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, ShoppingBag, DollarSign, 
  Ban, ShieldCheck, Trash2, ExternalLink, ChevronRight 
} from "lucide-react";
import { AdminCustomer, CustomerOrder } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/Button";
import { CloseButton } from "@/components/ui/CloseButton";
import { formatCurrency, cn } from "@/lib/utils";

interface CustomerDetailPanelProps {
  customer: AdminCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: 'ACTIVE' | 'BANNED') => void;
  onDelete: (id: string) => void;
}

// Memoized helper components for performance
const MetricCard = React.memo(({ 
  label, 
  value, 
  icon: Icon, 
  className 
}: { 
  label: string; 
  value: string | number; 
  icon: any; 
  className?: string;
}) => (
  <div className={cn(
    "flex flex-col gap-1 p-6 rounded-xl border border-zinc-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-zinc-200 group relative overflow-hidden",
    className
  )}>
    <div className="flex justify-between items-start relative z-10">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">{label}</span>
      <div className="p-2 rounded-lg bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-colors">
        <Icon size={16} strokeWidth={1.5} />
      </div>
    </div>
    <div className="mt-4 relative z-10">
      <span className="text-3xl font-bold tracking-tight text-zinc-950 leading-none">{value}</span>
    </div>
    <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
       <Icon size={80} strokeWidth={1} />
    </div>
  </div>
));
MetricCard.displayName = "MetricCard";

const TransactionItem = React.memo(({ 
  order, 
  onClick 
}: { 
  order: CustomerOrder; 
  onClick?: () => void;
}) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white transition-all duration-200 hover:bg-zinc-50 cursor-pointer group"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:border-zinc-200 transition-all">
        <ShoppingBag size={18} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-bold text-zinc-950 tracking-tight">#{order.id.split('-')[1] || order.id.slice(-6)}</p>
        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mt-0.5">
          {new Date(order.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-6">
      <div className="text-right">
        <p className="text-sm font-bold text-zinc-950 tabular-nums">{formatCurrency(order.total)}</p>
        <div className="mt-1 flex justify-end">
          <StatusBadge status={order.status} className="px-1.5 py-0 text-[7px] font-black tracking-widest leading-none scale-[0.85] origin-right opacity-80" />
        </div>
      </div>
      <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-950 group-hover:translate-x-1 transition-all" />
    </div>
  </div>
));
TransactionItem.displayName = "TransactionItem";

export const CustomerDetailPanel = React.memo(({ 
  customer, 
  isOpen,
  onClose, 
  onStatusChange, 
  onDelete 
}: CustomerDetailPanelProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, onClose]);

  // Memoize transaction list to prevent heavy re-renders during animation
  const transactionStream = useMemo(() => {
    if (!customer?.orders) return null;
    return customer.orders.map((order) => (
      <TransactionItem 
        key={order.id} 
        order={order} 
      />
    ));
  }, [customer?.orders]);

  if (!mounted) return null;

  const content = (
    <AnimatePresence>
      {isOpen && customer && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay - Optimized with simple opacity transition */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
          
          {/* Drawer - Uses purely hardware-accelerated transforms (x) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} 
            className="fixed inset-y-0 right-0 w-full sm:w-[540px] bg-white shadow-2xl z-50 flex flex-col origin-right"
          >
            {/* Panel Header */}
            <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 overflow-hidden shadow-inner shrink-0 rotate-3">
                  {customer.avatar ? (
                    <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-950">{customer.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={customer.status} className="px-1.5 py-0 text-[7px] min-w-0 font-black tracking-widest scale-90 origin-left" />
                    <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                      Customer Since {new Date(customer.joinDate).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
              <CloseButton onClick={onClose} className="hover:rotate-90 transition-transform duration-300" />
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
              {/* Profile Overview */}
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">Account Profile</h3>
                  <Button variant="none" className="p-0 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-950 transition-colors">Edit Metadata</Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="group flex items-center justify-between p-5 rounded-xl border border-zinc-100 bg-white transition-all duration-200 hover:border-zinc-200">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-zinc-50 text-zinc-400">
                        <Mail size={16} strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Contact Email</span>
                        <span className="text-sm font-bold text-zinc-950 truncate max-w-[240px]">{customer.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="group flex items-center justify-between p-5 rounded-xl border border-zinc-100 bg-white transition-all duration-200 hover:border-zinc-200">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 rounded-lg bg-zinc-50 text-zinc-400">
                        <Phone size={16} strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-0.5">Primary Connection</span>
                        <span className="text-sm font-bold text-zinc-950">{customer.phone || "No direct connection"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Acquisition Metrics Grid */}
              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-50 pb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">Acquisition Metrics</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard 
                    label="Units Acquired" 
                    value={customer.totalOrders.toString().padStart(2, '0')} 
                    icon={ShoppingBag} 
                  />
                  <MetricCard 
                    label="Lifetime Value" 
                    value={formatCurrency(customer.totalSpent)} 
                    icon={DollarSign} 
                  />
                </div>
              </section>

              {/* Recent Transaction Intelligence */}
              <section className="space-y-6">
                <div className="flex justify-between items-end border-b border-zinc-50 pb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400">Transaction Stream</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">{(customer.orders?.length || 0)} Recent Events</span>
                </div>
                
                <div className="space-y-3 pb-8">
                  {transactionStream || (
                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/30">
                      <ShoppingBag size={32} className="text-zinc-200 mb-4" strokeWidth={1} />
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Vacant Stream</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Account Management Actions */}
            <div className="p-8 border-t border-zinc-100 bg-white flex items-center justify-between gap-4 sticky bottom-0 z-10">
              <Button 
                variant="none"
                size="none"
                onClick={() => onDelete(customer.id)}
                className="h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 group flex-1 max-w-[120px]"
              >
                <Trash2 size={14} className="opacity-60 group-hover:opacity-100" />
                Purge
              </Button>
              
              <div className="flex items-center gap-3 flex-1 h-11">
                {customer.status === 'ACTIVE' ? (
                  <Button 
                    variant="none"
                    size="none"
                    onClick={() => onStatusChange(customer.id, 'BANNED')}
                    className="h-full w-full bg-red-50 text-red-600 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-100 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    icon={<Ban size={14} />}
                  >
                    Restrict Account
                  </Button>
                ) : (
                  <Button 
                    variant="none"
                    size="none"
                    onClick={() => onStatusChange(customer.id, 'ACTIVE')}
                    className="h-full w-full bg-zinc-950 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:opacity-90 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    icon={<ShieldCheck size={14} />}
                  >
                    Restore Access
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
});

CustomerDetailPanel.displayName = "CustomerDetailPanel";
