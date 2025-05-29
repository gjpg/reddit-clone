import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { fetchPosts } from '../../actions/fetchPosts';
import type { RootState } from '../../store/store';
import type { RedditPost } from '../../types';
import styles from './PostList.module.css';
import PostItem from '../PostItem/PostItem';
import { voteOnItem } from '../../actions/voteActions';

const validSorts = ['hot', 'new', 'top'] as const;
type SortType = (typeof validSorts)[number];

const validTimespans = ['day', 'week', 'month', 'year', 'all'] as const;
type TimespanType = (typeof validTimespans)[number];

const PostList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const posts = useSelector((state: RootState) => state.posts.posts) as RedditPost[];
  const token = localStorage.getItem('reddit_access_token');

  // Parse URL path
  const pathSegments = location.pathname.toLowerCase().split('/').filter(Boolean);

  let subreddit: string | undefined = undefined;
  let sort: SortType = 'hot'; // default sort

  const handleVote = (id: string, type: 'post' | 'comment') => (dir: 1 | 0 | -1) => {
    if (!token) {
      alert('Please log in to vote.');
      return;
    }
    dispatch(voteOnItem({ id, dir, type, token }));
  };

  if (pathSegments.length === 0) {
    // front page, default hot
  } else if (pathSegments[0] === 'r' && pathSegments[1]) {
    subreddit = pathSegments[1];
    if (pathSegments[2] && validSorts.includes(pathSegments[2] as SortType)) {
      sort = pathSegments[2] as SortType;
    }
  } else if (validSorts.includes(pathSegments[0] as SortType)) {
    sort = pathSegments[0] as SortType;
  }

  // Parse timespan param 't' from query string, default to 'week'
  const searchParams = new URLSearchParams(location.search);
  const tParam = searchParams.get('t') ?? 'week';
  const timespan: TimespanType = validTimespans.includes(tParam as TimespanType) ? (tParam as TimespanType) : 'week';

  // If current sort is not 'top', timespan param shouldn't exist in URL. Remove it if present.
  useEffect(() => {
    if (sort !== 'top' && searchParams.has('t')) {
      searchParams.delete('t');
      navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    }
  }, [sort, searchParams, navigate, location.pathname]);

  useEffect(() => {
    dispatch(fetchPosts({ subreddit, sort, timespan }));
  }, [dispatch, subreddit, sort, timespan]);

  // Build links for sort buttons (preserve subreddit if present)
  // For 'top' sort, preserve timespan in URL
  const buildSortLink = (s: SortType) => {
    let url = subreddit ? `/r/${subreddit}/${s}` : `/${s}`;

    if (s === 'top') {
      // append ?t=timespan if available
      url += `?t=${timespan}`;
    }

    return url;
  };

  return (
    <>
      <div className={styles.sortButtons}>
        {validSorts.map((s) => (
          <Link key={s} to={buildSortLink(s)} className={s === sort ? styles.activeSortButton : styles.sortButton}>
            {s.toUpperCase()}
          </Link>
        ))}
      </div>

      <div className={styles.postList}>
        {posts.length === 0 && <p>No posts to display.</p>}
        {posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            token={token}
            onVote={handleVote(post.id, 'post')}
            showThumbnail
            showAuthor
          />
        ))}
      </div>
    </>
  );
};

export default PostList;
