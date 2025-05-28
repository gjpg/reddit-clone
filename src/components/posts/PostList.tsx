import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { fetchPosts } from '../../actions/fetchPosts';
import type { RootState } from '../../store/store';
import type { RedditPost } from '../../types';
import styles from './PostList.module.css';
import PostItem from '../PostItem/PostItem';

const PostList: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const posts = useSelector((state: RootState) => state.posts.posts) as RedditPost[];

  const sort = location.pathname.slice(1) || 'best';

  useEffect(() => {
    dispatch(fetchPosts(sort));
  }, [dispatch, sort]);

  const token = localStorage.getItem('reddit_access_token');

  return (
    <div className={styles.postList}>
      {posts.map((post) => (
        <PostItem
          key={post.id}
          post={{ ...post, kind: 'post', score: post.score ?? 'hidden' }}
          token={token}
          showThumbnail
          showAuthor
        />
      ))}
    </div>
  );
};

export default PostList;
