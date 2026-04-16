/**
 * Centralized utility for all mathematical financial checkout equations.
 * 
 * Enforcing 10% explicit default tax rate constraints locally.
 */

export const TAX_RATE = 0.10;

export interface PricingOptions {
  subtotal: number;
  discountAmount?: number;
  shippingMethod?: "standard" | "express" | "overnight" | string;
}

/**
 * Calculates correct derived mathematical subsets applying limits against subtotal bounds.
 */
export const calculateOrderTotals = ({ subtotal, discountAmount = 0, shippingMethod = "standard" }: PricingOptions) => {
  const shippingRates: Record<string, number> = {
    standard: 0,
    express: 9.99,
    overnight: 24.99
  };

  // Prevent illegal discount amounts overriding subtotal costs intrinsically 
  const appliedDiscount = Math.min(Math.max(0, discountAmount), subtotal);
  
  const discountedSubtotal = subtotal - appliedDiscount;
  
  // Explicitly mapping tax exclusively onto the POST-discount subtotal payload 
  const tax = discountedSubtotal * TAX_RATE;
  
  const shippingCost = shippingRates[shippingMethod] !== undefined ? shippingRates[shippingMethod] : shippingRates["standard"];
  
  const total = discountedSubtotal + tax + shippingCost;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(appliedDiscount * 100) / 100,
    discountedSubtotal: Math.round(discountedSubtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shippingCost: Math.round(shippingCost * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};
