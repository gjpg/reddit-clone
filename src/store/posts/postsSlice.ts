import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Post {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  // add other fields as needed
}

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch posts from a subreddit or front page
export const fetchPosts = createAsyncThunk<Post[], string | undefined>(
  'posts/fetchPosts',
  async (subreddit) => {
    const endpoint = subreddit
      ? `https://oauth.reddit.com/r/${subreddit}/hot`
      : `https://oauth.reddit.com/hot`;

    const accessToken = localStorage.getItem('reddit_access_token');
    if (!accessToken) throw new Error('No access token available');

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    const json = await response.json();

    // Map Reddit API response to your Post type
    return json.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      author: child.data.author,
      subreddit: child.data.subreddit,
      url: child.data.url,
    }));
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPosts(state) {
      state.posts = [];
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.posts = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch posts';
        state.isLoading = false;
      });
  },
});

export const { clearPosts } = postsSlice.actions;
export default postsSlice.reducer;
