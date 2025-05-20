// LoginButton.tsx
import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../hooks';
import { setCredentials, setLoading, setError } from './authSlice';
import { startOAuthFlow } from '../../services/auth';
import { exchangeCodeForToken, fetchUserInfo } from '../../actions/authActions';

const LoginButton = () => {
  const dispatch = useAppDispatch(); // ✅ typed dispatch
  const didRun = useRef(false);

  const handleLogin = () => {
    dispatch(setLoading(true));
    startOAuthFlow();
  };

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      (async () => {
        try {
          dispatch(setLoading(true));

          const storedState = sessionStorage.getItem('oauth_state');
          if (!state || state !== storedState) {
            throw new Error('State mismatch');
          }

          const tokenResponse = await dispatch(exchangeCodeForToken(code)).unwrap();
          const userInfo = await dispatch(fetchUserInfo(tokenResponse.access_token)).unwrap();

          dispatch(setCredentials({ accessToken: tokenResponse.access_token, userData: userInfo }));

          window.history.replaceState({}, '', '/');
        } catch (error) {
          dispatch(setError(error instanceof Error ? error.message : 'OAuth error'));
        } finally {
          dispatch(setLoading(false));
        }
      })();
    }
  }, [dispatch]);

  return <button onClick={handleLogin}>Login with Reddit</button>;
};

export default LoginButton;
