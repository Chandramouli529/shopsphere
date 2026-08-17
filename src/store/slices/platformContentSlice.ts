import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HERO_SLIDES, type HeroSlide } from "@/data/hero";

interface PlatformContentState {
  /** Home page hero banners — seeded from data/hero.ts, then admin-editable.
   * The customer HeroSlider reads from here, so admin changes actually
   * show up on Home, not just in this admin screen. */
  banners: HeroSlide[];
}

const initialState: PlatformContentState = {
  banners: HERO_SLIDES,
};

const platformContentSlice = createSlice({
  name: "platformContent",
  initialState,
  reducers: {
    addBanner(state, action: PayloadAction<Omit<HeroSlide, "id">>) {
      state.banners.push({ ...action.payload, id: "h_" + Date.now() });
    },
    removeBanner(state, action: PayloadAction<string>) {
      state.banners = state.banners.filter((b) => b.id !== action.payload);
    },
  },
});

export const { addBanner, removeBanner } = platformContentSlice.actions;
export default platformContentSlice.reducer;
