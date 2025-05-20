// auth.ts
export const generateRandomString = (length = 16) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);

  return Array.from(values)
    .map((value) => characters[value % characters.length])
    .join('');
};

export const startOAuthFlow = () => {
  const STATE = generateRandomString();
  sessionStorage.setItem("oauth_state", STATE);

  const params = new URLSearchParams({
    client_id: "0QJmxiRSfLLCIfjZ4YedYA",
    response_type: "code",
    state: STATE,
    redirect_uri: "http://localhost:3000/callback",
    duration: "permanent",
    scope: "identity read submit vote",
  });

  window.location.href = `https://www.reddit.com/api/v1/authorize?${params.toString()}`;
};
