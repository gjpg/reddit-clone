import { createAsyncThunk } from '@reduxjs/toolkit';

export const voteOnItem = createAsyncThunk<
  { id: string; dir: 1 | 0 | -1; type: 'post' | 'comment' },
  { id: string; dir: 1 | 0 | -1; type: 'post' | 'comment'; token: string },
  { rejectValue: string }
>('vote/voteOnItem', async ({ id, dir, token, type }, thunkAPI) => {
  try {
    const fullname = `${type === 'post' ? 't3_' : 't1_'}${id}`;

    const res = await fetch('https://oauth.reddit.com/api/vote', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ id: fullname, dir: String(dir) }),
    });

    if (!res.ok) {
      const error = await res.json();
      return thunkAPI.rejectWithValue(error.message || 'Failed to vote');
    }

    return { id, dir, type };
  } catch (error) {
    return thunkAPI.rejectWithValue('Vote failed');
  }
});
