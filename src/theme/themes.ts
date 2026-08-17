export interface ThemePreset {
  key: string;
  name: string;
  /** Primary accent — buttons, active states, links. */
  primary: string;
  /** Darker variant of primary, used for gradients/pressed states. */
  primaryDark: string;
  /** Secondary highlight color — badges, splash badge, small accents. */
  secondary: string;
}

export const THEMES: Record<string, ThemePreset> = {
  classic: {
    key: "classic",
    name: "ShopSphere Black",
    primary: "#111111",
    primaryDark: "#000000",
    secondary: "#FFD400",
  },
  ocean: {
    key: "ocean",
    name: "Ocean Blue",
    primary: "#2874F0",
    primaryDark: "#1c5bc9",
    secondary: "#8FD3FF",
  },
  emerald: {
    key: "emerald",
    name: "Emerald Green",
    primary: "#0E9F6E",
    primaryDark: "#0B7A54",
    secondary: "#B7F7D8",
  },
  sunset: {
    key: "sunset",
    name: "Sunset Orange",
    primary: "#FF7A29",
    primaryDark: "#E85D04",
    secondary: "#FFE1B8",
  },
  royal: {
    key: "royal",
    name: "Royal Purple",
    primary: "#7C3AED",
    primaryDark: "#5B21B6",
    secondary: "#E9D5FF",
  },
  rose: {
    key: "rose",
    name: "Rose Pink",
    primary: "#E11D74",
    primaryDark: "#B91361",
    secondary: "#FFD1E4",
  },
};

export const DEFAULT_THEME_KEY = "classic";
