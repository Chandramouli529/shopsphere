import vendorApiClient from "@/services/vendorApi";

/** Every category has its own dedicated REST resource on the real
 * backend — there's no single shared "create product" endpoint. This
 * maps our internal category keys (data/categories.ts) to the URL
 * segment each one actually uses.
 *
 * "furniture" has no endpoint yet (none was provided) — creating a
 * furniture product will show a clear error rather than silently
 * failing or hitting the wrong URL. */
const CATEGORY_ENDPOINT: Record<string, string> = {
  fashion: "fashion",
  electronics: "electronics",
  beauty: "beauty",
  home: "home",
  appliances: "appliances",
  toys: "toys",
  sports: "sports",
  stationery: "stationery",
  musicalinstruments: "musical-instruments",
  healthcare: "health-care",
  groceries: "groceries",
  books: "books",
  artscrafts: "arts-crafts",
  // furniture: "furniture", --- no endpoint yet
};

export function getCategoryEndpoint(categoryKey: string): string | null {
  return CATEGORY_ENDPOINT[categoryKey] ?? null;
}

export function hasRealCategoryApi(categoryKey: string): boolean {
  return categoryKey in CATEGORY_ENDPOINT;
}

export const ALL_REAL_CATEGORY_KEYS = Object.keys(CATEGORY_ENDPOINT);

// Which categories expose PUT (full replace) alongside PATCH (partial
// update), per the endpoint lists given — Fashion is the one exception,
// it only has PATCH.
const CATEGORIES_WITH_PUT = new Set([
  "books",
  "home",
  "beauty",
  "electronics",
  "sports",
  "appliances",
  "toys",
  "stationery",
  "musicalinstruments",
  "healthcare",
  "groceries",
  "artscrafts",
  "furniture",
  "fashion"
]);

export function hasReplaceEndpoint(categoryKey: string): boolean {
  return CATEGORIES_WITH_PUT.has(categoryKey);
}

// Most categories use "imageUrls"; these two are exceptions per the real
// backend field lists.
const IMAGE_FIELD_NAME: Record<string, string> = {
  electronics: "images",
  books: "coverImages",
};

/** Exact request body shape for POST /electronics/create (and PATCH for
 * updates). category/stock/sellingPrice/images come from the generic
 * product fields; everything else is category-specific. */
export interface ElectronicsPayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  modelNumber?: string;
  description: string;
  specifications?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  images: string[];
}

/** Exact request body shape for POST /books/create (and PATCH for
 * updates). Books has no productName/productDescription — title and
 * titleDescription are separate fields instead. */
export interface BooksPayload {
  vendorId: string;
  title: string;
  bookType?: string;
  titleDescription: string;
  authorName?: string;
  publisher?: string;
  publicationDate?: string;
  edition?: string;
  language?: string;
  pages?: number | string;
  format?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  coverImages: string[];
}

/** Exact request body shape for POST /fashion/create (and PATCH for
 * updates). */
export interface FashionPayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  subCategory?: string;
  productDescription: string;
  material?: string;
  fabric?: string;
  pattern?: string;
  fitType?: string;
  occasion?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  sizes?: string;
  sizeChart?: string;
  colors?: string;
  imageUrls: string[];
}

export interface AppliancesPayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  subCategory?: string;
  productDescription: string;
  modelNumber?: string;
  color?: string;
  warranty?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  imageUrls: string[];
}

export interface ArtsCraftsPayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  subCategory?: string;
  productDescription: string;
  material?: string;
  color?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  status?: string;
  imageUrls: string[];
}

export interface BeautyPayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  subCategory?: string;
  productDescription: string;
  quantity?: string;
  skinType?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  imageUrls: string[];
}

export interface FurniturePayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  productDescription: string;
  material?: string;
  color?: string;
  finishType?: string;
  seatingCapacity?: string;
  lengthCm?: number | string;
  widthCm?: number | string;
  heightCm?: number | string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  imageUrls: string[];
}

export interface GroceriesPayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  subCategory?: string;
  productDescription: string;
  unit?: string;
  quantity?: string;
  expiryDate?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  imageUrls: string[];
}

export interface HealthcarePayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  subCategory?: string;
  productDescription: string;
  manufacturer?: string;
  expiryDate?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  imageUrls: string[];
}

/** Home is the one category with no brandName field, per the real
 * backend field list. */
export interface HomePayload {
  vendorId: string;
  productName: string;
  category: string;
  subCategory?: string;
  productDescription: string;
  material?: string;
  color?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  imageUrls: string[];
}

export interface MusicalInstrumentsPayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  subCategory?: string;
  productDescription: string;
  material?: string;
  color?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  status?: string;
  imageUrls: string[];
}

export interface SportsPayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  subCategory?: string;
  productDescription: string;
  material?: string;
  color?: string;
  size?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  status?: string;
  imageUrls: string[];
}

export interface StationeryPayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  subCategory?: string;
  productDescription: string;
  material?: string;
  color?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  status?: string;
  imageUrls: string[];
}

export interface ToysPayload {
  vendorId: string;
  productName: string;
  brandName?: string;
  category: string;
  subCategory?: string;
  productDescription: string;
  ageGroup?: string;
  gender?: string;
  material?: string;
  mrp?: number | string;
  sellingPrice: number;
  discountPercentage?: number | string;
  stock: number;
  lowStockLimit?: number | string;
  criticalStockLimit?: number | string;
  status?: string;
  imageUrls: string[];
}

type AnyCategoryPayload =
  | ElectronicsPayload
  | BooksPayload
  | FashionPayload
  | AppliancesPayload
  | ArtsCraftsPayload
  | BeautyPayload
  | FurniturePayload
  | GroceriesPayload
  | HealthcarePayload
  | HomePayload
  | MusicalInstrumentsPayload
  | SportsPayload
  | StationeryPayload
  | ToysPayload
  | Record<string, unknown>;

/** Maps our generic product shape (title/description/price/stock/images
 * + the category-specific `attributes` bag, which already uses the real
 * backend field names — see data/vendorProductAttributes.ts) into the
 * exact request body each category's real endpoint expects. */
export function buildCreatePayload(product: {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  attributes: Record<string, string>;
  vendorId: string;
}): AnyCategoryPayload {
  const imageField = IMAGE_FIELD_NAME[product.category] ?? "imageUrls";
  const a = product.attributes;

  switch (product.category) {
    case "books": {
      // Real field list: title AND titleDescription are separate fields
      // here — title is the book's name, titleDescription is its
      // description text.
      const payload: BooksPayload = {
        vendorId: product.vendorId,
        title: product.title,
        titleDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        coverImages: product.images,
      };
      return payload;
    }
    case "electronics": {
      // Real field list uses "description", not "productDescription".
      const payload: ElectronicsPayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        description: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        images: product.images,
      };
      return payload;
    }
    case "fashion": {
      const payload: FashionPayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    case "appliances": {
      const payload: AppliancesPayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    case "artscrafts": {
      const payload: ArtsCraftsPayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    case "beauty": {
      const payload: BeautyPayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    case "furniture": {
      const payload: FurniturePayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    case "groceries": {
      const payload: GroceriesPayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    case "healthcare": {
      const payload: HealthcarePayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    case "home": {
      // No brandName for Home, per the real backend field list.
      const payload: HomePayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    case "musicalinstruments": {
      const payload: MusicalInstrumentsPayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    case "sports": {
      const payload: SportsPayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    case "stationery": {
      const payload: StationeryPayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    case "toys": {
      const payload: ToysPayload = {
        vendorId: product.vendorId,
        productName: product.title,
        category: product.category,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        imageUrls: product.images,
      };
      return payload;
    }
    default:
      return {
        vendorId: product.vendorId,
        productName: product.title,
        productDescription: product.description,
        sellingPrice: product.price,
        stock: product.stock,
        ...a,
        [imageField]: product.images,
      };
  }
}

export function buildUpdatePayload(product: {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  attributes: Record<string, string>;
  vendorId: string;
}): AnyCategoryPayload {
  // Same shape as create — PATCH accepts a partial version of the same
  // fields on every one of these endpoints.
  return buildCreatePayload(product);
}

export const vendorProductApi = {
  create: async (
    categoryKey: string,
    data: AnyCategoryPayload
  ) => {
    const endpoint = getCategoryEndpoint(categoryKey);
    if (!endpoint) {
      throw new Error(`No product API is set up yet for this category ("${categoryKey}").`);
    }
    const response = await vendorApiClient.post(`/${endpoint}/create`, data);
    return response.data;
  },

  list: async (categoryKey: string) => {
    const endpoint = getCategoryEndpoint(categoryKey);
    if (!endpoint) return { products: [] };
    const response = await vendorApiClient.get(`/${endpoint}`);
    return response.data;
  },

  getOne: async (categoryKey: string, id: string) => {
    const endpoint = getCategoryEndpoint(categoryKey);
    if (!endpoint) throw new Error(`No product API is set up yet for this category ("${categoryKey}").`);
    const response = await vendorApiClient.get(`/${endpoint}/${id}`);
    return response.data;
  },

  update: async (
    categoryKey: string,
    id: string,
    data: AnyCategoryPayload
  ) => {
    const endpoint = getCategoryEndpoint(categoryKey);
    if (!endpoint) throw new Error(`No product API is set up yet for this category ("${categoryKey}").`);
    // PATCH is supported by every category in the list and is the right
    // verb for a partial update — this is what edits use by default.
    const response = await vendorApiClient.patch(`/${endpoint}/${id}`, data);
    return response.data;
  },

  /** PUT — full record replace. Only available for categories where the
   * real backend exposes it (see CATEGORIES_WITH_PUT above); Fashion is
   * the one category that only has PATCH, no PUT. */
  replace: async (
    categoryKey: string,
    id: string,
    data: AnyCategoryPayload
  ) => {
    const endpoint = getCategoryEndpoint(categoryKey);
    if (!endpoint) throw new Error(`No product API is set up yet for this category ("${categoryKey}").`);
    if (!hasReplaceEndpoint(categoryKey)) {
      throw new Error(`This category ("${categoryKey}") doesn't have a PUT endpoint — use update() instead.`);
    }
    const response = await vendorApiClient.put(`/${endpoint}/${id}`, data);
    return response.data;
  },

  remove: async (categoryKey: string, id: string) => {
    const endpoint = getCategoryEndpoint(categoryKey);
    if (!endpoint) throw new Error(`No product API is set up yet for this category ("${categoryKey}").`);
    const response = await vendorApiClient.delete(`/${endpoint}/${id}`);
    return response.data;
  },
};