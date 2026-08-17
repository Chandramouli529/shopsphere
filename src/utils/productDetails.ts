export interface Highlight {
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  label: string;
  sub?: string;
}

export interface SpecGroup {
  title: string;
  rows: { label: string; value: string }[];
}

/** Mock product highlights/specifications/warranty/manufacturer info
 * removed — populate from a real backend (real per-product spec data)
 * once one exists. Each returns empty/generic placeholders instead of
 * fabricated details. */
export function deriveHighlights(categoryKey: string, productId: string): Highlight[] {
  return [];
}

export function deriveSpecifications(categoryKey: string, productId: string): SpecGroup[] {
  return [];
}

export function deriveWarrantyText(categoryKey: string): string {
  return "Warranty details will be shown here once available.";
}

export function deriveManufacturerInfo(): { label: string; value: string }[] {
  return [];
}
