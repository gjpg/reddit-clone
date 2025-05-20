import { useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { setLoading, setError } from './authSlice';
import { startOAuthFlow } from '../../services/auth';
import { exchangeCodeForToken } from '../../actions/authActions';

const LoginButton = () => {
  const dispatch = useDispatch();
  const didRun = useRef(false); // Prevent double execution in dev

  const handleLogin = () => {
    dispatch(setLoading(true));
    startOAuthFlow(); // redirects to Reddit
  };

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      const verifyAndExchange = async () => {
        try {
          const storedState = sessionStorage.getItem('oauth_state');
          if (!state || state !== storedState) {
            throw new Error('OAuth state mismatch');
          }

          dispatch(setLoading(true));

          await exchangeCodeForToken(code, dispatch); // everything handled here

          // Clean URL
          window.history.replaceState({}, '', '/');
        } catch (error) {
          dispatch(setError(error instanceof Error ? error.message : 'OAuth error'));
        } finally {
          dispatch(setLoading(false));
        }
      };

      verifyAndExchange();
    }
  }, [dispatch]);

  return (
    <button onClick={handleLogin}>
      Login with Reddit
    </button>
  );
};

export default LoginButton;
