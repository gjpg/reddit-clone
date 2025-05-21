import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import styles from './PostList.module.css';

type Post = {
  id: string;
  title: string;
  author: string;
  url: string;
  subreddit_name_prefixed: string;
  thumbnail?: string;
};

const PostList: React.FC = () => {
  const posts = useSelector((state: RootState) => state.posts.posts) as Post[];
  const isValidThumbnail = (url?: string) => {
    return url && url.startsWith('http') && !['self', 'default', 'nsfw', 'image'].includes(url);
  };

  return (
    <div className={styles.postList}>
      {posts.map((post: Post) => (
        <div key={post.id} className={styles.postCard}>
          <div className={styles.postContent}>
            {isValidThumbnail(post.thumbnail) && (
              <img src={post.thumbnail} alt="Post preview" className={styles.thumbnail} />
            )}
            <div>
              <a href={post.url} target="_blank" rel="noopener noreferrer" className={styles.title}>
                {post.title}
              </a>
              <p className={styles.author}>by {post.author}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
