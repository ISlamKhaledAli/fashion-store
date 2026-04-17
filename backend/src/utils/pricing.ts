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

export const SHIPPING_METHODS = [
  { id: "standard", name: "Standard", time: "3-5 business days", rate: 10 },
  { id: "express", name: "Express", time: "1-2 business days", rate: 9.99 },
  { id: "overnight", name: "Overnight", time: "Next day delivery", rate: 24.99 },
];

/**
 * Calculates correct derived mathematical subsets applying limits against subtotal bounds.
 */
export const calculateOrderTotals = ({ subtotal, discountAmount = 0, shippingMethod = "standard" }: PricingOptions) => {
  const method = SHIPPING_METHODS.find(m => m.id === shippingMethod) || SHIPPING_METHODS[0];
  const shippingCost = method.rate;

  // Prevent illegal discount amounts overriding subtotal costs intrinsically 
  const appliedDiscount = Math.min(Math.max(0, discountAmount), subtotal);
  
  const discountedSubtotal = subtotal - appliedDiscount;
  
  // Explicitly mapping tax exclusively onto the POST-discount subtotal payload 
  const tax = discountedSubtotal * TAX_RATE;
  
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
