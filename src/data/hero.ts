export interface HeroSlide {
  id: string;
  brand: string;
  title: string;
  subtitle: string;
  price: string;
  colors: [string, string];
}

// Starter promotional banners — generic marketing copy, not fabricated
// product/business data, so this doesn't reintroduce the mock data that
// was deliberately removed elsewhere. Fully admin-editable/removable via
// Admin Portal > Preview Manage (platformContentSlice) — these are just
// sensible defaults so Home's hero section isn't blank on first launch.
export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "h_starter_1",
    brand: "✦ ShopSphere",
    title: "Welcome to ShopSphere",
    subtitle: "Shop from trusted vendors, all in one place",
    price: "Explore what's new today",
    colors: ["#f5f5f5", "#e8e8e8"],
  },
  {
    id: "h_starter_2",
    brand: "⚡ For Vendors",
    title: "Sell on ShopSphere",
    subtitle: "Reach customers across every category",
    price: "Get started as a vendor",
    colors: ["#fff3cf", "#ffe1a8"],
  },
  {
    id: "h_starter_3",
    brand: "🎁 Offers",
    title: "Check today's deals",
    subtitle: "New offers added by our vendors regularly",
    price: "Browse the Flash Sale below",
    colors: ["#ffe4ec", "#ffd0dd"],
  },
];