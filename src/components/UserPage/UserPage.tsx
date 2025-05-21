import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserInfo, fetchUserPosts, fetchUserComments } from '../../actions/userActions';
import type { RootState } from '../../store/store';

const UserPage: React.FC = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem('reddit_access_token');

  const { info, posts, comments, loading, error } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserInfo(token) as any);
      dispatch(fetchUserPosts(token) as any);
      dispatch(fetchUserComments(token) as any);
    }
  }, [token, dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>User Info</h1>
      {info && (
        <div>
          <p><strong>Username:</strong> {info.username}</p>
          <p><strong>Account Age:</strong> {info.accountAge} years</p>
          <p><strong>Post Karma:</strong> {info.linkKarma}</p>
          <p><strong>Comment Karma:</strong> {info.commentKarma}</p>
        </div>
      )}

      <h2>Recent Posts</h2>
      {posts.map((post: any) => (
        <div key={post.id}>
          <a href={`https://reddit.com${post.permalink}`} target="_blank" rel="noreferrer">
            {post.title}
          </a>
        </div>
      ))}

      <h2>Recent Comments</h2>
      {comments.map((comment: any) => (
        <div key={comment.id}>
          <p>{comment.body}</p>
        </div>
      ))}
    </div>
  );
};

export default UserPage;
