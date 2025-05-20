export const generateRandomString = (length = 16) => {
  const crypto = window.crypto || window.crypto;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  if (crypto) {
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      result += characters[values[i] % characters.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
  }

  return result;
};

export const startOAuthFlow = () => {
  const STATE = generateRandomString();
  sessionStorage.setItem("oauth_state", STATE);

  const params = new URLSearchParams({
    client_id: "0QJmxiRSfLLCIfjZ4YedYA", // Replace with your actual client_id
    response_type: "code",
    state: STATE,
    redirect_uri: "http://localhost:3000/callback",
    duration: "permanent",
    scope: "identity read submit vote",
  });

  console.log(
    "Redirecting to Reddit with URL:",
    `https://www.reddit.com/api/v1/authorize?${params.toString()}`
  );

  window.location.href = `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string) => {  console.log("Exchanging code for token, received code:", code);

  const response = await fetch("http://localhost:3001/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    console.error("Token exchange failed, status:", response.status);
    throw new Error("Token exchange failed");
  }

  const data = await response.json();
  console.log("Token exchange successful, received data:", data);

  // Store the access token and refresh token in localStorage
  localStorage.setItem('reddit_access_token', data.access_token);
  localStorage.setItem('reddit_refresh_token', data.refresh_token);

  return data;
};

export const getUserData = async () => {
  const accessToken = localStorage.getItem('reddit_access_token');

  if (!accessToken) {
    console.error("No access token found.");
    return null;
  }

  // Fetch user data from Reddit's /api/v1/me endpoint using the access token
  const response = await fetch("https://oauth.reddit.com/api/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch user data, status:", response.status);
    return null;
  }

  const userData = await response.json();
  console.log("User data fetched successfully:", userData);

  return userData;
};

