import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';
import { setCredentials, setError, setLoading } from '../../store/auth/authSlice';
import { exchangeCodeForToken, fetchUserInfo } from '../../actions/authActions';
import { useAppDispatch } from '../../store/hooks';

const Callback = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const didRun = useRef(false); // <== key to prevent double execution

  useEffect(() => {
    console.log('Mount');
    return () => {
      console.log('Unmounts');
    };
  }, []);

  useEffect(() => {
    if (didRun.current) return; // <== prevent re-running in dev Strict Mode
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

        // Dispatch thunk to exchange code for token and unwrap result
        const tokenAction = await dispatch(exchangeCodeForToken(code));
        const tokenResponse = unwrapResult(tokenAction);

        const { access_token, refresh_token, expires_in } = tokenResponse;

        // Dispatch thunk to fetch user info with access token
        const userAction = await dispatch(fetchUserInfo(access_token));
        const user = unwrapResult(userAction);

        // Save credentials to Redux store
        dispatch(
          setCredentials({
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresIn: expires_in,
            userData: user,
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
