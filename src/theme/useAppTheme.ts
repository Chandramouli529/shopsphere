import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { THEMES, DEFAULT_THEME_KEY, type ThemePreset } from "@/theme/themes";

/** Returns the currently active theme preset (primary/primaryDark/secondary).
 * Use this instead of the static `colors.blue` wherever an element should
 * follow the user's chosen accent color. */
export function useAppTheme(): ThemePreset {
  const themeKey = useSelector((state: RootState) => state.theme.themeKey);
  return THEMES[themeKey] ?? THEMES[DEFAULT_THEME_KEY];
}
