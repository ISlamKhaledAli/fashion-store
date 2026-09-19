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
        <span className="font-medium tracking-wide text-zinc-500">
          Subtotal
        </span>
        <PriceDisplay amount={subtotal} />
      </div>
      <div className="flex justify-between text-base">
        <span className="font-medium tracking-wide text-zinc-500">
          Shipping (Express)
        </span>
        <PriceDisplay amount={shipping} />
      </div>
      <div className="flex justify-between text-base">
        <span className="font-medium tracking-wide text-zinc-500">Tax</span>
        <PriceDisplay amount={tax} />
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t border-zinc-100 pt-6">
        <span className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase">
          Grand Total
        </span>
        <PriceDisplay amount={total} size="xl" className="text-3xl" />
      </div>
    </div>
  );
};
