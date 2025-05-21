import { createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = 'http://localhost:3001/api';

export const fetchUserInfo = createAsyncThunk('user/fetchUserInfo', async (token: string, thunkAPI) => {
  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to fetch user info');
  }
});

export const fetchUserPosts = createAsyncThunk('user/fetchUserPosts', async (token: string, thunkAPI) => {
  try {
    const res = await fetch(`${API_BASE}/user/posts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data.posts;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to fetch user posts');
  }
});

export const fetchUserComments = createAsyncThunk('user/fetchUserComments', async (token: string, thunkAPI) => {
  try {
    const res = await fetch(`${API_BASE}/user/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data.comments;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to fetch user comments');
  }
});
