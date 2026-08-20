import type { Product } from "@/data/products";
import { parsePrice } from "@/utils/price";
import { deriveRating } from "@/utils/rating";
import { deriveDiscount } from "@/utils/discount";

export interface PriceBand {
  label: string;
  min: number;
  max: number | null;
}

export const PRICE_BANDS: PriceBand[] = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
  { label: "₹5,000 – ₹20,000", min: 5000, max: 20000 },
  { label: "Above ₹20,000", min: 20000, max: null },
];

export const RATING_OPTIONS = [
  { label: "4★ & above", min: 4 },
  { label: "3★ & above", min: 3 },
  { label: "2★ & above", min: 2 },
];

export const DISCOUNT_OPTIONS = [
  { label: "10% or more", min: 10 },
  { label: "20% or more", min: 20 },
  { label: "40% or more", min: 40 },
  { label: "50% or more", min: 50 },
];

export type SortOption =
  | "popularity"
  | "priceLowToHigh"
  | "priceHighToLow"
  | "newest"
  | "rating"
  | "discount";

export const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Popularity", value: "popularity" },
  { label: "Price: Low to High", value: "priceLowToHigh" },
  { label: "Price: High to Low", value: "priceHighToLow" },
  { label: "Newest First", value: "newest" },
  { label: "Customer Rating", value: "rating" },
  { label: "Discount", value: "discount" },
];

// Fields that should never be treated as a category-specific "extra"
// attribute anywhere in the customer-facing UI — generic fields that
// are already shown in their own dedicated spot (title, price, images),
// plus vendor/backend-internal bookkeeping (stock thresholds, database
// ids, timestamps). This matters because mapRemoteProduct
// (vendorProductsSlice.ts) stores the ENTIRE raw backend response as
// `attributes`, not just the category-specific extra fields — without
// this filter, things like the database _id or low-stock threshold
// would otherwise leak into both the filter sidebar and the product
// detail page's spec list.
const GENERIC_HIDDEN_ATTRIBUTE_KEYS = new Set([
  "mrp",
  "sellingPrice",
  "discountPercentage",
  "stock",
  "lowStockLimit",
  "criticalStockLimit",
  "productName",
  "title",
  "titleDescription",
  "productDescription",
  "description",
  "category",
  "imageUrls",
  "images",
  "coverImages",
  "_id",
  "id",
  "vendorId",
  "createdAt",
  "updatedAt",
  "__v",
  "success",
  "message",
]);

/** Same as GENERIC_HIDDEN_ATTRIBUTE_KEYS — exported under a name that's
 * clearer at each call site (product/[id].tsx uses this one). */
export const CUSTOMER_HIDDEN_ATTRIBUTE_KEYS = GENERIC_HIDDEN_ATTRIBUTE_KEYS;

/** Attribute keys that exist in the schema but aren't useful as
 * multi-select filter dimensions — everything in
 * GENERIC_HIDDEN_ATTRIBUTE_KEYS, plus free-text fields too unstructured
 * to filter by (size charts, model numbers, specs) and fields better
 * suited to their own dedicated filter (expiry date, publication date).
 * Everything else becomes a filter tab automatically, driven entirely
 * by data/vendorProductAttributes.ts. */
const NON_FILTERABLE_ATTRIBUTE_KEYS = new Set([
  ...GENERIC_HIDDEN_ATTRIBUTE_KEYS,
  "sizeChart",
  "specifications",
  "modelNumber",
  "expiryDate",
  "manufacturer",
  "warranty",
  "quantity",
  "unit",
  "lengthCm",
  "widthCm",
  "heightCm",
  "seatingCapacity",
  "authorName",
  "publisher",
  "publicationDate",
  "edition",
  "pages",
]);

// Human-readable labels for every known attribute key across all 14
// category schemas — used both for filter tabs and for the "Product
// Details" spec rows on the customer-facing product page.
const ATTRIBUTE_LABELS: Record<string, string> = {
  brandName: "Brand",
  subCategory: "Sub Category",
  material: "Material",
  fabric: "Fabric",
  pattern: "Pattern",
  fitType: "Fit Type",
  occasion: "Occasion",
  sizes: "Size",
  size: "Size",
  colors: "Color",
  color: "Color",
  skinType: "Skin Type",
  ageGroup: "Age Group",
  gender: "Gender",
  stockStatus: "Stock Status",
  status: "Availability",
  finishType: "Finish Type",
  bookType: "Book Type",
  language: "Language",
  format: "Format",
  modelNumber: "Model Number",
  specifications: "Specifications",
  warranty: "Warranty",
  quantity: "Quantity",
  unit: "Unit",
  lengthCm: "Length (cm)",
  widthCm: "Width (cm)",
  heightCm: "Height (cm)",
  seatingCapacity: "Seating Capacity",
  authorName: "Author",
  publisher: "Publisher",
  publicationDate: "Publication Date",
  edition: "Edition",
  pages: "Pages",
  manufacturer: "Manufacturer",
  expiryDate: "Expiry Date",
  sizeChart: "Size Chart",
};

export function attributeLabel(key: string): string {
  return ATTRIBUTE_LABELS[key] ?? key;
}

/** Finds every attribute key actually present in this product list that's
 * worth showing as a filter tab — driven by real data, not a hardcoded
 * category assumption, so it naturally adapts to whichever category(ies)
 * the product list happens to contain (a single category's browse page,
 * or a mixed set from search). */
export function getFilterableAttributeKeys(products: Product[]): string[] {
  const keys = new Set<string>();
  for (const p of products) {
    if (!p.attributes) continue;
    for (const key of Object.keys(p.attributes)) {
      if (!NON_FILTERABLE_ATTRIBUTE_KEYS.has(key) && p.attributes[key]) {
        keys.add(key);
      }
    }
  }
  return Array.from(keys);
}

/** Pulls the distinct set of values actually present in a product list
 * for one attribute key — e.g. every color any vendor has entered —
 * splitting comma-separated fields (like Fashion's "colors"/"sizes")
 * into individual options automatically. */
export function getAvailableAttributeValues(products: Product[], key: string): string[] {
  const values = new Set<string>();
  for (const p of products) {
    const raw = p.attributes?.[key];
    if (!raw) continue;
    raw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .forEach((v) => values.add(v));
  }
  return Array.from(values).sort();
}

export interface ActiveFilters {
  priceBands: string[];
  minRating: number | null;
  minDiscount: number | null;
  brands: string[];
  categories: string[];
  inStockOnly: boolean;
  sortBy: SortOption | null;
  /** Dynamic attribute filters, keyed by the real attribute field name
   * (e.g. "colors", "material", "skinType") — replaces the old fixed
   * gender/fabric/color/usage/size fields, since those field names
   * genuinely differ per category now. */
  attributes: Record<string, string[]>;
}

export const EMPTY_FILTERS: ActiveFilters = {
  priceBands: [],
  minRating: null,
  minDiscount: null,
  brands: [],
  categories: [],
  inStockOnly: false,
  sortBy: null,
  attributes: {},
};

export function countActiveFilters(f: ActiveFilters): number {
  const attributeCount = Object.values(f.attributes).reduce((sum, list) => sum + list.length, 0);
  return (
    f.priceBands.length +
    (f.minRating ? 1 : 0) +
    (f.minDiscount ? 1 : 0) +
    f.brands.length +
    f.categories.length +
    (f.inStockOnly ? 1 : 0) +
    (f.sortBy ? 1 : 0) +
    attributeCount
  );
}

function matchesAttribute(product: Product, key: string, selected: string[]): boolean {
  if (!selected || selected.length === 0) return true;
  const raw = product.attributes?.[key];
  if (!raw) return false;
  const productValues = raw.split(",").map((v) => v.trim().toLowerCase());
  return selected.some((s) => productValues.includes(s.toLowerCase()));
}

export function applyFilters<T extends Product & { categoryKey?: string }>(
  products: T[],
  filters: ActiveFilters
): T[] {
  return products.filter((p) => {
    const price = parsePrice(p.price);

    if (filters.priceBands.length > 0) {
      const inAnyBand = filters.priceBands.some((label) => {
        const band = PRICE_BANDS.find((b) => b.label === label);
        if (!band) return false;
        return price >= band.min && (band.max === null || price < band.max);
      });
      if (!inAnyBand) return false;
    }

    if (filters.minRating) {
      const { rating } = deriveRating(p.id);
      if (rating < filters.minRating) return false;
    }

    if (filters.minDiscount) {
      const { discountPercent } = deriveDiscount(p.id, price);
      if (discountPercent < filters.minDiscount) return false;
    }

    if (filters.brands.length > 0) {
      const titleLower = p.title.toLowerCase();
      const brandLower = p.attributes?.brandName?.toLowerCase() ?? "";
      const matchesBrand = filters.brands.some(
        (b) => titleLower.includes(b.toLowerCase()) || brandLower === b.toLowerCase()
      );
      if (!matchesBrand) return false;
    }

    if (filters.categories.length > 0 && p.categoryKey) {
      if (!filters.categories.includes(p.categoryKey)) return false;
    }

    if (!Object.entries(filters.attributes).every(([key, selected]) => matchesAttribute(p, key, selected))) {
      return false;
    }

    return true;
  });
}

/** Applied after applyFilters — sorting is about display order, not
 * inclusion/exclusion, so it's kept as a separate step. */
export function sortProducts<T extends Product>(products: T[], sortBy: SortOption | null): T[] {
  if (!sortBy) return products;
  const withMeta = products.map((p) => ({
    product: p,
    price: parsePrice(p.price),
    rating: deriveRating(p.id).rating,
    discount: deriveDiscount(p.id, parsePrice(p.price)).discountPercent,
  }));

  switch (sortBy) {
    case "priceLowToHigh":
      withMeta.sort((a, b) => a.price - b.price);
      break;
    case "priceHighToLow":
      withMeta.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      withMeta.sort((a, b) => b.rating - a.rating);
      break;
    case "discount":
      withMeta.sort((a, b) => b.discount - a.discount);
      break;
    case "newest":
    case "popularity":
    default:
      // No real timestamp/popularity signal on this Product shape —
      // leave in the order the caller already provided.
      break;
  }
  return withMeta.map((m) => m.product);
}