import { createSlice } from '@reduxjs/toolkit';
import { fetchUserInfo, fetchUserActivity } from '../../actions/userActions';
import type { RedditAPIUser, Post, UserComment } from '../../types';

interface UserState {
  info: RedditAPIUser | null;
  posts: Post[];
  comments: UserComment[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  info: null,
  posts: [],
  comments: [],
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData(state) {
      state.info = null;
      state.posts = [];
      state.comments = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Info
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.info = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch user info';
        state.loading = false;
      })

      // Fetch User Activity (posts + comments)
      .addCase(fetchUserActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.posts = action.payload.posts;
        state.comments = action.payload.comments;
        state.loading = false;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch user activity';
        state.loading = false;
      });
  }
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer;
