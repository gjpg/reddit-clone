import React, { useState } from 'react';
import VoteBox from '../VoteBox/VoteBox';
import { formatPostAge } from '../../utils/time';
import styles from './CommentItem.module.css';
import type { CommentNode } from '../../types';
import CommentForm from '../CommentForm/CommentForm';

interface CommentItemProps {
  comment: CommentNode; // 🔁 Changed from RedditComment
  token: string | null;
  onVote: (dir: 1 | 0 | -1) => void;
  depth?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, token, onVote, depth = 0 }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);

  const handleReplyClick = () => {
    if (!token) {
      alert('Please log in to reply.');
      return;
    }
    setShowReplyBox((prev) => !prev);
  };

  return (
    <div className={styles.itemRow} style={{ marginLeft: depth * 20 }}>
      <VoteBox
        score={comment.score}
        likes={comment.likes}
        disabled={!token || comment.archived}
        archived={comment.archived}
        onVote={onVote}
      />
      <div className={styles.comment}>
        <div className={styles.meta}>
          <span className={styles.author}>u/{comment.author}</span>
          {' • '}
          <span title={new Date(comment.created_utc * 1000).toLocaleString()}>
            {formatPostAge(comment.created_utc)}
          </span>
          {' • '}
          <a
            href={`https://reddit.com${comment.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.permalink}
          >
            permalink
          </a>
        </div>

        <p>{comment.body}</p>

        <button className={styles.replyButton} onClick={handleReplyClick}>
          {showReplyBox ? 'Cancel' : 'Reply'}
        </button>

        {showReplyBox && (
<CommentForm
  parentId={`t1_${comment.id}`}
  token={token ?? ''}   // Provide empty string fallback if token is null
  onSuccess={() => {
    setShowReplyBox(false);
    // Optionally refresh comments here
  }}
/>

)}


      {comment.replies.length > 0 &&
  comment.replies.map((child) => (
    <CommentItem
      key={child.id}
      comment={child}
      token={token}
      onVote={onVote}
      depth={depth + 1}
    />
  ))}

      </div>
    </div>
  );
};

export default CommentItem;
