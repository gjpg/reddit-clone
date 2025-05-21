import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchUserInfo, fetchUserPosts, fetchUserComments } from '../../actions/userActions';
import type { RootState } from '../../store/store';
import styles from './UserPage.module.css';

const UserPage: React.FC = () => {
  const dispatch = useDispatch();
  const { username } = useParams<{ username: string }>();
  const token = localStorage.getItem('reddit_access_token');

  const { info, posts, comments, loading, error } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (token && username) {
      dispatch(fetchUserInfo({ token, username }) as any);
      dispatch(fetchUserPosts({ token, username }) as any);
      dispatch(fetchUserComments({ token, username }) as any);
    }
  }, [token, username, dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.username}>{username}'s Profile</h1>
      </header>

      {info && (
        <section className={styles.info}>
          <div className={styles.infoItem}>
            <strong>Account Age</strong>
            <span>{info.accountAge} years</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Post Karma</strong>
            <span>{info.linkKarma}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Comment Karma</strong>
            <span>{info.commentKarma}</span>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2>Recent Posts</h2>
        {posts.map((post: any) => (
          <div key={post.id} className={styles.post}>
            <a href={`https://reddit.com${post.permalink}`} target="_blank" rel="noreferrer">
              {post.title}
            </a>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2>Recent Comments</h2>
        {comments.map((comment: any) => (
          <div key={comment.id} className={styles.comment}>
            <p>{comment.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default UserPage;
