export interface Review {
  id: string;
  name: string;
  rating: number;
  title: string;
  text: string;
  daysAgo: number;
  helpful: number;
  unhelpful: number;
  verified: boolean;
}

/** Mock reviews removed — populate from a real backend
 * (GET /products/:id/reviews) once one exists. */
export function deriveReviews(productId: string): Review[] {
  return [];
}

/** No mock reviews to average anymore — returns 0 until a real backend
 * supplies actual ratings. Guarded against the empty-array case (rather
 * than dividing by reviews.length, which would be 0/0 = NaN). */
export function deriveOverallRating(productId: string): number {
  const reviews = deriveReviews(productId);
  if (reviews.length === 0) return 0;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return Math.round(avg * 10) / 10;
}
