import { createAsyncThunk } from '@reduxjs/toolkit';
import type { UserInfo, UserPost, UserComment } from '../types';

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
  UserPost[],
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
    // map data as needed to UserPost[]
    return data.data.children.map((post: any) => ({
      id: post.data.id,
      title: post.data.title,
      permalink: post.data.permalink
    }));
  } catch (e) {
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
    // map data as needed to UserComment[]
    return data.data.children.map((comment: any) => ({
      id: comment.data.id,
      body: comment.data.body
    }));
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to fetch user comments');
  }
});
