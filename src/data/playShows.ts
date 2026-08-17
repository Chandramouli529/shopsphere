export interface PlayShow {
  id: string;
  productId: string;
  caption: string;
  badge: "LIVE" | "NEW" | "SALE";
  colors: [string, string];
  views: string;
}

/** Mock shows removed — they referenced specific mock product ids that no
 * longer exist. Populate from a real backend once one exists; each show
 * should reference a real product id so Shop Now/cart/wishlist keep
 * working the same way. */
export const PLAY_SHOWS: PlayShow[] = [];
