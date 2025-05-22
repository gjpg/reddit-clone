import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchUserInfo, fetchUserActivity } from '../../actions/userActions';
import type { RootState } from '../../store/store';
import styles from './UserPage.module.css';
import { formatPostAge } from '../../utils/time';
import type { RedditItem, RedditPost, RedditComment } from '../../types';
import SortButtons from '../SortButtons/SortButtons';
import { sortContent } from '../../utils/sortContent';

const UserPage: React.FC = () => {
  const dispatch = useDispatch();
  const { username } = useParams<{ username: string }>();
  const token = localStorage.getItem('reddit_access_token');



  const {
    info,
    userActivity,
    loadingInfo,
    loadingActivity,
    errorInfo,
    errorActivity,
  } = useSelector((state: RootState) => state.user);

  const [params] = useSearchParams();
const sort = (params.get('sort') as 'new' | 'top' | 'hot') ?? 'new'; // user page default is 'new'
const timespan = (params.get('t') as 'day' | 'month' | 'year' | 'all') ?? 'all';  const basePath = `/user/${username}`;
const sortedItems = sortContent({
  items: userActivity,
  sort,
  timespan,
  page: 'user'
});

  useEffect(() => {
    if (token && username) {
      dispatch(fetchUserInfo({ token, username }) as any);
      dispatch(fetchUserActivity({ token, username, sort }) as any); // Pass sort to thunk
    }
  }, [token, username, sort, dispatch]);

  if (loadingInfo || loadingActivity) return <p>Loading...</p>;
  if (errorInfo || errorActivity) return <p>Error: {errorInfo || errorActivity}</p>;

  const isPost = (item: RedditItem): item is RedditPost => item.kind === 'post';
  const isComment = (item: RedditItem): item is RedditComment => item.kind === 'comment';

  const posts = sortedItems.filter(isPost);
  const comments = sortedItems.filter(isComment);


  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.username}>{username}'s Profile</h1>
        <SortButtons
          currentSort={sort}
          hideBest={true}
          useQueryParam={true}
          basePath={basePath}
        />
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
        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={styles.post}>
              <a
                href={`https://reddit.com${post.permalink}`}
                target="_blank"
                rel="noreferrer"
              >
                {post.title}
              </a>
            </div>
          ))
        )}
      </section>

      <section className={styles.section}>
        <h2>Recent Comments</h2>
        {comments.length === 0 ? (
          <p>No comments available.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id}>
              <p>{comment.body}</p>
              <p style={{ fontSize: '0.8rem', color: '#666' }}>
                <span title={new Date(comment.created_utc * 1000).toLocaleString()}>
                  {formatPostAge(comment.created_utc)}
                </span>
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default UserPage;
