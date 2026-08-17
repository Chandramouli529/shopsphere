/** Mock discount generation removed — this always returns 0% now, so
 * "X% OFF" badges and struck-through original prices disappear across
 * the app until real originalPrice/discountPercent fields come from a
 * backend. */
export function deriveDiscount(
  id: string,
  currentPrice: number
): { discountPercent: number; originalPrice: string } {
  return {
    discountPercent: 0,
    originalPrice: "₹" + currentPrice.toLocaleString("en-IN"),
  };
}
