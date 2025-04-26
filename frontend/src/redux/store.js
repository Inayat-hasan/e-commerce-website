import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authentication/authSlice.js";
import sidebarSlice from "./slices/sidebar/sidebarSlice.js";
import cartCountReducer from "./slices/cartCount/cartCountSlice.js";

const store = configureStore({
  reducer: {
    auth: authSlice,
    sidebar: sidebarSlice,
    cartCount: cartCountReducer,
  },
});

export default store;
