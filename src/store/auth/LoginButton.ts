import * as React from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading, setError } from './authSlice';
import { startOAuthFlow, exchangeCodeForToken } from '../../services/auth';
import { useEffect, useRef } from 'react';
import type { UserData } from './authSlice'; // Adjust the import path as needed

const LoginButton = () => {
  const dispatch = useDispatch();
  const didRun = useRef(false); // Prevent double execution in dev

  const handleLogin = () => {
    dispatch(setLoading(true));
    startOAuthFlow(); // typically redirects to OAuth provider
  };

  async function fetchUserData(token: string): Promise<UserData> {
    const res = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch user data');
    return await res.json();
  }

  // Handle OAuth redirect callback
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      const verifyAndExchange = async () => {
        try {
          dispatch(setLoading(true));

          const storedState = sessionStorage.getItem('oauth_state');
          if (!state || state !== storedState) {
            throw new Error('State mismatch');
          }

          const { access_token } = await exchangeCodeForToken(code);
          const userData = await fetchUserData(access_token);
          dispatch(setCredentials({ accessToken: access_token, userData }));

          // Clean the URL (remove query params)
          window.history.replaceState({}, '', '/');
        } catch (error) {
          let message = 'OAuth error';
          if (error instanceof Error) {
            message = error.message;
          }
          dispatch(setError(message));
        } finally {
          dispatch(setLoading(false));
        }
      };

      verifyAndExchange();
    }
  }, [dispatch]);

  return React.createElement('button', { onClick: handleLogin }, 'Login with Reddit');
};

export default LoginButton;
