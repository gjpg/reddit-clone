import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import * as dotenv from 'dotenv';

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

app.post('/api/token', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    console.error('No code provided in request body');
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing CLIENT_ID or CLIENT_SECRET in environment');
    return res.status(500).json({ error: 'Server configuration error' });
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
        redirect_uri: 'http://localhost:3000/callback'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`
        }
      }
    );

    console.log('Reddit responded with:', response.data);

    // Send a success response with the token data only
    res.json(response.data);
  } catch (error) {
    console.error('Reddit token exchange failed:');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error('Error message:', error.message);
      res.status(500).json({ error: 'Token exchange failed' });
    }
  }
});

// New endpoint: Proxy Reddit user info request
app.get('/api/user', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const redditResponse = await axios.get('https://oauth.reddit.com/api/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'YourAppName/0.1 by YourRedditUsername'
      }
    });

    res.json(redditResponse.data);
  } catch (error) {
    console.error('Failed to fetch user info from Reddit:', error.message);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Failed to fetch user info' });
    }
  }
});

app.get('/api/posts/:subreddit', async (req, res) => {
  const { subreddit } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const response = await axios.get(`https://oauth.reddit.com/r/${subreddit}/hot`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'RedditOAuthDemo/0.1 by YourRedditUsername'
      },
      params: {
        limit: 25
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching subreddit posts:', error.message);
    if (axios.isAxiosError(error) && error.response) {
      console.error(error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Unknown error fetching subreddit posts' });
    }
  }
});

app.get('/api/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const accessToken = authHeader.split(' ')[1];

  console.log('accessToken:', accessToken);

  try {
    const response = await axios.get('https://oauth.reddit.com/api/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'RedditOAuthDemo/0.1 by /u/gibbodaman'
      }
    });
    console.log('User data:', response.data);
    res.json(response.data); // <-- Send user data back to client here
  } catch (error) {
    if (error.response) {
      console.error('API error status:', error.response.status);
      console.error('API error body:', error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
      res.status(500).json({ error: 'No response received from Reddit' });
    } else {
      console.error('Axios error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
