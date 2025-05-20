import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  current: 'Front Page'
};

const subredditSlice = createSlice({
  name: 'subreddit',
  initialState,
  reducers: {
    setSubreddit: (state, action) => {
      state.current = action.payload;
    }
  }
});

export const { setSubreddit } = subredditSlice.actions;
export default subredditSlice.reducer;