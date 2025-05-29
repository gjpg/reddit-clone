// components/CommentForm/CommentForm.tsx
import React, { useState } from 'react';
import styles from './CommentForm.module.css';

interface CommentFormProps {
  parentId: string; // full Reddit thing_id like "t3_xxx" or "t1_xxx"
  token: string;
  onSuccess?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ parentId, token, onSuccess }) => {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('https://oauth.reddit.com/api/comment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text,
          thing_id: parentId,
          api_type: 'json',
        }),
      });

      const result = await response.json();

      if (result?.json?.errors?.length) {
        alert('Failed to post comment.');
      } else {
        setText('');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      alert('Error posting comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.commentForm}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Write your comment..."
      />
      <button onClick={handleSubmit} disabled={submitting || !text.trim()}>
        {submitting ? 'Posting...' : 'Submit'}
      </button>
    </div>
  );
};

export default CommentForm;
