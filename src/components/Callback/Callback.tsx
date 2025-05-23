import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';
import { setTokens, setError, setLoading } from '../../store/auth/authSlice';
import { exchangeCodeForToken } from '../../actions/authActions';
import { fetchUserInfo } from '../../actions/userActions';
import { useAppDispatch } from '../../store/hooks';

const Callback = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const didRun = useRef(false); // <== key to prevent double execution
  console.log('Callback component rendered');

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('Callback mounted after delay');
    }, 1000);

    return () => {
      console.log('Unmounting Callback.tsx');
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const code = searchParams.get('code');
    const returnedState = searchParams.get('state');
    const savedState = sessionStorage.getItem('oauth_state');

    if (!code || returnedState !== savedState) {
      dispatch(setError('Invalid OAuth state'));
      navigate('/');
      return;
    }

    const handleAuth = async () => {
      try {
        dispatch(setLoading(true));

        console.log('Exchanging code for token...');
        const tokenAction = await dispatch(exchangeCodeForToken(code));
        const tokenResponse = unwrapResult(tokenAction);

        console.log('Fetching current user info (for username)...');
        // Fetch username from /api/v1/me
        const meRes = await fetch('https://oauth.reddit.com/api/v1/me', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        if (!meRes.ok) {
          throw new Error('Failed to fetch current user info');
        }
        const meJson = await meRes.json();
        const username = meJson.name;
        if (!username) {
          throw new Error('Username not found in user info');
        }

        console.log('Fetching detailed user info via thunk...');
        // Now call your fetchUserInfo thunk with both token and username
        const userAction = await dispatch(fetchUserInfo({ token: tokenResponse.access_token, username }));
        const user = unwrapResult(userAction);

        dispatch(
          setTokens({
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            expiresAt: tokenResponse.expires_in ? Date.now() + tokenResponse.expires_in * 1000 : null,
            userData: user
          })
        );

        navigate('/');
      } catch (error) {
        console.error('OAuth callback error:', error);
        dispatch(setError('OAuth login failed'));
        navigate('/');
      } finally {
        dispatch(setLoading(false));
      }
    };

    handleAuth();
  }, [dispatch, navigate, searchParams]);

  return <div>Logging you in...</div>;
};

export default Callback;
