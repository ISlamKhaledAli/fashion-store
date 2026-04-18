import React from "react";
import { PriceDisplay } from "../admin/PriceDisplay";

interface PricingProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export const Pricing = ({ subtotal, shipping, tax, total }: PricingProps) => {
  return (
    <div className="flex flex-col justify-end space-y-4">
      <div className="flex justify-between text-base">
        <span className="text-zinc-500 font-medium tracking-wide">Subtotal</span>
        <PriceDisplay amount={subtotal} />
      </div>
      <div className="flex justify-between text-base">
        <span className="text-zinc-500 font-medium tracking-wide">Shipping (Express)</span>
        <PriceDisplay amount={shipping} />
      </div>
      <div className="flex justify-between text-base">
        <span className="text-zinc-500 font-medium tracking-wide">Tax</span>
        <PriceDisplay amount={tax} />
      </div>
      <div className="pt-6 mt-4 border-t border-zinc-100 flex justify-between items-baseline">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Grand Total</span>
        <PriceDisplay amount={total} size="xl" className="text-3xl" />
      </div>
    </div>
  );
};
