// Key names are kept stable (blue, blueDark, yellow, orange1/2, etc.) for
// every screen/component that still imports the static `colors` object
// directly — that's the "default look" when no theme-aware component reads
// from useAppTheme() instead.
//
// blue / blueDark / yellow are NOT hardcoded here anymore. They're pulled
// from THEMES[DEFAULT_THEME_KEY] in theme/themes.ts, which is the same data
// the in-app theme picker (Account > App Theme) reads from. That keeps this
// file and the theme picker's "ShopSphere Black" preset from ever drifting
// out of sync — change the default theme's colors in one place
// (theme/themes.ts) and both the static fallback and the picker update
// together.

import { THEMES, DEFAULT_THEME_KEY } from "./themes";

const defaultTheme = THEMES[DEFAULT_THEME_KEY];

export const colors = {
  // Primary brand / accent — sourced from the default theme preset.
  blue: defaultTheme.primary,
  blueDark: defaultTheme.primaryDark,

  // Core accent — also sourced from the default theme preset.
  yellow: defaultTheme.secondary,

  // Dark neutral, used for the splash-screen gradient's deepest stop.
  navy: "#1A1A1A",

  // Warm gradient pair for the Home header (golden yellow fading to a pale
  // cream so it still reads as a soft highlight band).
  orange1: "#FFC93C",
  orange2: "#FFF1B8",

  // Kept for semantic "success" states (delivered orders, free delivery,
  // in-stock badges) — a functional color, not a theme accent, so it's
  // fixed regardless of which theme is selected.
  green: "#1C8A3C",

  ink: "#111111",
  inkSoft: "#5f6368",
  line: "#e8e8e8",
  bg: "#f4f4f2",
  white: "#ffffff",

  // Soft background for banners/cards.
  card: "#FFF8E1",

  danger: "#E74C3C",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 999,
};

export const typography = {
  h1: { fontSize: 22, fontWeight: "800" as const },
  h2: { fontSize: 19, fontWeight: "700" as const },
  h3: { fontSize: 16, fontWeight: "700" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  caption: { fontSize: 12, fontWeight: "500" as const },
  small: { fontSize: 11, fontWeight: "600" as const },
};
