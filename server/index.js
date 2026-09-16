require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRouter = require('./auth');
const healthRouter = require('./routes/health');
const capsulesRouter = require('./routes/capsules');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS: in dev, allow the Vite dev server origin.
// In production, the React build is served from the same origin, so CORS is not needed.
if (!isProd) {
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true, // allow cookies to be sent cross-origin in dev
    })
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public auth routes: /login, /auth/google/callback, /logout, /api/me
app.use(authRouter);

// Public health check: /api/health
app.use(healthRouter);

// Protected CRUD routes: /api/capsules (all verbs)
app.use(capsulesRouter);

// ─── Serve React in Production ────────────────────────────────────────────────

const clientDist = path.join(__dirname, '..', 'client', 'dist');
const fs = require('fs');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // All non-API routes fall through to React's index.html (client-side routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log('Serving React build from:', clientDist);
} else {
  console.warn('No client/dist found — React build missing!');
}

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`AI Capsule server running on port ${PORT} [${isProd ? 'production' : 'development'}]`);
});
