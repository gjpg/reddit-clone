import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Post } from '../../types/post';
import type { RedditPost, RedditComment } from '../../types/reddit';
import { voteOnItem } from '../../actions/voteActions';

interface PostsState {
  posts: Post[];
  userPosts: RedditPost[]; // user submitted posts
  userComments: RedditComment[]; // user comments
  loading: boolean;
  userActivityLoading: boolean;
  error: string | null;
  userActivityError: string | null;
  selectedPost: Post | null;
  comments: RedditComment[];
}

const initialState: PostsState = {
  posts: [],
  userPosts: [],
  userComments: [],
  loading: false,
  userActivityLoading: false,
  error: null,
  userActivityError: null,
  selectedPost: null,
  comments: []
};

export const fetchPostDetails = createAsyncThunk<
  { post: Post; comments: RedditComment[] },
  { subreddit: string; postId: string },
  { rejectValue: string }
>('posts/fetchPostDetails', async ({ subreddit, postId }, thunkAPI) => {
  try {
    const token = localStorage.getItem('reddit_access_token');
    if (!token) return thunkAPI.rejectWithValue('Missing access token');

    const res = await fetch(`https://oauth.reddit.com/r/${subreddit}/comments/${postId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const error = await res.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch post');
    }

    const data = await res.json();
    const postData = data[0]?.data?.children?.[0]?.data;
    const commentsData = data[1]?.data?.children || [];

    // Map post to your Post type
    const post: Post = {
      id: postData.id,
      title: postData.title,
      author: postData.author,
      url: postData.url,
      subreddit_name_prefixed: postData.subreddit_name_prefixed,
      thumbnail: postData.thumbnail,
      created_utc: postData.created_utc,
      permalink: postData.permalink,
      score: postData.score ?? 0,
      likes: postData.likes ?? null,
      archived: postData.archived ?? false,
      selftext: postData.selftext,
      kind: 'post',
      is_video: postData.is_video ?? false,
      media: postData.media,
      comments: [] // optional
    };

    // Helper to recursively flatten nested Reddit comments and include parent_id
   const flattenComments = (children: any[]): RedditComment[] => {
  const flat: RedditComment[] = [];

  for (const item of children) {
    if (item.kind !== 't1') continue;
    const c = item.data;

    flat.push({
      id: c.id,
      author: c.author,
      created_utc: c.created_utc,
      permalink: c.permalink,
      kind: 'comment',
      body: c.body,
      subreddit_name_prefixed: c.subreddit_name_prefixed,
      score: c.score ?? 0,
      likes: c.likes ?? null,
      archived: c.archived ?? false,
      parent_id: c.parent_id // included here
    });

    if (c.replies?.data?.children?.length > 0) {
      flat.push(...flattenComments(c.replies.data.children));
    }
  }

  return flat;
};


    const mappedComments = flattenComments(commentsData);

    return { post, comments: mappedComments };
  } catch {
    return thunkAPI.rejectWithValue('Network error');
  }
});



// Frontpage posts thunk
export const fetchPosts = createAsyncThunk<Post[], string, { rejectValue: string }>(
  'posts/fetchPosts',
  async (token, thunkAPI) => {
    try {
      const res = await fetch('http://localhost:3001/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        return thunkAPI.rejectWithValue(errorData.error || 'Failed to fetch posts');
      }

      const data = await res.json();
      return data.posts; // assuming backend returns { posts: Post[] }
    } catch {
      return thunkAPI.rejectWithValue('Network error');
    }
  }
);

// User activity thunk (fetch posts and comments separately)
export const fetchUserActivity = createAsyncThunk<
  { posts: RedditPost[]; comments: RedditComment[] },
  { token: string; username: string },
  { rejectValue: string }
>('posts/fetchUserActivity', async ({ token, username }, thunkAPI) => {
  try {
    // Fetch user posts
    const postsRes = await fetch(`https://oauth.reddit.com/user/${username}/submitted`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!postsRes.ok) {
      const error = await postsRes.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user posts');
    }
    const postsData = await postsRes.json();

    // Fetch user comments
    const commentsRes = await fetch(`https://oauth.reddit.com/user/${username}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!commentsRes.ok) {
      const error = await commentsRes.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to fetch user comments');
    }
    const commentsData = await commentsRes.json();

    // Map posts
    const mappedPosts: RedditPost[] = postsData.data.children.map((post: any) => ({
      id: post.data.id,
      author: post.data.author,
      created_utc: post.data.created_utc,
      permalink: post.data.permalink,
      kind: 'post',
      title: post.data.title,
      url: post.data.url,
      subreddit_name_prefixed: post.data.subreddit_name_prefixed,
      thumbnail: post.data.thumbnail,
      score: post.data.score ?? 0,
      likes: post.data.likes ?? null,
      archived: post.data.archived ?? false
    }));

    // Map comments
    const mappedComments: RedditComment[] = commentsData.data.children.map((comment: any) => ({
      id: comment.data.id,
      author: comment.data.author,
      created_utc: comment.data.created_utc,
      permalink: comment.data.permalink,
      kind: 'comment',
      body: comment.data.body,
      subreddit_name_prefixed: comment.data.subreddit_name_prefixed,
      score: comment.data.score ?? 0,
      likes: comment.data.likes ?? null,
      archived: comment.data.archived ?? false
    }));

    return { posts: mappedPosts, comments: mappedComments };
  } catch {
    return thunkAPI.rejectWithValue('Failed to fetch user activity');
  }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPosts(state) {
      state.posts = [];
      state.error = null;
      state.loading = false;
    },
    clearUserActivity(state) {
      state.userPosts = [];
      state.userComments = [];
      state.userActivityError = null;
      state.userActivityLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // frontpage posts handlers
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch posts';
        state.loading = false;
      })

      // user activity handlers
      .addCase(fetchUserActivity.pending, (state) => {
        state.userActivityLoading = true;
        state.userActivityError = null;
      })
      .addCase(
        fetchUserActivity.fulfilled,
        (state, action: PayloadAction<{ posts: RedditPost[]; comments: RedditComment[] }>) => {
          state.userPosts = action.payload.posts;
          state.userComments = action.payload.comments;
          state.userActivityLoading = false;
        }
      )
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.userActivityError = action.payload || 'Failed to fetch user activity';
        state.userActivityLoading = false;
      })
      .addCase(fetchPostDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedPost = null;
        state.comments = [];
      })
    .addCase(fetchPostDetails.fulfilled, (state, action) => {
  state.selectedPost = action.payload.post;

  // ✅ Keep raw Reddit API format for rendering nested replies
  state.comments = action.payload.comments;

  state.loading = false;
})

      .addCase(fetchPostDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch post details';
      })
      .addCase(voteOnItem.fulfilled, (state, action) => {
        const { id, dir, type } = action.payload;

        const adjustScore = (item: { likes?: boolean | null; score: number | 'hidden' }, dir: number) => {
          if (item.score === 'hidden') return;

          if (item.likes === true && dir === 0) {
            item.score -= 1;
          } else if (item.likes === false && dir === 0) {
            item.score += 1;
          } else if (item.likes === true && dir === -1) {
            item.score -= 2;
          } else if (item.likes === false && dir === 1) {
            item.score += 2;
          } else if (item.likes == null) {
            item.score += dir;
          }

          item.likes = dir === 1 ? true : dir === -1 ? false : null;
        };

        if (type === 'post') {
          const post = state.posts.find((p) => p.id === id);
          if (post) {
            adjustScore(post, dir);
          }

          if (state.selectedPost?.id === id) {
            adjustScore(state.selectedPost, dir);
          }
        } else if (type === 'comment') {
          const comment = state.comments.find((c) => c.id === id);
          if (comment) {
            adjustScore(comment, dir);
          }

          for (const post of state.posts) {
            const commentInPost = post.comments?.find((c) => c.id === id);
            if (commentInPost) {
              adjustScore(commentInPost, dir);
              break;
            }
          }
        }
      });
  }
});

export const { clearPosts, clearUserActivity } = postsSlice.actions;

export const selectPosts = (state: RootState) => state.posts.posts;
export const selectPostsLoading = (state: RootState) => state.posts.loading;
export const selectPostsError = (state: RootState) => state.posts.error;

export const selectUserPosts = (state: RootState) => state.posts.userPosts;
export const selectUserComments = (state: RootState) => state.posts.userComments;
export const selectUserActivityLoading = (state: RootState) => state.posts.userActivityLoading;
export const selectUserActivityError = (state: RootState) => state.posts.userActivityError;

export default postsSlice.reducer;
