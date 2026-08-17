export function parsePrice(priceStr: string): number {
  const digitsOnly = priceStr.replace(/[^\d]/g, "");
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}
