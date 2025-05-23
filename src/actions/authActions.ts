import { createAsyncThunk } from '@reduxjs/toolkit';
import type { User,  RedditAPIUser} from '../types';
import type { RootState } from '../store/store';
import { mapRedditUserToAppUser } from '../utils/mappers';

const API_BASE = 'http://localhost:3001/api';

export const exchangeCodeForToken = createAsyncThunk<
  { access_token: string; refresh_token?: string; expires_in?: number },
  string,
  { rejectValue: string }
>('auth/exchangeCodeForToken', async (code, thunkAPI) => {
  try {
    const response = await fetch(`${API_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return thunkAPI.rejectWithValue(errorData.error || 'Failed to exchange token');
    }

    const responseData = await response.json();
    const { access_token, refresh_token, expires_in } = responseData.data;

    localStorage.setItem('reddit_access_token', access_token);
    if (refresh_token) {
      localStorage.setItem('reddit_refresh_token', refresh_token);
    }

    if (expires_in) {
      const expiresAt = Date.now() + expires_in * 1000;
      localStorage.setItem('reddit_expires_at', expiresAt.toString());
    }

    return { access_token, refresh_token, expires_in };
  } catch (error) {
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
  }
});

// Fetch Reddit user info
export const fetchUserInfo = createAsyncThunk<User, void, { state: RootState }>(
  'auth/fetchUserInfo',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const accessToken = state.auth.accessToken;

      const response = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const redditUser: RedditAPIUser = await response.json();

      const user: User = mapRedditUserToAppUser(redditUser); // ⬅️ Use it here

      return user;
    } catch (err) {
      return thunkAPI.rejectWithValue('Failed to fetch user info');
    }
  }
);

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('http://localhost:3001/api/refresh_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return await response.json(); // { access_token, expires_in, ... }
}
export const refreshToken = createAsyncThunk<
  { access_token: string; expires_in?: number; refresh_token?: string }, // success payload
  string, // refreshToken arg
  { rejectValue: string }
>('auth/refreshToken', async (refreshToken, thunkAPI) => {
  try {
    const data = await refreshAccessToken(refreshToken);

    localStorage.setItem('reddit_access_token', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('reddit_refresh_token', data.refresh_token);
    }

    const expiresAt = Date.now() + (data.expires_in ?? 3600) * 1000;
    localStorage.setItem('reddit_expires_at', expiresAt.toString()); // ✅ Save here too

    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
  }
});
