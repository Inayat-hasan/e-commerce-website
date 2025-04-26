const selectUser = (state) => state.auth.user;
const selectIsLoggedIn = (state) => state.auth.isLoggedIn;

export { selectUser, selectIsLoggedIn };
