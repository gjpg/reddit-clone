// components/CommentItem/CommentItem.tsx
import React from 'react';
import type { RedditComment } from '../../types';
import VoteBox from '../VoteBox/VoteBox';
import { formatPostAge } from '../../utils/time';
import styles from './CommentItem.module.css';

interface CommentItemProps {
  comment: RedditComment;
  token: string | null;
  onVote: (dir: 1 | 0 | -1) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, token, onVote }) => {
  return (
    <div className={styles.itemRow}>
      <VoteBox
        score={comment.score}
        likes={comment.likes}
        disabled={!token || comment.archived}
        archived={comment.archived}
        onVote={onVote}
      />
      <div className={styles.comment}>
        <p>{comment.body}</p>
        <p className={styles.timestamp}>
          <span title={new Date(comment.created_utc * 1000).toLocaleString()}>
            {formatPostAge(comment.created_utc)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default CommentItem;
