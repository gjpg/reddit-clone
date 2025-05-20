import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchSubredditPosts } from "../../actions/fetchPosts";
import type { RootState } from "../../store/store";

const SubredditPosts = ({ subreddit }: { subreddit: string }) => {
  const [posts, setPosts] = useState([]);
  const token = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (!token) return;

    const getPosts = async () => {
      try {
        const data = await fetchSubredditPosts(subreddit, token);
        setPosts(data.data.children); // Reddit wraps posts in `data.children`
      } catch (err) {
        console.error("Error loading posts:", err);
      }
    };

    getPosts();
  }, [subreddit, token]);

  return (
    <div>
      <h2>/r/{subreddit} - Hot Posts</h2>
      <ul>
        {posts.map((post: any) => (
          <li key={post.data.id}>
            <a href={`https://reddit.com${post.data.permalink}`} target="_blank">
              {post.data.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubredditPosts;
