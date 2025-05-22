// types/post.ts (or add to types.ts if you consolidate later)
export type Post = {
  id: string;
  title: string;
  author: string;
  url: string;
  subreddit_name_prefixed: string;
  thumbnail?: string;
  created_utc: number;
};