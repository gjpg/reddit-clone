import type { Dispatch } from 'redux';
import { setCredentials } from '../store/auth/authSlice';
import type { UserData } from '../store/auth/authSlice';

export const setUserData = (userData: any) => ({
  type: "SET_USER_DATA",
  payload: userData,
}); //needs to be typed properly. any isn't good practice

  
  // Assuming the exchangeCodeForToken function returns the user data
  export const exchangeCodeForToken = async (code: string,  dispatch: Dispatch) => {
    const response = await fetch("http://localhost:3001/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
  
    if (!response.ok) {
      throw new Error("Token exchange failed");
    }
  
    const data = await response.json();
  const accessToken: string = data.access_token;
  localStorage.setItem("reddit_access_token", accessToken);
  
    // Fetch user data with the token
    const userResponse = await fetch("https://oauth.reddit.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  
    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data");
    }
  
  const userData: UserData = await userResponse.json();

  dispatch(setCredentials({ accessToken, userData }));

  return { accessToken, userData };
  };
  