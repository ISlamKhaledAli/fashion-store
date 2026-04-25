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

export interface DiscountResult {
  discountAmount: number;
  isValid: boolean;
  message?: string;
}

/**
 * Centralized discount validation and calculation.
 * All controllers must use this instead of inline logic.
 */
export const calculateDiscount = (
  subtotal: number,
  discount: {
    type: string;
    value: number;
    minOrder?: number | null;
    maxUses?: number | null;
    usedCount: number;
    expiresAt?: Date | null;
    isActive: boolean;
  }
): DiscountResult => {
  if (!discount.isActive) {
    return { discountAmount: 0, isValid: false, message: "Invalid or inactive discount code" };
  }

  if (discount.expiresAt && new Date() > new Date(discount.expiresAt)) {
    return { discountAmount: 0, isValid: false, message: "Discount code has expired" };
  }

  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    return { discountAmount: 0, isValid: false, message: "Discount usage limit reached" };
  }

  if (discount.minOrder && subtotal < discount.minOrder) {
    return {
      discountAmount: 0,
      isValid: false,
      message: `Minimum order amount is $${discount.minOrder}`,
    };
  }

  let discountAmount = 0;
  const type = discount.type.toLowerCase();
  if (type === "percentage" || type === "percent") {
    discountAmount = subtotal * (discount.value / 100);
  } else if (type === "fixed") {
    discountAmount = Math.min(discount.value, subtotal);
  }

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    isValid: true,
  };
};

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
