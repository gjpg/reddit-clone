import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../../store/posts/postsSlice';
import type { RootState, AppDispatch } from '../../store/store';
const PostsList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, isLoading, error } = useSelector((state: RootState) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts(undefined)); // pass subreddit name or undefined for front page
  }, [dispatch]);

  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts: {error}</p>;

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <a href={post.url} target="_blank" rel="noopener noreferrer">{post.title}</a>
          <p>by {post.author} in {post.subreddit}</p>
        </div>
      ))}
    </div>
  );
};

export default PostsList;
