export interface RedditItemBase {
  id: string;
  author: string;
  created_utc: number;
  permalink: string;
  score: number | 'hidden';
  subreddit_name_prefixed: string;
}

export interface RedditPost extends RedditItemBase {
  kind: 'post';
  title: string;
  url: string;
  thumbnail?: string;
}

export interface RedditComment extends RedditItemBase {
  kind: 'comment';
  body: string;
}
