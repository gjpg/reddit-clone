import { createAsyncThunk } from '@reduxjs/toolkit';
import type { UserInfo, RedditItem } from '../types';

export const fetchUserInfo = createAsyncThunk<UserInfo, { token: string; username: string }, { rejectValue: string }>(
  'user/fetchUserInfo',
  async ({ token, username }, thunkAPI) => {
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

      // Map fields:
      return {
        username: data.name,
        accountAge: Math.floor((Date.now() / 1000 - data.created_utc) / (60 * 60 * 24 * 365)), // seconds to years
        linkKarma: data.link_karma,
        commentKarma: data.comment_karma
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchUserPosts = createAsyncThunk<
  RedditItem[],
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

    return data.data.children.map(
      (post: any): RedditItem => ({
        id: post.data.id,
        author: post.data.author,
        created_utc: post.data.created_utc,
        permalink: post.data.permalink,
        kind: 'post',
        title: post.data.title,
        url: post.data.url,
        subreddit_name_prefixed: post.data.subreddit_name_prefixed,
        thumbnail: post.data.thumbnail,
        score: post.data.score
      })
    );
  } catch {
    return thunkAPI.rejectWithValue('Failed to fetch user posts');
  }
});

export const fetchUserComments = createAsyncThunk<
  RedditItem[],
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

    return data.data.children.map(
      (comment: any): RedditItem => ({
        id: comment.data.id,
        author: comment.data.author,
        created_utc: comment.data.created_utc,
        permalink: comment.data.permalink,
        kind: 'comment',
        body: comment.data.body,
        score: comment.data.score
      })
    );
  } catch {
    return thunkAPI.rejectWithValue('Failed to fetch user comments');
  }
});

export const fetchUserActivity = createAsyncThunk<
  RedditItem[],
  { token: string; username: string; sort?: string },
  { rejectValue: string }
>('user/fetchUserActivity', async ({ token, username, sort = 'new' }, thunkAPI) => {
  try {
    const query = `?sort=${sort}`;

    // Fetch posts
    const postsRes = await fetch(`https://oauth.reddit.com/user/${username}/submitted${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!postsRes.ok) {
      const error = await postsRes.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user posts');
    }

    const postsJson = await postsRes.json();
    const posts: RedditItem[] = postsJson.data.children.map(
      (post: any): RedditItem => ({
        id: post.data.id,
        author: post.data.author,
        created_utc: post.data.created_utc,
        permalink: post.data.permalink,
        kind: 'post',
        title: post.data.title,
        url: post.data.url,
        subreddit_name_prefixed: post.data.subreddit_name_prefixed,
        thumbnail: post.data.thumbnail,
        score: post.data.score
      })
    );

    // Fetch comments
    const commentsRes = await fetch(`https://oauth.reddit.com/user/${username}/comments${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!commentsRes.ok) {
      const error = await commentsRes.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user comments');
    }

    const commentsJson = await commentsRes.json();
    const comments: RedditItem[] = commentsJson.data.children.map(
      (comment: any): RedditItem => ({
        id: comment.data.id,
        author: comment.data.author,
        created_utc: comment.data.created_utc,
        permalink: comment.data.permalink,
        kind: 'comment',
        body: comment.data.body,
        score: comment.data.score   
      })
    );

    // Combine and sort
    const combined = [...posts, ...comments].sort((a, b) => b.created_utc - a.created_utc);
    return combined;
  } catch (error) {
    return thunkAPI.rejectWithValue('Failed to fetch user activity');
  }
});
