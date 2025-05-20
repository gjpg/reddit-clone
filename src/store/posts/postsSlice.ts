// src/store/posts/postsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface Post {
  id: string;
  title: string;
  author: string;
  url: string;
  subreddit_name_prefixed: string;
}

interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk<
  Post[],
  string,
  { rejectValue: string }
>('posts/fetchPosts', async (token, thunkAPI) => {
  try {
    const res = await fetch('http://localhost:3001/api/posts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return thunkAPI.rejectWithValue(errorData.error || 'Failed to fetch posts');
    }

    const data = await res.json();
    return data.posts;  // assuming backend returns { posts: Post[] }
  } catch {
    return thunkAPI.rejectWithValue('Network error');
  }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPosts(state) {
      state.posts = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch posts';
        state.loading = false;
      });
  },
});

export const { clearPosts } = postsSlice.actions;

export const selectPosts = (state: RootState) => state.posts.posts;
export const selectPostsLoading = (state: RootState) => state.posts.loading;
export const selectPostsError = (state: RootState) => state.posts.error;

export default postsSlice.reducer;
