import { deriveOverallRating } from "@/data/mockReviews";

export function ratingLabel(rating: number): string {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4.0) return "Very Good";
  if (rating >= 3.5) return "Good";
  if (rating >= 3.0) return "Average";
  return "Below Average";
}

/** The product's rating and review count. `rating` is the actual average of
 * that product's reviews (see data/mockReviews.ts deriveOverallRating) —
 * currently always 0 since mock reviews were removed. `reviewCount` is
 * also 0 now rather than a fabricated number. Swap both for real backend
 * fields once reviews are stored server-side. */
export function deriveRating(id: string): { rating: number; reviewCount: number } {
  return { rating: deriveOverallRating(id), reviewCount: 0 };
}

export interface ConditionRating {
  label: string;
  rating: number; // 3.0 .. 5.0
}

/** Which attributes get "Rated by customers for" pills depends on what kind
 * of product it is — a phone gets Camera/Battery/Display, a t-shirt gets
 * Fabric/Fit, a book gets Content/Print Quality. Falls back to a generic
 * quality-focused set for any category not listed here. This label
 * structure is kept (it's app taxonomy, not fabricated data) — only the
 * per-attribute scores below are zeroed out. */
const CONDITION_LABELS_BY_CATEGORY: Record<string, string[]> = {
  mobiles: ["Camera", "Battery", "Display", "Design", "Performance", "Build Quality", "Value for Money"],
  electronics: ["Performance", "Battery", "Display", "Build Quality", "Ease of Use", "Value for Money"],
  fashion: ["Fabric Quality", "Fit & Size", "Comfort", "Design", "Durability", "Value for Money"],
  beauty: ["Effectiveness", "Fragrance", "Packaging", "Skin Friendliness", "Value for Money"],
  home: ["Build Quality", "Material", "Durability", "Design", "Value for Money"],
  furniture: ["Build Quality", "Material", "Comfort", "Durability", "Value for Money"],
  appliances: ["Performance", "Energy Efficiency", "Noise Level", "Build Quality", "Value for Money"],
  sports: ["Durability", "Grip & Comfort", "Performance", "Build Quality", "Value for Money"],
  healthcare: ["Accuracy", "Ease of Use", "Build Quality", "Value for Money"],
  toys: ["Safety", "Durability", "Fun Factor", "Build Quality", "Value for Money"],
  books: ["Content Quality", "Print Quality", "Value for Money"],
};

const DEFAULT_CONDITION_LABELS = ["Quality", "Durability", "Design", "Value for Money"];

/** Mock per-attribute rating generation removed — every attribute now
 * returns 0 instead of a fabricated 3.0–5.0 score. Swap for real
 * per-attribute review data from a backend. */
export function deriveConditionRatings(id: string, categoryKey: string): ConditionRating[] {
  const labels = CONDITION_LABELS_BY_CATEGORY[categoryKey] ?? DEFAULT_CONDITION_LABELS;
  return labels.map((label) => ({ label, rating: 0 }));
}
