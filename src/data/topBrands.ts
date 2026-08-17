export interface TopBrand {
  name: string;
  emoji: string;
}

/** Mock brand tiles removed — they were tied to specific mock product
 * titles that no longer exist. Populate from a real backend (e.g. a
 * GET /brands endpoint) once one exists. */
export const TOP_BRANDS: TopBrand[] = [];
