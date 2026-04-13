import React from "react";

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
        <span className="font-bold text-zinc-900">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between text-base">
        <span className="text-zinc-500 font-medium tracking-wide">Shipping (Express)</span>
        <span className="font-bold text-zinc-900">${shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="flex justify-between text-base">
        <span className="text-zinc-500 font-medium tracking-wide">Tax</span>
        <span className="font-bold text-zinc-900">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
      <div className="pt-6 mt-4 border-t border-zinc-100 flex justify-between items-baseline">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Grand Total</span>
        <span className="text-4xl font-black tracking-tighter text-zinc-900">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
};
