import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpened: false,
  isLargeScreen: false, // Track if we're on a large screen
  lastToggleTime: 0, // Track last toggle time to prevent rapid toggling
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      // Prevent multiple rapid toggles (within 200ms)
      const now = Date.now();
      if (now - state.lastToggleTime < 200) {
        return;
      }

      state.isOpened = !state.isOpened;
      state.lastToggleTime = now;
    },
    setIsLargeScreen: (state, action) => {
      state.isLargeScreen = action.payload;
    },
    // Explicit open/close actions for more direct control
    openSidebar: (state) => {
      if (!state.isOpened) {
        state.isOpened = true;
        state.lastToggleTime = Date.now();
      }
    },
    closeSidebar: (state) => {
      if (state.isOpened) {
        state.isOpened = false;
        state.lastToggleTime = Date.now();
      }
    },
  },
});

export const { toggleSidebar, setIsLargeScreen, openSidebar, closeSidebar } =
  sidebarSlice.actions;

export default sidebarSlice.reducer;
