export interface RedditPost {
  kind: 'post';
  title: string;
  url: string;
  thumbnail?: string;
  id: string;
  author: string;
  created_utc: number;
  permalink: string;
  score: number | 'hidden';
  subreddit_name_prefixed: string;
  likes?: boolean | null;
  archived?: boolean;
  num_comments?: number;
}

export interface RedditComment {
  kind: 'comment';
  body: string;
  id: string;
  author: string;
  created_utc: number;
  permalink: string;
  score: number | 'hidden';
  subreddit_name_prefixed: string;
  likes?: boolean | null;
  archived?: boolean;
  num_comments?: number;
  title?: string;
}
