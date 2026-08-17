export interface Product {
  id: string;
  emoji: string;
  title: string;
  price: string;
  /** Real product photos were removed — this is always "" now, so every
   * screen that reads it (ProductCard, Cart, Wishlist, Orders) falls back
   * to `emoji` automatically. Field kept (rather than deleted) so none of
   * those screens needed to change. */
  image: string;
  /** Always [] now, for the same reason as `image` — the Product Details
   * gallery renders a single emoji "slide" when this is empty. */
  images: string[];
  /** Category-specific extra data (see data/vendorProductAttributes.ts)
   * — e.g. for Fashion: gender, fabric, color, size, occasion/usage.
   * Only present for real vendor-created products; absent (undefined)
   * for the (currently empty) static mock catalogue. */
  attributes?: Record<string, string>;
}

interface RawProduct {
  id: string;
  emoji: string;
  title: string;
  price: string;
}

/**
 * Mock catalogue, keyed by category key (matches CategoryDef.key in
 * data/categories.ts). Replace with a real `GET /products?category=` call
 * when a backend is wired up — the shape (id/emoji→image/title/price) is
 * what ProductCard and ProductSection expect, so swapping the data source
 * doesn't require touching the UI.
 */
const RAW_PRODUCTS_BY_CATEGORY: Record<string, RawProduct[]> = {
  // Mock catalogue removed — populate from a real backend
  // (GET /products?category=) once one exists.
};

/** Real images were removed — every product now falls back to its `emoji`
 * everywhere (ProductCard, Cart, Wishlist, Orders, Product Details gallery
 * all already handle an empty `image`/`images` by showing the emoji, so no
 * other file needed to change). `images` still exists as an array so the
 * Product Details gallery keeps working — it just renders a single emoji
 * "slide" when the array is empty. */
export const PRODUCTS_BY_CATEGORY: Record<string, Product[]> = Object.fromEntries(
  Object.entries(RAW_PRODUCTS_BY_CATEGORY).map(([categoryKey, list]) => [
    categoryKey,
    list.map((p) => ({ ...p, image: "", images: [] })),
  ])
);

/** Finds a product by id across every category. Used by the Product Details
 * page, which is reached from Home, the category listing, and the
 * Categories tab, none of which know each other's data shape. */
export function findProductById(
  id: string
): { product: Product; categoryKey: string } | undefined {
  for (const categoryKey of Object.keys(PRODUCTS_BY_CATEGORY)) {
    const product = PRODUCTS_BY_CATEGORY[categoryKey].find((p) => p.id === id);
    if (product) return { product, categoryKey };
  }
  return undefined;
}

/** Flat list of every product across all categories, each tagged with its
 * category key. Used by search. */
export interface SearchableProduct extends Product {
  categoryKey: string;
}

export function getAllProductsFlat(): SearchableProduct[] {
  const out: SearchableProduct[] = [];
  for (const categoryKey of Object.keys(PRODUCTS_BY_CATEGORY)) {
    for (const product of PRODUCTS_BY_CATEGORY[categoryKey]) {
      out.push({ ...product, categoryKey });
    }
  }
  return out;
}

/** Simple case-insensitive substring search across product titles. */
export function searchProducts(query: string): SearchableProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getAllProductsFlat().filter((p) => p.title.toLowerCase().includes(q));
}