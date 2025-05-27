import { createSlice } from '@reduxjs/toolkit';
import { fetchUserInfo } from '../../actions/userActions';
import type { RedditAPIUser } from '../../types';

interface UserState {
  info: RedditAPIUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  info: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData(state) {
      state.info = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer;
