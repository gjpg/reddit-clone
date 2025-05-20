import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '../store/auth/authSlice';
import subredditReducer from './subreddit/subredditSlice';

import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import { persistReducer, persistStore } from 'redux-persist';
import postsReducer from './posts/postsSlice';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // only persist auth slice (optional)
};

const rootReducer = combineReducers({
  auth: authReducer,
  subreddit: subredditReducer,
  posts: postsReducer, // add this line
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // disable for redux-persist compatibility
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
