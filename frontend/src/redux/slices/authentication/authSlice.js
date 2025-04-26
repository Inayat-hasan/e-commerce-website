import { createSlice } from "@reduxjs/toolkit";
import { resetCartCount } from "../cartCount/cartCountSlice";

const initialState = {
  user: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      // We can't dispatch another action from here, we'll handle it in the component
    },
  },
});

export const { setUser, logout } = authSlice.actions;

// Custom action creator that handles both auth and cart count
export const logoutAndResetCart = () => (dispatch) => {
  dispatch(logout());
  dispatch(resetCartCount());
};

export default authSlice.reducer;
