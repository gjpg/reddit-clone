import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchUserInfo, fetchUserActivity } from '../../actions/userActions';
import type { RootState } from '../../store/store';
import styles from './UserPage.module.css';
import { formatPostAge } from '../../utils/time';
import type { RedditPost, RedditComment } from '../../types'; // No RedditItem import now
import SortButtons from '../SortButtons/SortButtons';
import { sortContent } from '../../utils/sortContent';

const UserPage: React.FC = () => {
  const dispatch = useDispatch();
  const { username } = useParams<{ username: string }>();
  const token = localStorage.getItem('reddit_access_token');

  // Explicitly type posts and comments from state as RedditPost[] and RedditComment[]
  const { info, posts, comments, loading, error } = useSelector((state: RootState) => ({
    info: state.user.info,
    posts: state.user.posts as RedditPost[],
    comments: state.user.comments as RedditComment[],
    loading: state.user.loading,
    error: state.user.error
  }));

  const [params] = useSearchParams();
  const sort = (params.get('sort') as 'new' | 'top' | 'hot') ?? 'new';
  const timespan = (params.get('t') as 'day' | 'month' | 'year' | 'all') ?? 'all';
  const basePath = `/user/${username}`;

  // Add kind discriminator explicitly (optional if you always set kind on data source)
  const postsWithKind: RedditPost[] = posts.map((post) => ({
    ...post,
    kind: 'post',
    score: post.score ?? 'hidden'
  }));

  const commentsWithKind: RedditComment[] = comments.map((comment) => ({
    ...comment,
    kind: 'comment',
    score: comment.score ?? 'hidden'
  }));

  // If your sortContent accepts only one array, merge but declare type carefully:
  // Or better: adjust sortContent to accept posts and comments separately, if possible
  const userActivity: (RedditPost | RedditComment)[] = [...postsWithKind, ...commentsWithKind];

  const sortedItems = sortContent({
    items: userActivity,
    sort,
    timespan,
    page: 'user'
  });

  useEffect(() => {
    if (token && username) {
      dispatch(fetchUserInfo({ token, username }) as any);
      dispatch(fetchUserActivity({ token, username, sort }) as any);
    }
  }, [token, username, sort, dispatch]);

  // Now define separate type guards (using `kind` discriminator)
  const isPost = (item: RedditPost | RedditComment): item is RedditPost => item.kind === 'post';

  // Handle optional created_utc defensively
  const getAccountAgeYears = (createdUtc?: number) => {
    if (!createdUtc) return 'Unknown';
    const now = Date.now();
    const created = createdUtc * 1000;
    const diffMs = now - created;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.username}>{username}'s Profile</h1>
        <SortButtons currentSort={sort} hideBest useQueryParam basePath={basePath} />
      </header>

      {info && (
        <section className={styles.info}>
          <div className={styles.infoItem}>
            <strong>Account Age</strong>
            <span>{getAccountAgeYears(info.created_utc)} years</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Post Karma</strong>
            <span>{info.link_karma}</span>
          </div>
          <div className={styles.infoItem}>
            <strong>Comment Karma</strong>
            <span>{info.comment_karma}</span>
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2>Recent Activity</h2>
        {sortedItems.length === 0 ? (
          <p>No posts or comments available.</p>
        ) : (
          sortedItems.map((item) =>
            isPost(item) ? (
              <div key={item.id} className={styles.post}>
                <a href={`https://reddit.com${item.permalink}`} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                  <span title={new Date(item.created_utc * 1000).toLocaleString()}>
                    {formatPostAge(item.created_utc)}
                  </span>
                </p>
              </div>
            ) : (
              <div key={item.id} className={styles.comment}>
                <p>{item.body}</p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                  <span title={new Date(item.created_utc * 1000).toLocaleString()}>
                    {formatPostAge(item.created_utc)}
                  </span>
                </p>
              </div>
            )
          )
        )}
      </section>
    </div>
  );
};

export default UserPage;
