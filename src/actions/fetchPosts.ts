import { createAsyncThunk } from '@reduxjs/toolkit';

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (accessToken: string, thunkAPI) => {
    try {
      const response = await fetch('http://localhost:3001/api/posts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData);
      }

      const data = await response.json();
      return data; // expecting an array of posts
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return thunkAPI.rejectWithValue({ error: errorMessage });
    }
  }
);
