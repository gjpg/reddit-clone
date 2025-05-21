import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { exchangeCodeForToken, fetchUserInfo, refreshToken } from '../../actions/authActions';
import type { User } from '../../types/user';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null; // timestamp in ms
  userData: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
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
      state.expiresAt = null;
      state.userData = null;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;

      localStorage.removeItem('reddit_access_token');
      localStorage.removeItem('reddit_refresh_token');
      localStorage.removeItem('reddit_expires_at');
    },

    setTokens(
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string | null;
        expiresAt?: number | null;
        userData?: User | null;
      }>
    ) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.expiresAt = action.payload.expiresAt ?? null;
      if (action.payload.userData) {
        state.userData = action.payload.userData;
      }
      state.isAuthenticated = !!action.payload.accessToken;
      state.loading = false;
      state.error = null;

      // Persist to localStorage
      localStorage.setItem('reddit_access_token', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('reddit_refresh_token', action.payload.refreshToken);
      }
      if (action.payload.expiresAt) {
        localStorage.setItem('reddit_expires_at', action.payload.expiresAt.toString());
      }
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
      // Exchange Token
      .addCase(exchangeCodeForToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exchangeCodeForToken.fulfilled, (state, action) => {
        const { access_token, refresh_token, expires_in } = action.payload;

        const expiresAt = expires_in ? Date.now() + expires_in * 1000 : null;
        state.accessToken = access_token;
        state.refreshToken = refresh_token ?? null;
        state.expiresAt = expiresAt;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;

        localStorage.setItem('reddit_access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('reddit_refresh_token', refresh_token);
        }
        if (expiresAt) {
          localStorage.setItem('reddit_expires_at', expiresAt.toString());
        }
      })
      .addCase(exchangeCodeForToken.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to authenticate';
        state.isAuthenticated = false;
      })

      // Fetch User Info
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
      })

      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        const { access_token, refresh_token, expires_in } = action.payload;
        const expiresAt = expires_in ? Date.now() + expires_in * 1000 : null;

        state.accessToken = access_token;
        state.refreshToken = refresh_token ?? state.refreshToken;
        state.expiresAt = expiresAt ?? state.expiresAt;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;

        localStorage.setItem('reddit_access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('reddit_refresh_token', refresh_token);
        }
        if (expiresAt) {
          localStorage.setItem('reddit_expires_at', expiresAt.toString());
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.expiresAt = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to refresh token';

        localStorage.removeItem('reddit_access_token');
        localStorage.removeItem('reddit_refresh_token');
        localStorage.removeItem('reddit_expires_at');
      });
  },
});

// Actions
export const { logout, setTokens, setError, setLoading } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;
export const selectUser = (state: { auth: AuthState }) => state.auth.userData;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
