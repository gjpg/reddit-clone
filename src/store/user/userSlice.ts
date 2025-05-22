import { createSlice } from '@reduxjs/toolkit';
import { fetchUserInfo, fetchUserActivity } from '../../actions/userActions';
import type { UserInfo } from '../../types';
import type { RedditItem } from '../../types/reddit';

interface UserState {
  info: UserInfo | null;
  userActivity: RedditItem[];
  loadingInfo: boolean;
  loadingActivity: boolean;
  errorInfo: string | null;
  errorActivity: string | null;
}

const initialState: UserState = {
  info: null,
  userActivity: [],
  loadingInfo: false,
  loadingActivity: false,
  errorInfo: null,
  errorActivity: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData(state) {
      state.info = null;
      state.userActivity = [];
      state.errorInfo = null;
      state.errorActivity = null;
      state.loadingInfo = false;
      state.loadingActivity = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user info
      .addCase(fetchUserInfo.pending, (state) => {
        state.loadingInfo = true;
        state.errorInfo = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.info = action.payload;
        state.loadingInfo = false;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.errorInfo = typeof action.payload === 'string' ? action.payload : 'Failed to fetch user info';
        state.loadingInfo = false;
      })

      // Fetch combined user activity (posts + comments)
      .addCase(fetchUserActivity.pending, (state) => {
        state.loadingActivity = true;
        state.errorActivity = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.userActivity = action.payload;
        state.loadingActivity = false;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.errorActivity = typeof action.payload === 'string' ? action.payload : 'Failed to fetch user activity';
        state.loadingActivity = false;
      });
  }
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer;
