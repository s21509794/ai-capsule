const express = require('express');
const jwt = require('jsonwebtoken');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const router = express.Router();

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────

/**
 * GET /login
 * Redirects the browser to GitHub's OAuth authorisation page.
 */
router.get('/login', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: `${process.env.CLIENT_URL}/auth/github/callback`,
    scope: 'read:user user:email',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

/**
 * GET /auth/github/callback
 * Handles the GitHub OAuth callback:
 *  1. Exchanges the authorisation code for a GitHub access token
 *  2. Fetches the user's GitHub profile (id, login, avatar_url, email)
 *  3. Signs our own application JWT with JWT_SECRET
 *  4. Stores it in a Secure, HttpOnly cookie named "token"
 *  5. Redirects to /dashboard
 *
 * NOTE: The GitHub access token is used ONLY to fetch the user profile and is
 *       then discarded.  The cookie holds our own application JWT — not the
 *       GitHub token.
 */
router.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code missing.' });
  }

  try {
    // Step 1 – Exchange code for GitHub access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.CLIENT_URL}/auth/github/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      console.error('GitHub token exchange error:', tokenData);
      return res.status(401).json({ error: 'GitHub OAuth token exchange failed.' });
    }

    // Step 2 – Fetch the GitHub user profile (id, login, avatar_url)
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'AI-Capsule-App',
      },
    });
    const githubUser = await userResponse.json();

    // Fetch primary email if not public on profile
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'AI-Capsule-App',
        },
      });
      const emails = await emailResponse.json();
      const primary = emails.find((e) => e.primary && e.verified);
      email = primary ? primary.email : null;
    }

    // Step 3 – Sign our OWN application JWT (NOT the GitHub access token)
    // user_id = GitHub numeric user ID (string) — unique and immutable
    const appJwt = jwt.sign(
      {
        user_id: String(githubUser.id),
        username: githubUser.login,
        email: email,
        avatar: githubUser.avatar_url,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Step 4 – Store in Secure, HttpOnly cookie named "token"
    const isProd = process.env.NODE_ENV !== 'development';
    res.cookie('token', appJwt, {
      httpOnly: true,
      secure: isProd,       // true = HTTPS only in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Step 5 – Redirect to protected dashboard
    res.redirect('/dashboard');
  } catch (err) {
    console.error('GitHub OAuth callback error:', err);
    res.status(500).json({ error: 'Internal server error during OAuth.' });
  }
});

/**
 * GET /logout
 * Clears the token cookie and redirects to the landing page.
 */
router.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
  });
  res.redirect('/');
});

/**
 * GET /api/me
 * Returns the currently authenticated user from the JWT.
 * Used by the React frontend to know who is logged in without exposing the JWT.
 */
router.get('/api/me', (req, res) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      user_id: decoded.user_id,
      username: decoded.username,
      email: decoded.email,
      avatar: decoded.avatar,
    });
  } catch {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

module.exports = router;
