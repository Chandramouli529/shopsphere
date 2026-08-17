/** Category-specific extra product attributes, on top of the generic
 * fields every product already has (title/productName, description/
 * productDescription, price/sellingPrice, stock, category, images/
 * imageUrls — all handled by the base product form already, so they're
 * deliberately excluded here). Also excluded: vendorId, cloudinaryPublicIds
 * (backend/internal, not vendor-entered).
 *
 * These match the real backend field lists per category exactly. Fields
 * not yet confirmed for "Mobiles" — selecting it shows only the generic
 * form until that schema is provided. */

export type AttributeFieldType = "text" | "number" | "select";

export interface AttributeField {
  key: string;
  label: string;
  type: AttributeFieldType;
  placeholder?: string;
  options?: string[]; // only for type "select"
}

const STOCK_STATUS_FIELD: AttributeField = {
  key: "stockStatus",
  label: "Stock Status",
  type: "select",
  options: ["In Stock", "Low Stock", "Out of Stock"],
};
const STATUS_FIELD: AttributeField = {
  key: "status",
  label: "Product Status",
  type: "select",
  options: ["Active", "Inactive", "Draft"],
};
const MRP_FIELD: AttributeField = { key: "mrp", label: "MRP (₹)", type: "number", placeholder: "Original price before discount" };
const DISCOUNT_FIELD: AttributeField = { key: "discountPercentage", label: "Discount (%)", type: "number" };
const LOW_STOCK_FIELD: AttributeField = { key: "lowStockLimit", label: "Low Stock Limit", type: "number", placeholder: "e.g. 10" };
const CRITICAL_STOCK_FIELD: AttributeField = { key: "criticalStockLimit", label: "Critical Stock Limit", type: "number", placeholder: "e.g. 3" };
const BRAND_FIELD: AttributeField = { key: "brandName", label: "Brand Name", type: "text" };
const SUBCATEGORY_FIELD: AttributeField = { key: "subCategory", label: "Sub Category", type: "text" };
const MATERIAL_FIELD: AttributeField = { key: "material", label: "Material", type: "text" };

export const CATEGORY_ATTRIBUTES: Record<string, AttributeField[]> = {
  beauty: [
    BRAND_FIELD,
    SUBCATEGORY_FIELD,
    { key: "quantity", label: "Quantity", type: "text", placeholder: "e.g. 100ml, 50g" },
    { key: "skinType", label: "Skin Type", type: "text", placeholder: "e.g. Oily, Dry, Combination" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
    STOCK_STATUS_FIELD,
  ],
  electronics: [
    BRAND_FIELD,
    { key: "modelNumber", label: "Model Number", type: "text" },
    { key: "specifications", label: "Specifications", type: "text", placeholder: "Key specs, one per line or comma-separated" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    STOCK_STATUS_FIELD,
  ],
  fashion: [
    BRAND_FIELD,
    SUBCATEGORY_FIELD,
    MATERIAL_FIELD,
    { key: "fabric", label: "Fabric", type: "text", placeholder: "e.g. Denim" },
    { key: "pattern", label: "Pattern", type: "text", placeholder: "e.g. Striped, Solid" },
    { key: "fitType", label: "Fit Type", type: "text", placeholder: "e.g. Slim Fit, Regular" },
    { key: "occasion", label: "Occasion", type: "text", placeholder: "e.g. Casual, Formal" },
    { key: "sizes", label: "Available Sizes", type: "text", placeholder: "e.g. S, M, L, XL (comma-separated)" },
    { key: "sizeChart", label: "Size Chart", type: "text", placeholder: "URL or measurement notes" },
    { key: "colors", label: "Available Colors", type: "text", placeholder: "e.g. Red, Black, Navy (comma-separated)" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
    STOCK_STATUS_FIELD,
  ],
  groceries: [
    BRAND_FIELD,
    SUBCATEGORY_FIELD,
    { key: "unit", label: "Unit", type: "text", placeholder: "e.g. kg, litre, pack of 6" },
    { key: "expiryDate", label: "Expiry Date", type: "text", placeholder: "DD/MM/YYYY" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
  ],
  healthcare: [
    BRAND_FIELD,
    SUBCATEGORY_FIELD,
    { key: "manufacturer", label: "Manufacturer", type: "text" },
    { key: "expiryDate", label: "Expiry Date", type: "text", placeholder: "DD/MM/YYYY" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
  ],
  home: [
    // No brandName for Home, per the real backend field list.
    SUBCATEGORY_FIELD,
    MATERIAL_FIELD,
    { key: "color", label: "Color", type: "text" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
  ],
  musicalinstruments: [
    BRAND_FIELD,
    SUBCATEGORY_FIELD,
    MATERIAL_FIELD,
    { key: "color", label: "Color", type: "text" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
    STATUS_FIELD,
  ],
  sports: [
    BRAND_FIELD,
    SUBCATEGORY_FIELD,
    MATERIAL_FIELD,
    { key: "color", label: "Color", type: "text" },
    { key: "size", label: "Size", type: "text" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
    STATUS_FIELD,
  ],
  stationery: [
    BRAND_FIELD,
    SUBCATEGORY_FIELD,
    { key: "ageGroup", label: "Age Group", type: "text", placeholder: "e.g. 5-8 years" },
    { key: "gender", label: "Gender", type: "select", options: ["Men", "Women", "Unisex", "Kids"] },
    MATERIAL_FIELD,
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
    STATUS_FIELD,
  ],
  toys: [
    BRAND_FIELD,
    SUBCATEGORY_FIELD,
    { key: "modelNumber", label: "Model Number", type: "text" },
    { key: "color", label: "Color", type: "text" },
    { key: "warranty", label: "Warranty", type: "text", placeholder: "e.g. 6 months" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
  ],
  appliances: [
    BRAND_FIELD,
    SUBCATEGORY_FIELD,
    MATERIAL_FIELD,
    { key: "color", label: "Color", type: "text" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
    STATUS_FIELD,
  ],
  artscrafts: [
    BRAND_FIELD,
    SUBCATEGORY_FIELD,
    MATERIAL_FIELD,
    { key: "color", label: "Color", type: "text" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
    STATUS_FIELD,
  ],
  furniture: [
    BRAND_FIELD,
    MATERIAL_FIELD,
    { key: "color", label: "Color", type: "text" },
    { key: "finishType", label: "Finish Type", type: "text", placeholder: "e.g. Matte, Glossy, Natural Wood" },
    { key: "seatingCapacity", label: "Seating Capacity", type: "text", placeholder: "e.g. 3 Seater" },
    { key: "lengthCm", label: "Length (cm)", type: "number" },
    { key: "widthCm", label: "Width (cm)", type: "number" },
    { key: "heightCm", label: "Height (cm)", type: "number" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    LOW_STOCK_FIELD,
    CRITICAL_STOCK_FIELD,
    STOCK_STATUS_FIELD,
  ],
  books: [
    { key: "bookType", label: "Book Type", type: "text", placeholder: "e.g. Paperback, Hardcover, E-book" },
    { key: "authorName", label: "Author Name", type: "text" },
    { key: "publisher", label: "Publisher", type: "text" },
    { key: "publicationDate", label: "Publication Date", type: "text", placeholder: "DD/MM/YYYY" },
    { key: "edition", label: "Edition", type: "text" },
    { key: "language", label: "Language", type: "text" },
    { key: "pages", label: "Pages", type: "number" },
    { key: "format", label: "Format", type: "text", placeholder: "e.g. Paperback, Hardcover" },
    MRP_FIELD,
    DISCOUNT_FIELD,
    STOCK_STATUS_FIELD,
    STATUS_FIELD,
  ],
  // "mobiles" is merged into "electronics" — no separate schema.
};

export function getCategoryAttributes(categoryKey: string): AttributeField[] {
  return CATEGORY_ATTRIBUTES[categoryKey] ?? [];
}