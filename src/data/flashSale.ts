import { PRODUCTS_BY_CATEGORY } from "./products";
import { parsePrice } from "@/utils/price";

export interface FlashSaleItem {
  id: string;
  emoji: string;
  title: string;
  price: string; // discounted, shown as the real transactional price
  originalPrice: string; // pre-discount, shown struck through
  discountPercent: number;
  image: string;
}

function formatRupees(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/** Picks a handful of catalogue items and applies a discount to build Flash
 * Sale entries. Keeps the product's real id/emoji/title so Add to Cart,
 * navigation to Product Details, etc. all work exactly like a normal
 * product — only the displayed price/badge differ. */
function buildFlashSaleItems(): FlashSaleItem[] {
  const picks: { categoryKey: string; productId: string; discountPercent: number }[] = [
    { categoryKey: "mobiles", productId: "mo4", discountPercent: 25 },
    { categoryKey: "fashion", productId: "fa4", discountPercent: 30 },
    { categoryKey: "electronics", productId: "el3", discountPercent: 20 },
    { categoryKey: "beauty", productId: "be2", discountPercent: 35 },
    { categoryKey: "appliances", productId: "ap3", discountPercent: 15 },
    { categoryKey: "sports", productId: "sp5", discountPercent: 40 },
  ];

  const items: FlashSaleItem[] = [];
  for (const pick of picks) {
    const product = PRODUCTS_BY_CATEGORY[pick.categoryKey]?.find((p) => p.id === pick.productId);
    if (!product) continue;
    const currentPrice = parsePrice(product.price);
    const originalPrice = currentPrice / (1 - pick.discountPercent / 100);
    items.push({
      id: product.id,
      emoji: product.emoji,
      title: product.title,
      price: product.price,
      originalPrice: formatRupees(originalPrice),
      discountPercent: pick.discountPercent,
      image: product.image,
    });
  }
  return items;
}

export const FLASH_SALE_ITEMS: FlashSaleItem[] = buildFlashSaleItems();

/** Sale "ends" this many hours from whenever the app was loaded — a simple
 * session-length countdown since there's no backend-driven sale schedule. */
const FLASH_SALE_DURATION_HOURS = 5;

export const FLASH_SALE_END_TIME: number = Date.now() + FLASH_SALE_DURATION_HOURS * 60 * 60 * 1000;
