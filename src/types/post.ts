// types/post.ts (or add to types.ts if you consolidate later)
export type Post = {
  id: string;
  title: string;
  author: string;
  url?: string;
  subreddit_name_prefixed: string;
  thumbnail?: string;
  created_utc: number;
  permalink: string;
  score: number | 'hidden';
  likes: boolean | null;
  archived?: boolean;
  selftext?: string;
  kind: 'post' | 'comment'; // Add kind to differentiate from comments
  is_video?: boolean;
   comments?: Comment[];
  media?: {
    reddit_video?: {
      fallback_url: string;
    };
  };
};

export interface Comment {
  kind: 'comment';
  id: string;
  author: string;
  created_utc: number;
  permalink: string;
  score: number | 'hidden';
  subreddit_name_prefixed: string;
  likes: boolean | null;
  archived?: boolean;
  body: string;
  // add other fields if needed
}
