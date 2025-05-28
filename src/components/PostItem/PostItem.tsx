// components/PostItem/PostItem.tsx
import React from 'react';
import type { RedditPost } from '../../types';
import VoteBox from '../VoteBox/VoteBox';
import { formatPostAge } from '../../utils/time';
import styles from './PostItem.module.css';
import { Link } from 'react-router-dom';

interface PostItemProps {
  post: RedditPost;
  token: string | null;
  onVote?: (dir: 1 | 0 | -1) => void;
  showThumbnail?: boolean;
  showAuthor?: boolean;
}

const PostItem: React.FC<PostItemProps> = ({ post, token, onVote, showThumbnail = false, showAuthor = false }) => {
  const isValidThumbnail = (url?: string) =>
    url && url.startsWith('http') && !['self', 'default', 'nsfw', 'image'].includes(url);

  return (
    <div className={styles.itemRow}>
      <VoteBox
        score={post.score}
        likes={post.likes}
        disabled={!token || post.archived}
        archived={post.archived}
        onVote={onVote ?? (() => {})}
      />
      <div className={styles.post}>
        {showThumbnail && isValidThumbnail(post.thumbnail) && (
          <img src={post.thumbnail} alt="Post preview" className={styles.thumbnail} />
        )}
        <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.title}>
          {post.title}
        </a>
        <p className={styles.meta}>
          {showAuthor && (
            <>
              by <Link to={`/user/${post.author}`}>{post.author}</Link> •{' '}
            </>
          )}
          <span title={new Date(post.created_utc * 1000).toLocaleString()}>{formatPostAge(post.created_utc)}</span>
        </p>
      </div>
    </div>
  );
};

export default PostItem;
