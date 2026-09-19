"use client";

import React from "react";
import { Mail, MapPin } from "lucide-react";
import type { Order } from "@/types";

interface CustomerSectionProps {
  user: Order["user"];
  address: Order["address"];
}

export const CustomerSection = React.memo(
  ({ user, address }: CustomerSectionProps) => {
    return (
      <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
            <Mail size={14} className="text-zinc-500" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="mb-1 text-[10px] leading-none font-bold tracking-widest text-zinc-400 uppercase">
              Email Contact
            </span>
            <span className="truncate text-sm font-bold text-zinc-900">
              {user?.email}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 border-t border-zinc-200/50 pt-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
            <MapPin size={14} className="text-zinc-500" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="mb-1 text-[10px] leading-none font-bold tracking-widest text-zinc-400 uppercase">
              Shipping Destination
            </span>
            <div className="text-sm text-zinc-900">
              <p className="font-extrabold tracking-tight">
                {address?.firstName} {address?.lastName}
              </p>
              {address ? (
                <div className="mt-1 space-y-0.5 leading-relaxed font-medium text-zinc-500">
                  <p>
                    {address.street}
                    {address.apartment ? `, ${address.apartment}` : ""}
                  </p>
                  <p>
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p>{address.country}</p>
                </div>
              ) : (
                <p className="mt-1 text-zinc-400 italic">
                  No shipping address provided
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CustomerSection.displayName = "CustomerSection";
