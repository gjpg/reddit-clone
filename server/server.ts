import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';

import { Request, Response } from 'express'; // This works fine with esModuleInterop and CommonJS

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3001; // Use environment variable for port, fallback to 3001

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:3000' // Allow frontend to make requests
  })
);

// Parse JSON request bodies
app.use(bodyParser.json());

app.post('/api/token', async (req: Request, res: Response): Promise<void> => {
  const { code } = req.body;

  if (!code) {
    console.error('No code provided in request body');
    res.status(400).json({ error: 'Missing authorization code' });
    return;
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing CLIENT_ID or CLIENT_SECRET in environment');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  console.log('Exchanging code for token with Reddit...');
  console.log('Code:', code);

  try {
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.REDIRECT_URI}`
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`
        }
      }
    );

    console.log('Reddit responded with:', response.data);

    // Send a success response with the token
    res.json({ message: 'Token exchange successful', data: response.data });
  } catch (error: any) {
    console.error('Reddit token exchange failed:');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }

    res.status(500).json({ error: 'Token exchange failed' });
  }
});

app.get('/api/posts', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const redditRes = await axios.get('https://oauth.reddit.com/best', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': `web:myredditviewer:v1.0.0 (by /u/${process.env.REDDIT_USERNAME})`
      }
    });

    const posts = redditRes.data.data.children.map(({ data }: any) => {
      let thumbnail = data.thumbnail?.replace(/&amp;/g, '&');

      const isValid =
        thumbnail && thumbnail.startsWith('http') && !['self', 'default', 'nsfw', 'image'].includes(thumbnail);

      if (!isValid && data.preview?.images?.[0]?.source?.url) {
        thumbnail = data.preview.images[0].source.url.replace(/&amp;/g, '&');
      }
      // console.log('Thumbnail for', data.title, ':', thumbnail);
      return {
        id: data.id,
        title: data.title,
        author: data.author,
        url: data.url,
        subreddit_name_prefixed: data.subreddit_name_prefixed,
        thumbnail
      };
    });

    res.json({ posts });
  } catch (error) {
    console.error('Failed to fetch Reddit posts', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.get('/api/me', async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const redditRes = await axios.get('https://oauth.reddit.com/api/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': `web:myredditviewer:v1.0.0 (by /u/${process.env.REDDIT_USERNAME})`
      }
    });

    const userData = redditRes.data;

    const accountCreatedDate = new Date(userData.created_utc * 1000);
    const now = new Date();
    const accountAgeYears = ((now.getTime() - accountCreatedDate.getTime()) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);

    res.json({
      username: userData.name,
      linkKarma: userData.link_karma,
      commentKarma: userData.comment_karma,
      accountAge: parseFloat(accountAgeYears)
    });
  } catch (error) {
    console.error('Failed to fetch user info from Reddit', error);

    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json({ error: error.response.data.message || 'Failed to fetch user info' });
      return;
    }

    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

app.post('/api/refresh_token', async (req: Request, res: Response): Promise<void> => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    res.status(400).json({ error: 'Missing refresh token' });
    return;
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Refresh token failed:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
