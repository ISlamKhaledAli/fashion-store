import { calculateOrderTotals } from "../src/utils/pricing";

describe("Pricing Calculations", () => {
  it("produces integer cents for all shipping methods and discount combinations", () => {
    const cases = [
      { subtotal: 10.99, shippingMethod: "express", discountAmount: 0 },
      { subtotal: 33.33, shippingMethod: "overnight", discountAmount: 10 },
      { subtotal: 7.00,  shippingMethod: "standard", discountAmount: 0 },
    ];
    
    cases.forEach((c) => {
      const { total } = calculateOrderTotals(c);
      expect(Number.isInteger(Math.round(total * 100))).toBe(true);
      expect(total * 100).toBeCloseTo(Math.round(total * 100), 10);
    });
  });
});
