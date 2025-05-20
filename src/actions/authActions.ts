// authActions.ts
import { createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:3001/api';

// Exchange code for token
export const exchangeCodeForToken = createAsyncThunk<
  { access_token: string; refresh_token?: string; expires_in?: number }, // ✅ Success return type
  string, // ✅ Argument type
  { rejectValue: string } // ✅ Reject payload type
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

    const data = await response.json();
    localStorage.setItem('reddit_access_token', data.access_token);
    localStorage.setItem('reddit_refresh_token', data.refresh_token);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
  }
});

// Fetch Reddit user info
export const fetchUserInfo = createAsyncThunk<any, string, { rejectValue: string }>(
  'auth/fetchUserInfo',
  async (accessToken, thunkAPI) => {
    try {
      const response = await fetch('https://oauth.reddit.com/api/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData.error || 'Failed to fetch user info');
      }

      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);
