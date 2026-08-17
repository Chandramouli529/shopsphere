import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_THEME_KEY } from "@/theme/themes";

interface ThemeState {
  themeKey: string;
}

const initialState: ThemeState = {
  themeKey: DEFAULT_THEME_KEY,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeKey(state, action: PayloadAction<string>) {
      state.themeKey = action.payload;
    },
  },
});

export const { setThemeKey } = themeSlice.actions;
export default themeSlice.reducer;
