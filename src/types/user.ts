export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  error: string | null;
  // add any other user fields you need
}

export type UserInfo = {
  username: string;
  accountAge: number;
  linkKarma: number;
  commentKarma: number;
};


export type UserPost = {
  id: string;
  title: string;
  permalink: string;
};

export type UserComment = {
  id: string;
  body: string;
  created_utc: number;
};