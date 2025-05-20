import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 3001; // Use environment variable for port, fallback to 3001

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Allow frontend to make requests
  })
);

// Parse JSON request bodies
app.use(bodyParser.json());

app.post("/api/token", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    console.error("No code provided in request body");
    return res.status(400).json({ error: "Missing authorization code" });
  }

  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing CLIENT_ID or CLIENT_SECRET in environment");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  console.log("Exchanging code for token with Reddit...");
  console.log("Code:", code);

  try {
    const response = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://localhost:3000/callback",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
      }
    );

    console.log("Reddit responded with:", response.data);

    // Send a success response with the token
    res.json({ message: "Token exchange successful", data: response.data });
  } catch (error) {
    console.error("Reddit token exchange failed:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error message:", error.message);
    }

    res.status(500).json({ error: "Token exchange failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
