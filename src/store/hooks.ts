// hooks.ts
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { refreshToken } from '../actions/authActions';
import { setTokens } from './auth/authSlice';

// Typed dispatch
export const useAppDispatch: () => AppDispatch = useDispatch;

// Typed selector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Init auth logic on app start
export const useAuthInit = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem('reddit_access_token');
    const refreshTokenValue = localStorage.getItem('reddit_refresh_token');
    const expiresAt = localStorage.getItem('reddit_expires_at');

    if (!refreshTokenValue) return;

    if (accessToken && expiresAt) {
      const expiresAtNum = parseInt(expiresAt, 10);

      if (Date.now() < expiresAtNum) {
        dispatch(
          setTokens({
            accessToken,
            refreshToken: refreshTokenValue,
            expiresAt: expiresAtNum,
          })
        );
        return;
      }
    }

    // Access token is missing or expired — refresh
    dispatch(refreshToken(refreshTokenValue));
  }, [dispatch]);
};
