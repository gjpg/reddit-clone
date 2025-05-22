import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Post } from '../types';

export const fetchPosts = createAsyncThunk<Post[], string>('posts/fetchPosts', async (sort = 'hot', thunkAPI) => {
  try {
    const token = localStorage.getItem('reddit_access_token');
    if (!token) {
      return thunkAPI.rejectWithValue({ error: 'Missing access token' });
    }

    const url = `http://localhost:3001/api/posts${sort && sort !== 'hot' ? `?sort=${sort}` : ''}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return thunkAPI.rejectWithValue(errorData);
    }

    const data = await response.json();
    return data.posts as Post[];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return thunkAPI.rejectWithValue({ error: errorMessage });
  }
});
