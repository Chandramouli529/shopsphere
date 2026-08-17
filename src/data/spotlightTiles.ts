import { PRODUCT_CATEGORIES } from "@/data/categories";

export interface SpotlightTile {
  emoji: string;
  label: string;
  bg: string;
  badge?: string;
}

const SPOTLIGHT_POOL: SpotlightTile[] = [
  { emoji: "🎉", label: "Sale is Live!", bg: "#fff4cc" },
  { emoji: "🌸", label: "Live now!", bg: "#fff3cf" },
  { emoji: "✨", label: "New Arrivals", bg: "#ffe1e1" },
  { emoji: "🔥", label: "Trending Now", bg: "#ffe4ec" },
  { emoji: "🎁", label: "Combo Offers", bg: "#e7ddff" },
  { emoji: "⭐", label: "Top Rated", bg: "#e0f2e9" },
  { emoji: "💸", label: "Under ₹999", bg: "#fff6d9" },
  { emoji: "🚀", label: "Just Launched", bg: "#f0f0f0" },
  { emoji: "🏆", label: "Best Sellers", bg: "#ffe6d6" },
  { emoji: "💳", label: "Pay Later", bg: "#d9f2ea", badge: "APPLY NOW" },
  { emoji: "🧭", label: "Explore Store", bg: "#f5f0ea" },
  { emoji: "🎯", label: "Deal of the Day", bg: "#f0f0f0" },
];

/** Deterministically rotates a 6-tile window through the shared pool so
 * every category's "In the Spotlight" grid looks a little different without
 * having to hand-author content for all of them. */
export function getSpotlightTiles(categoryKey: string): SpotlightTile[] {
  const index = PRODUCT_CATEGORIES.findIndex((c) => c.key === categoryKey);
  const offset = ((index < 0 ? 0 : index) * 2) % SPOTLIGHT_POOL.length;
  const tiles: SpotlightTile[] = [];
  for (let i = 0; i < 6; i++) {
    tiles.push(SPOTLIGHT_POOL[(offset + i) % SPOTLIGHT_POOL.length]);
  }
  return tiles;
}
