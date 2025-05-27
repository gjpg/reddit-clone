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
import VoteBox from '../VoteBox/VoteBox';
import { voteOnItem } from '../../actions/voteActions';
import { selectUserPosts, selectUserComments } from '../../store/posts/postsSlice';

const DebugLogger = () => {
  const userPosts = useSelector(selectUserPosts);
  const userComments = useSelector(selectUserComments);

  useEffect(() => {
    console.log('userPosts:', userPosts);
    console.log('userComments:', userComments);
  }, [userPosts, userComments]);

  return null;
};

const UserPage: React.FC = () => {
  const dispatch = useDispatch();
  const { username } = useParams<{ username: string }>();
  const token = localStorage.getItem('reddit_access_token');

  const info = useSelector((state: RootState) => state.user.info);
  const posts = useSelector((state: RootState) => state.posts.userPosts as RedditPost[]);
  const comments = useSelector((state: RootState) => state.posts.userComments as RedditComment[]);
  const loading = useSelector((state: RootState) => state.user.loading);
  const error = useSelector((state: RootState) => state.user.error);

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

  const handleVote = async (id: string, dir: 1 | 0 | -1, type: 'post' | 'comment') => {
    const item = sortedItems.find((i) => i.id === id);
    if (!item || item.archived || !token) return;

    await voteOnItem({ id, dir, type, token });
  };

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
      <DebugLogger />
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
          sortedItems.map((item) => {
            return (
              <div key={item.id} className={styles.itemRow}>
                <VoteBox
                  score={item.score}
                  likes={item.likes}
                  disabled={!token || item.archived}
                  archived={item.archived}
                  onVote={(dir) => handleVote(item.id, dir, isPost(item) ? 'post' : 'comment')}
                />
                <div className={isPost(item) ? styles.post : styles.comment}>
                  {isPost(item) ? (
                    <>
                      <a href={`https://reddit.com${item.permalink}`} target="_blank" rel="noreferrer">
                        {item.title}
                      </a>
                      <p style={{ fontSize: '0.8rem', color: '#666' }}>
                        <span title={new Date(item.created_utc * 1000).toLocaleString()}>
                          {formatPostAge(item.created_utc)}
                        </span>{' '}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>{item.body}</p>
                      <p style={{ fontSize: '0.8rem', color: '#666' }}>
                        <span title={new Date(item.created_utc * 1000).toLocaleString()}>
                          {formatPostAge(item.created_utc)}
                        </span>{' '}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default UserPage;
