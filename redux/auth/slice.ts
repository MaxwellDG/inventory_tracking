import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, AuthUser } from "./types";

export const initialState: AuthState = {
  user: null,
  token: null,
  refresh_token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: AuthUser | null;
        token?: string;
        refresh_token?: string;
        company_id?: number;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token || null;
      state.refresh_token = action.payload.refresh_token || null;
      state.isAuthenticated = !!action.payload.token; // Authenticated if we have a token
      state.error = null;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refresh_token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
  setLoading,
  setError,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
