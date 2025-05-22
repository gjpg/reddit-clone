import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { fetchPosts } from '../../actions/fetchPosts';
import type { RootState } from '../../store/store';
import styles from './PostList.module.css';
import type { Post } from '../../types';
import { Link } from 'react-router-dom';
import { formatPostAge } from '../../utils/time';

const PostList: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const posts = useSelector((state: RootState) => state.posts.posts) as Post[];

  const sort = location.pathname.slice(1) || 'best';

  useEffect(() => {
    dispatch(fetchPosts(sort));
  }, [dispatch, sort]);

  const isValidThumbnail = (url?: string) => {
    return url && url.startsWith('http') && !['self', 'default', 'nsfw', 'image'].includes(url);
  };

  return (
    <div className={styles.postList}>
      {posts.map((post) => (
        <div key={post.id} className={styles.postCard}>
          <div className={styles.postContent}>
            {isValidThumbnail(post.thumbnail) && (
              <img src={post.thumbnail} alt="Post preview" className={styles.thumbnail} />
            )}
            <div>
              <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.title}>
                {post.title}
              </a>

              <p className={styles.meta}>
                by{' '}
                <Link to={`/user/${post.author}`} className={styles.authorLink}>
                  {post.author}
                </Link>{' '}
                •{' '}
                <span title={new Date(post.created_utc * 1000).toLocaleString()}>
                  {formatPostAge(post.created_utc)}
                </span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
