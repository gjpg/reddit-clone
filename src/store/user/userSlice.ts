import { createSlice } from '@reduxjs/toolkit';
import { fetchUserInfo, fetchUserPosts, fetchUserComments } from '../../actions/userActions';
import type { UserInfo, UserPost, UserComment } from '../../types';

interface UserState {
  info: UserInfo | null;
  posts: UserPost[];
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

      // Fetch User Posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch user posts';
        state.loading = false;
      })

      // Fetch User Comments
      .addCase(fetchUserComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserComments.fulfilled, (state, action) => {
        state.comments = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserComments.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch user comments';
        state.loading = false;
      });
  }
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer;
