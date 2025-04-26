import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authentication/authReducer.js";
import sidebarReducer from "./reducers/sidebar/sidebarReducer.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    sidebar: sidebarReducer,
  },
});

export default store;
