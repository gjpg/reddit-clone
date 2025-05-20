import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

type Post = {
  id: string;
  title: string;
  author: string;
  url: string;
};

const PostList: React.FC = () => {
  const posts = useSelector((state: RootState) => state.posts.posts) as Post[]; // typed posts from Redux state

  return (
    <div>
      {posts.map((post: Post) => (
        <div key={post.id}>
          <a href={post.url} target="_blank" rel="noopener noreferrer">
            {post.title}
          </a>
          <p>by {post.author}</p>
        </div>
      ))}
    </div>
  );
};

export default PostList;
