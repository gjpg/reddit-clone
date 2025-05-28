// The main authenticated Reddit user object
export interface User {
  id: string;
  name: string; // Reddit username
  icon_img?: string; // Reddit avatar URL
  created_utc?: number; // Account creation timestamp
  link_karma?: number;
  comment_karma?: number;
  email?: string; // For future OAuth email scope
  error?: string | null; // For error info in some responses
}

// User post type, separate from RedditPost if needed
// export interface UserPost {
//   id: string;
//   title: string;
//   permalink: string;
//   subreddit?: string;
//   score?: number | 'hidden';
//   created_utc?: number;
//   thumbnail?: string;
//   likes?: boolean | null;
//   archived?: boolean;
//   // optionally add `kind` if you want discrimination here too
// }

// // User comment type, separate from RedditComment if needed
// export interface UserComment {
//   id: string;
//   body: string;
//   created_utc: number;
//   author: string;
//   permalink: string;
//   subreddit_name_prefixed: string;
//   score?: number | 'hidden';
//   likes?: boolean | null;
//   archived?: boolean;
//   // optionally add `kind` here too
// }

// Exact shape returned by Reddit's /api/v1/me
export interface RedditAPIUser {
  id: string;
  name: string;
  icon_img?: string;
  created_utc?: number;
  link_karma?: number;
  comment_karma?: number;
  // add other Reddit API fields as needed
}
