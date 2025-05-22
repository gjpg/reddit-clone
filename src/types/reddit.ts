export interface RedditItemBase {
  id: string;
  author: string;
  created_utc: number;
  permalink: string;
  kind: 'post' | 'comment';
    score: number;

}

export interface RedditPost extends RedditItemBase {
  kind: 'post';
  title: string;
  url: string;
  subreddit_name_prefixed: string;
  thumbnail?: string;
}

export interface RedditComment extends RedditItemBase {
  kind: 'comment';
  body: string;
}

export type RedditItem = RedditPost | RedditComment;
