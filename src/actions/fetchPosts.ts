import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Post } from '../types';

interface FetchPostsArgs {
  subreddit?: string;
  sort?: string; // e.g., 'hot', etc.
  timespan?: 'day' | 'week' | 'month' | 'year' | 'all';  // Added timespan here
}

export const fetchPosts = createAsyncThunk<Post[], FetchPostsArgs>(
  'posts/fetchPosts',
  async ({ subreddit, sort = 'hot', timespan }, thunkAPI) => {
    try {
      const token = localStorage.getItem('reddit_access_token');
      if (!token) {
        return thunkAPI.rejectWithValue({ error: 'Missing access token' });
      }

      let url = `http://localhost:3001/api/posts`;
      const params = new URLSearchParams();

      if (subreddit) {
        params.append('subreddit', subreddit);
      }
      if (sort && sort !== 'hot') {
        params.append('sort', sort);
      }

      // Pass timespan only if sorting by top
      if (sort === 'top' && timespan) {
        params.append('t', timespan);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

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
  }
);
