import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { exchangeCodeForToken, fetchUserInfo } from '../../actions/authActions';
import type { User } from '../../types/user';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  userData: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  userData: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.expiresIn = null;
      state.userData = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
    },
    setCredentials(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string | null;
        expiresIn?: number | null;
        userData?: User | null;
      }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.expiresIn = action.payload.expiresIn ?? null;
      if (action.payload.userData) {
        state.userData = action.payload.userData;
      }
      state.isAuthenticated = !!action.payload.accessToken;
      state.loading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
      if (action.payload === true) {
        state.error = null;
      }
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(exchangeCodeForToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        exchangeCodeForToken.fulfilled,
        (state, action: PayloadAction<{ access_token: string; refresh_token?: string; expires_in?: number }>) => {
          state.accessToken = action.payload.access_token;
          state.refreshToken = action.payload.refresh_token ?? null;
          state.expiresIn = action.payload.expires_in ?? null;
          state.loading = false;
          state.error = null;
          state.isAuthenticated = true;
        }
      )
      .addCase(exchangeCodeForToken.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to authenticate';
        state.isAuthenticated = false;
      })
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action: PayloadAction<User>) => {
        state.userData = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch user info';
      });
  },
});

// Action creators
export const { logout, setCredentials, setError, setLoading } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;

export default authSlice.reducer;