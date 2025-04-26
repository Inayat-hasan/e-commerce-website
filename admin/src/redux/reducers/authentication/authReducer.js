import { createSlice } from "@reduxjs/toolkit";

const authReducer = createSlice({
    name: "auth",
    initialState: {
        user: null,
        isLoggedIn: false,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isLoggedIn = !!action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isLoggedIn = false;
        },
    },
});

export const { setUser, logout } = authReducer.actions;
export default authReducer.reducer;
