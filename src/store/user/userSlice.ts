import { createSlice } from '@reduxjs/toolkit';
import { fetchUserInfo, fetchUserPosts, fetchUserComments } from '../../actions/userActions';

interface UserState {
  info: any; // or a more specific type
  posts: any[]; // or a Post[] if defined
  comments: any[]; // or a Comment[] if defined
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
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.info = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to fetch user info';
        state.loading = false;
      })

      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
      })
      .addCase(fetchUserComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      });
  }
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer;
