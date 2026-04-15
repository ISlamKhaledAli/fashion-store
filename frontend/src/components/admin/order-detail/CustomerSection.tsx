"use client";

import React from "react";
import { Mail, MapPin } from "lucide-react";
import { Order } from "@/types";

interface CustomerSectionProps {
  user: Order["user"];
  address: Order["address"];
}

export const CustomerSection = React.memo(({ user, address }: CustomerSectionProps) => {
  return (
    <div className="bg-zinc-50 p-5 rounded-xl space-y-4 border border-zinc-100 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-200 shadow-sm shrink-0">
          <Mail size={14} className="text-zinc-500" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Email Contact</span>
          <span className="text-sm font-bold text-zinc-900 truncate">{user?.email}</span>
        </div>
      </div>
      
      <div className="flex items-start gap-3 pt-4 border-t border-zinc-200/50">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-zinc-200 shadow-sm shrink-0 mt-0.5">
          <MapPin size={14} className="text-zinc-500" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Shipping Destination</span>
          <div className="text-sm text-zinc-900">
            <p className="font-extrabold tracking-tight">{address?.firstName} {address?.lastName}</p>
            {address ? (
              <div className="text-zinc-500 mt-1 space-y-0.5 font-medium leading-relaxed">
                <p>{address.street}{address.apartment ? `, ${address.apartment}` : ""}</p>
                <p>{address.city}, {address.state} {address.zip}</p>
                <p>{address.country}</p>
              </div>
            ) : (
              <p className="text-zinc-400 mt-1 italic">No shipping address provided</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

CustomerSection.displayName = "CustomerSection";
