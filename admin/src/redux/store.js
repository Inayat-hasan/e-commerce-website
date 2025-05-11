import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./reducers/sidebar/sidebarReducer";
import authReducer from "./reducers/authentication/authReducer";

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    auth: authReducer,
  },
});

export default store;
