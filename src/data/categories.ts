import { Ionicons } from "@expo/vector-icons";

export interface CategoryDef {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  /** Pastel background for the circular sidebar avatar. */
  avatarBg: string;
}

/** "For You" is a virtual first entry (personalized feed), the rest are the
 * real product categories. Shared between the Home quick-access bar and the
 * Categories screen sidebar so both stay in sync. */
export const CATEGORIES: CategoryDef[] = [
  { key: "foryou", label: "For You", icon: "gift", avatarBg: "#f3e8ff" },
  { key: "fashion", label: "Fashion", icon: "shirt", avatarBg: "#e0f2e9" },
  { key: "mobiles", label: "Mobiles", icon: "phone-portrait", avatarBg: "#f0f0f0" },
  { key: "electronics", label: "Electronics", icon: "laptop", avatarBg: "#f5f0ea" },
  { key: "beauty", label: "Beauty", icon: "sparkles", avatarBg: "#ffe6ef" },
  { key: "home", label: "Home", icon: "home", avatarBg: "#fff2e0" },
  { key: "appliances", label: "Appliances", icon: "hardware-chip", avatarBg: "#e6f7f5" },
  { key: "toys", label: "Toys", icon: "happy", avatarBg: "#ffe9d6" },
  { key: "sports", label: "Sports", icon: "football", avatarBg: "#fff4cc" },
  { key: "stationery", label: "Stationery", icon: "pencil", avatarBg: "#e6eefc" },
  { key: "musicalinstruments", label: "Musical Instruments", icon: "musical-notes", avatarBg: "#f1e9ff" },
  { key: "healthcare", label: "Health Care", icon: "medkit", avatarBg: "#e3f6e6" },
  { key: "groceries", label: "Groceries", icon: "basket", avatarBg: "#eaf7e0" },
  { key: "artscrafts", label: "Arts & Crafts", icon: "color-palette", avatarBg: "#fdeed6" },
];

/** All real product categories, i.e. everything except "For You". Home uses
 * this to render one product section per category. */
export const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => c.key !== "foryou");
