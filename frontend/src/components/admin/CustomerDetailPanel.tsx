"use client";

import React from "react";
import { 
  ShoppingBag, 
  Mail, 
  Ban, 
  RotateCcw,
  ShoppingCart
} from "lucide-react";
import { AdminCustomer } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AdminDrawer } from "./AdminDrawer";
import { PriceDisplay } from "./PriceDisplay";

interface CustomerDetailPanelProps {
  customer: AdminCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: "ACTIVE" | "BANNED") => void;
}

export const CustomerDetailPanel = ({
  customer,
  isOpen,
  onClose,
  onStatusChange,
}: CustomerDetailPanelProps) => {
  if (!customer) return null;

  return (
    <AdminDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Customer Profile"
      subtitle={customer.name}
      footer={
        <>
          <Button
            variant="primary"
            className="flex-1 h-[48px] font-black uppercase tracking-[0.2em] text-[10px]"
            onClick={() => window.location.href = `mailto:${customer.email}`}
            icon={<Mail size={16} />}
          >
            Message Customer
          </Button>
          <Button
            variant={customer.status === 'ACTIVE' ? "outline" : "primary"}
            className={cn(
              "px-8 h-[48px] font-black uppercase tracking-[0.2em] text-[10px]",
              customer.status === 'ACTIVE' ? "text-red-500 border-red-100 hover:bg-red-50" : "bg-red-600 border-red-600 hover:bg-red-700 text-white"
            )}
            onClick={() => onStatusChange(customer.id, customer.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE')}
            icon={customer.status === 'ACTIVE' ? <Ban size={16} /> : <RotateCcw size={16} />}
          >
            {customer.status === 'ACTIVE' ? "Restrict" : "Restore"}
          </Button>
        </>
      }
    >
      <div className="space-y-12">
        {/* Profile Overview */}
        <div className="flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-50 mb-6 shadow-inner bg-zinc-50 flex items-center justify-center">
            {customer.avatar ? (
              <img className="w-full h-full object-cover" src={customer.avatar} alt={customer.name} />
            ) : (
              <span className="text-4xl font-bold text-zinc-300">
                {customer.name.split(" ").map(n => n[0]).join("")}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{customer.name}</h3>
          <p className="text-zinc-500 text-sm mt-1">{customer.email}</p>
          <div className="mt-4 flex gap-2">
             {customer.totalSpent > 10000 && (
               <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider rounded">VIP Customer</span>
             )}
             <span className="px-3 py-1 bg-zinc-50 text-zinc-500 text-[10px] font-bold uppercase tracking-wider rounded border border-zinc-100">
               Joined {new Date(customer.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
             </span>
          </div>
        </div>

        {/* Detailed Stats Bento */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100/50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Lifetime Value</span>
              <PriceDisplay amount={customer.totalSpent} size="lg" />
            </div>
            <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100/50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Order Count</span>
              <p className="text-xl font-bold text-zinc-900 tabular-nums">{customer.totalOrders}</p>
            </div>
          </div>
          {customer.orders && customer.orders.length > 0 && (
            <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-100/50">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-2">Last Order Status</span>
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-zinc-700">
                  {new Date(customer.orders[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{customer.orders[0].status}</span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Recent Activity</h4>
            {customer.orders && customer.orders.length > 3 && (
              <Button 
                variant="none"
                size="none"
                className="text-xs text-zinc-900 font-bold border-b border-zinc-900/10 hover:border-zinc-900 transition-all rounded-none"
              >
                View All
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            {customer.orders && customer.orders.length > 0 ? (
              customer.orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-start gap-4 p-4 rounded-xl border border-zinc-50 hover:bg-zinc-50/50 transition-all group">
                  <div className="w-12 h-12 bg-zinc-50 group-hover:bg-zinc-100 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                    <ShoppingCart size={18} className="text-zinc-400" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-sm font-bold text-zinc-900 truncate">#ORD-{order.id.slice(-6).toUpperCase()}</p>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shrink-0",
                        order.status === 'DELIVERED' ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50"
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                      <PriceDisplay amount={order.total} size="sm" /> • {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/30">
                <ShoppingBag size={32} className="text-zinc-200 mb-4" strokeWidth={1} />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">No activity logged</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminDrawer>
  );
};
