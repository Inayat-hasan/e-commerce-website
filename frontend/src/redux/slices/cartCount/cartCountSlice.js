import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  count: null,
};

const cartCountSlice = createSlice({
  name: "cartCount",
  initialState,
  reducers: {
    setCartCount: (state, action) => {
      state.count = action.payload;
    },
    resetCartCount: (state) => {
      state.count = null;
    },
  },
});

export const { setCartCount, resetCartCount } = cartCountSlice.actions;
export default cartCountSlice.reducer;
