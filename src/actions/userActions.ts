import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Post, UserComment, RedditAPIUser } from '../types';

export const fetchUserInfo = createAsyncThunk<
  RedditAPIUser,
  { token: string; username: string },
  { rejectValue: string }
>('user/fetchUserInfo', async ({ token, username }, thunkAPI) => {
  try {
    const response = await fetch(`https://oauth.reddit.com/user/${username}/about`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user info');
    }

    const json = await response.json();
    const data = json.data;

    const user: RedditAPIUser = {
      id: data.id,
      name: data.name,
      icon_img: data.icon_img?.split('?')[0],
      created_utc: data.created_utc,
      link_karma: data.link_karma,
      comment_karma: data.comment_karma
    };

    return user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
  }
});

export const fetchUserPosts = createAsyncThunk<
  Post[],
  { token: string; username: string },
  { rejectValue: string }
>('user/fetchUserPosts', async ({ token, username }, thunkAPI) => {
  try {
    const res = await fetch(`https://oauth.reddit.com/user/${username}/submitted`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const error = await res.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user posts');
    }

    const data = await res.json();

    const posts: Post[] = data.data.children.map((post: any) => ({
      id: post.data.id,
      title: post.data.title,
      author: post.data.author,
      url: post.data.url,
      subreddit_name_prefixed: post.data.subreddit_name_prefixed,
      thumbnail: post.data.thumbnail,
      created_utc: post.data.created_utc,
      permalink: post.data.permalink,
      score: post.data.score ?? 'hidden',
      likes: post.data.likes ?? null,
      archived: post.data.archived ?? false,
      kind: 'post' // ✅ add kind
    }));

    return posts;
  } catch {
    return thunkAPI.rejectWithValue('Failed to fetch user posts');
  }
});

export const fetchUserComments = createAsyncThunk<
  UserComment[],
  { token: string; username: string },
  { rejectValue: string }
>('user/fetchUserComments', async ({ token, username }, thunkAPI) => {
  try {
    const res = await fetch(`https://oauth.reddit.com/user/${username}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const error = await res.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user comments');
    }

    const data = await res.json();

    const comments: UserComment[] = data.data.children.map((comment: any) => ({
      id: comment.data.id,
      body: comment.data.body,
      created_utc: comment.data.created_utc,
      author: comment.data.author,
      permalink: comment.data.permalink,
      subreddit_name_prefixed: comment.data.subreddit_name_prefixed,
      score: comment.data.score ?? 'hidden',
      likes: comment.data.likes ?? null,
      archived: comment.data.archived ?? false,
      kind: 'comment' // ✅ add kind
    }));

    return comments;
  } catch {
    return thunkAPI.rejectWithValue('Failed to fetch user comments');
  }
});

export const fetchUserActivity = createAsyncThunk<
  { posts: Post[]; comments: UserComment[] },
  { token: string; username: string; sort?: string },
  { rejectValue: string }
>('user/fetchUserActivity', async ({ token, username, sort = 'new' }, thunkAPI) => {
  try {
    const query = `?sort=${sort}`;

    const postsRes = await fetch(`https://oauth.reddit.com/user/${username}/submitted${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!postsRes.ok) {
      const error = await postsRes.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user posts');
    }

    const postsJson = await postsRes.json();
    const posts: Post[] = postsJson.data.children.map((post: any) => ({
      id: post.data.id,
      title: post.data.title,
      author: post.data.author,
      url: post.data.url,
      subreddit_name_prefixed: post.data.subreddit_name_prefixed,
      thumbnail: post.data.thumbnail,
      created_utc: post.data.created_utc,
      permalink: post.data.permalink,
      score: post.data.score ?? 'hidden',
      likes: post.data.likes ?? null,
      archived: post.data.archived ?? false,
      kind: 'post' // ✅ add kind
    }));

    const commentsRes = await fetch(`https://oauth.reddit.com/user/${username}/comments${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!commentsRes.ok) {
      const error = await commentsRes.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user comments');
    }

    const commentsJson = await commentsRes.json();
    const comments: UserComment[] = commentsJson.data.children.map((comment: any) => ({
      id: comment.data.id,
      body: comment.data.body,
      created_utc: comment.data.created_utc,
      author: comment.data.author,
      permalink: comment.data.permalink,
      subreddit_name_prefixed: comment.data.subreddit_name_prefixed,
      score: comment.data.score ?? 'hidden',
      likes: comment.data.likes ?? null,
      archived: comment.data.archived ?? false,
      kind: 'comment' // ✅ add kind
    }));

    console.log('Reddit postsData:', postsJson);
    console.log('Reddit commentsData:', commentsJson);

    return { posts, comments };
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to fetch user activity');
  }
});
