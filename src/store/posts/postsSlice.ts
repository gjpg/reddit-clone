import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Post } from '../../types/post';
import type { RedditPost, RedditComment } from '../../types/reddit';

interface PostsState {
  posts: Post[];
  userPosts: RedditPost[];      // user submitted posts
  userComments: RedditComment[]; // user comments
  loading: boolean;
  userActivityLoading: boolean;
  error: string | null;
  userActivityError: string | null;
}

const initialState: PostsState = {
  posts: [],
  userPosts: [],
  userComments: [],
  loading: false,
  userActivityLoading: false,
  error: null,
  userActivityError: null
};

// Frontpage posts thunk
export const fetchPosts = createAsyncThunk<Post[], string, { rejectValue: string }>(
  'posts/fetchPosts',
  async (token, thunkAPI) => {
    try {
      const res = await fetch('http://localhost:3001/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        return thunkAPI.rejectWithValue(errorData.error || 'Failed to fetch posts');
      }

      const data = await res.json();
      return data.posts; // assuming backend returns { posts: Post[] }
    } catch {
      return thunkAPI.rejectWithValue('Network error');
    }
  }
);

// User activity thunk (fetch posts and comments separately)
export const fetchUserActivity = createAsyncThunk<
  { posts: RedditPost[]; comments: RedditComment[] },
  { token: string; username: string },
  { rejectValue: string }
>('posts/fetchUserActivity', async ({ token, username }, thunkAPI) => {
  try {
    // Fetch user posts
    const postsRes = await fetch(`https://oauth.reddit.com/user/${username}/submitted`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!postsRes.ok) {
      const error = await postsRes.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user posts');
    }
    const postsData = await postsRes.json();

    // Fetch user comments
    const commentsRes = await fetch(`https://oauth.reddit.com/user/${username}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!commentsRes.ok) {
      const error = await commentsRes.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user comments');
    }
    const commentsData = await commentsRes.json();

    // Map posts
    const mappedPosts: RedditPost[] = postsData.data.children.map((post: any) => ({
      id: post.data.id,
      author: post.data.author,
      created_utc: post.data.created_utc,
      permalink: post.data.permalink,
      kind: 'post',
      title: post.data.title,
      url: post.data.url,
      subreddit_name_prefixed: post.data.subreddit_name_prefixed,
      thumbnail: post.data.thumbnail,
      score: post.data.score ?? 0
    }));

    // Map comments
    const mappedComments: RedditComment[] = commentsData.data.children.map((comment: any) => ({
      id: comment.data.id,
      author: comment.data.author,
      created_utc: comment.data.created_utc,
      permalink: comment.data.permalink,
      kind: 'comment',
      body: comment.data.body,
      subreddit_name_prefixed: comment.data.subreddit_name_prefixed,
      score: comment.data.score ?? 0
    }));

    return { posts: mappedPosts, comments: mappedComments };
  } catch {
    return thunkAPI.rejectWithValue('Failed to fetch user activity');
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
    clearUserActivity(state) {
      state.userPosts = [];
      state.userComments = [];
      state.userActivityError = null;
      state.userActivityLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // frontpage posts handlers
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
      })

      // user activity handlers
      .addCase(fetchUserActivity.pending, (state) => {
        state.userActivityLoading = true;
        state.userActivityError = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action: PayloadAction<{ posts: RedditPost[]; comments: RedditComment[] }>) => {
        state.userPosts = action.payload.posts;
        state.userComments = action.payload.comments;
        state.userActivityLoading = false;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.userActivityError = action.payload || 'Failed to fetch user activity';
        state.userActivityLoading = false;
      });
  }
});

export const { clearPosts, clearUserActivity } = postsSlice.actions;

export const selectPosts = (state: RootState) => state.posts.posts;
export const selectPostsLoading = (state: RootState) => state.posts.loading;
export const selectPostsError = (state: RootState) => state.posts.error;

export const selectUserPosts = (state: RootState) => state.posts.userPosts;
export const selectUserComments = (state: RootState) => state.posts.userComments;
export const selectUserActivityLoading = (state: RootState) => state.posts.userActivityLoading;
export const selectUserActivityError = (state: RootState) => state.posts.userActivityError;

export default postsSlice.reducer;
