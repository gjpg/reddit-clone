import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPostDetails } from '../../store/posts/postsSlice';
import type { RootState, AppDispatch } from '../../store/store';
import CommentItem from '../CommentItem/CommentItem';
import styles from './PostPage.module.css';
import { voteOnItem } from '../../actions/voteActions';
import VoteBox from '../VoteBox/VoteBox';
import type { RedditComment, CommentNode } from '../../types';
import CommentForm from '../CommentForm/CommentForm';

const PostPage: React.FC = () => {
  const { subreddit, postId } = useParams<{ subreddit: string; postId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const token = localStorage.getItem('reddit_access_token');

  const post = useSelector((state: RootState) => state.posts.selectedPost);
  const comments = useSelector((state: RootState) => state.posts.comments);
  const loading = useSelector((state: RootState) => state.posts.loading);

  // Handler for voting
  const handleVote = (id: string, type: 'post' | 'comment') => (dir: 1 | 0 | -1) => {
    if (!token) {
      alert('Please log in to vote.');
      return;
    }
    dispatch(voteOnItem({ id, dir, type, token }));
  };

  useEffect(() => {
    if (subreddit && postId) {
      dispatch(fetchPostDetails({ subreddit, postId }));
    }
  }, [subreddit, postId, dispatch]);

  // Build a tree of comments from flat list using parent_id
  const buildCommentTree = (comments: RedditComment[], postId: string): CommentNode[] => {
    const commentMap: { [id: string]: CommentNode } = {};
    const roots: CommentNode[] = [];

    comments.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    comments.forEach((comment) => {
      const parentId = comment.parent_id?.split('_')[1];
      if (parentId && parentId !== postId && commentMap[parentId]) {
        commentMap[parentId].replies.push(commentMap[comment.id]);
      } else {
        roots.push(commentMap[comment.id]);
      }
    });

    return roots;
  };

  // Recursively render comments with indentation based on depth
  const renderCommentTree = (commentNodes: CommentNode[], depth = 0): React.ReactNode => {
    return commentNodes.map((comment) => (
      <div key={comment.id} style={{ marginLeft: depth * 20 }}>
        <CommentItem comment={comment} token={token} onVote={handleVote(comment.id, 'comment')} />
        {comment.replies.length > 0 && renderCommentTree(comment.replies, depth + 1)}
      </div>
    ));
  };

  const renderPostContent = () => {
    if (!post) return null;

    return (
      <div className={styles.post}>
        <h1>{post.title}</h1>
        <p>Posted by u/{post.author}</p>
        {post.selftext && <div className={styles.text}>{post.selftext}</div>}

        {post.url?.endsWith('.jpg') || post.url?.endsWith('.png') ? (
          <img src={post.url} alt={post.title} className={styles.image} />
        ) : post.is_video && post.media?.reddit_video?.fallback_url ? (
          <video controls src={post.media.reddit_video.fallback_url} className={styles.video} />
        ) : (
          <a href={post.url} target="_blank" rel="noopener noreferrer">
            {post.url}
          </a>
        )}

        <VoteBox score={post.score} likes={post.likes} onVote={handleVote(post.id, 'post')} disabled={post.archived} />
      </div>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found.</p>;

  const commentTree = buildCommentTree(comments, post.id);

  return (
    <div className={styles.container}>
      {renderPostContent()}

      {token && post && (
        <div className={styles.commentFormWrapper}>
          <h3>Add a comment</h3>
          <CommentForm
            parentId={`t3_${post.id}`}
            token={token}
            onSuccess={() => {
              // Refresh post details or comments after successful submit
              dispatch(fetchPostDetails({ subreddit: subreddit!, postId: postId! }));
            }}
          />
        </div>
      )}

      <h2>Comments</h2>
      <div className={styles.comments}>
        {commentTree.length === 0 ? <p>No comments yet.</p> : renderCommentTree(commentTree)}
      </div>
    </div>
  );
};

export default PostPage;
