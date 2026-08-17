export interface Coupon {
  code: string;
  description: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxDiscount?: number; // caps percent-based discounts
}

export const COUPONS: Coupon[] = [];
// Mock coupons removed — populate from a real backend once one exists.

export function findCoupon(code: string): Coupon | undefined {
  return COUPONS.find((c) => c.code === code.trim().toUpperCase());
}

/** Returns the discount amount for a coupon against a given order value, or
 * an error message if the coupon doesn't apply. */
export function evaluateCoupon(
  coupon: Coupon,
  orderValue: number
): { discount: number } | { error: string } {
  if (orderValue < coupon.minOrder) {
    return { error: `Add ₹${(coupon.minOrder - orderValue).toLocaleString("en-IN")} more to use this coupon` };
  }
  if (coupon.type === "flat") {
    return { discount: Math.min(coupon.value, orderValue) };
  }
  const raw = (orderValue * coupon.value) / 100;
  const capped = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
  return { discount: Math.round(capped) };
}
