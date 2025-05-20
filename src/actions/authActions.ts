import type { Dispatch } from 'redux';
import { setCredentials } from '../store/auth/authSlice';
import type { UserData } from '../store/auth/authSlice';

// Assuming the exchangeCodeForToken function returns the user data
export const exchangeCodeForToken = async (code: string, dispatch: Dispatch) => {
  console.log('exchangeCodeForToken called with code:', code);
  const response = await fetch('http://localhost:3001/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code })
  });

  if (!response.ok) {
    throw new Error('Token exchange failed');
  }

  const json = await response.json();
  console.log('Full json:', json);
  console.log('json.data:', json.data);

  // 🔥 FIX IS HERE:
  const accessToken = json.access_token;
  console.log('Access token:', accessToken);

  if (!accessToken) {
    throw new Error('Access token missing in response');
  }

  localStorage.setItem('reddit_access_token', accessToken);

  // Fetch user data
  const userResponse = await fetch('http://localhost:3001/api/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!userResponse.ok) {
    throw new Error('Failed to fetch user data');
  }

  const userData: UserData = await userResponse.json();
  dispatch(setCredentials({ accessToken, userData }));
  return { accessToken, userData };
};
