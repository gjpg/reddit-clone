// components/VoteBox.tsx
import React from 'react';
import styles from './VoteBox.module.css'; // we'll create this
import LockIcon from '../../assets/lock.svg';

export interface VoteBoxProps {
  score: number | 'hidden';
  likes: boolean | null | undefined;
  disabled?: boolean;
  archived?: boolean;
  onVote: (dir: 1 | 0 | -1) => void;
}

const VoteBox: React.FC<VoteBoxProps> = ({ score, likes, onVote, disabled, archived }) => {
  const handleVote = (dir: 1 | 0 | -1) => {
    if (disabled || !onVote) return;
    if ((dir === 1 && likes === true) || (dir === -1 && likes === false)) {
      onVote(0); // unvote
    } else {
      onVote(dir);
    }
  };

  return (
    <div className={styles.voteBox}>
      <button
        className={`${styles.arrow} ${likes === true ? styles.upvoted : ''}`}
        onClick={() => handleVote(1)}
        disabled={disabled}
      >
        ▲
      </button>

      <div className={styles.scoreWithIcon}>
        <span className={styles.score}>{score === 'hidden' ? '•' : score}</span>
        {archived && (
          <img
            src={LockIcon}
            alt="Archived"
            title="Voting is disabled on archived posts/comments."
            className={styles.lockIcon}
          />
        )}
      </div>

      <button
        className={`${styles.arrow} ${likes === false ? styles.downvoted : ''}`}
        onClick={() => handleVote(-1)}
        disabled={disabled}
      >
        ▼
      </button>
    </div>
  );
};

export default VoteBox;
