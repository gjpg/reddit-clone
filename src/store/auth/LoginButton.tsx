import { useAppDispatch } from '../hooks';
import { setLoading } from './authSlice';
import { startOAuthFlow } from '../../services/auth';

const LoginButton = () => {
  const dispatch = useAppDispatch();

  const handleLogin = () => {
    dispatch(setLoading(true));
    startOAuthFlow();
  };

  return <button onClick={handleLogin}>Login with Reddit</button>;
};

export default LoginButton;
