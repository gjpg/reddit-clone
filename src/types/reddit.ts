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
  parent_id?: string;
  replies?: RedditListing | string;
}

export interface RedditListing {
  kind: string;
  data: {
    children: {
      kind: string;
      data: RedditComment;
    }[];
  };
}

export interface CommentNode extends Omit<RedditComment, 'replies'> {
  replies: CommentNode[];
}
