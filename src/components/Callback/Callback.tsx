import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, setError, setLoading } from '../../store/auth/authSlice';
import { exchangeCodeForToken } from '../../actions/authActions';

const Callback = () => {
  const dispatch = useDispatch();
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
        const { accessToken, userData } = await exchangeCodeForToken(code, dispatch);
        dispatch(setCredentials({ accessToken, userData }));
        sessionStorage.removeItem('oauth_state');
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
