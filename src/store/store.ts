import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/auth/authSlice';
import subredditReducer from './subreddit/subredditSlice';
import postsReducer from './posts/postsSlice'; 
import userReducer from './user/userSlice'; 


export const store = configureStore({
  reducer: {
    auth: authReducer,
     posts: postsReducer, 
    subreddit: subredditReducer,
    user: userReducer
  },
});

// Infer the `RootState` type from the store itself
export type RootState = ReturnType<typeof store.getState>;

// Optional: Export AppDispatch type for use with dispatch
export type AppDispatch = typeof store.dispatch;
