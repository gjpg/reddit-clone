export const fetchSubredditPosts = async (subreddit: string, token: string) => {
  const response = await fetch(`http://localhost:3001/api/posts/${subreddit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch subreddit posts");
  }

  return await response.json();
};
