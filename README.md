# AI Capsule 🧠

**Cloud-Deployed AI Prompt Manager**  
Full-Stack CRUD + OAuth + JWT + Real Cloud Deployment  
React + Node/Express · CSE3CWA / CSE5006 · Semester 2, 2026  
Designed by Dr Shuo Ding

---

## 1. Deployed URL

| Item | Value |
|------|-------|
| **Platform** | Render (free web service) |
| **Public URL** | `https://ai-capsule-XXXX.onrender.com` *(update after first deploy)* |
| **Health Check** | `https://ai-capsule-XXXX.onrender.com/api/health` |

> **Note:** Replace `ai-capsule-XXXX` with your actual Render service name after deployment.

---

## 2. Installation & Running Locally

### Prerequisites
- Node.js v18+
- A Google Cloud project with OAuth 2.0 credentials (see §5)

### Steps

```bash
# 1. Clone / unzip the project
cd "AI Capsule"

# 2. Install server dependencies
npm install

# 3. Install client dependencies
cd client && npm install && cd ..

# 4. Create your local environment file
cp .env.example .env
# Then edit .env and fill in real values (see §4)

# 5. Run the Express backend (port 3001)
npm run dev:server

# 6. In a second terminal, run the React dev server (port 5173)
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The Vite dev server proxies `/api/*`, `/login`, `/auth/*`, and `/logout` to `http://localhost:3001`, so cookies work seamlessly without CORS issues.

### Production Build (local test)
```bash
npm run build      # builds client/dist/
npm start          # serves frontend + API from port 3001
```

---

## 3. API Routes

| Method | Route | Access | Purpose |
|--------|-------|--------|---------|
| GET | `/api/health` | Public | Returns `{ "status": "ok" }` |
| GET | `/login` | Public | Redirects to Google OAuth consent screen |
| GET | `/auth/google/callback` | Public | OAuth callback — issues JWT cookie |
| GET | `/logout` | Public | Clears JWT cookie, redirects to `/` |
| GET | `/api/me` | JWT | Returns logged-in user info |
| GET | `/api/capsules` | JWT | List authenticated user's capsules |
| POST | `/api/capsules` | JWT | Create a new capsule |
| PUT | `/api/capsules/:id` | JWT | Update own capsule |
| DELETE | `/api/capsules/:id` | JWT | Delete own capsule |

The React frontend communicates with Express via `axios` calls with `{ withCredentials: true }`, which sends the `token` cookie automatically. In development, Vite proxies all `/api` requests to Express on port 3001. In production, both frontend and backend run on the same Render URL, so no CORS configuration is needed.

---

## 4. Environment Variables

Create a `.env` file in the project root (never commit this file):

```
PORT=3001
NODE_ENV=development

JWT_SECRET=<long random string, at least 32 chars>

GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# In dev: http://localhost:3001
# In prod: https://your-app.onrender.com
CLIENT_URL=http://localhost:3001
```

**Never put real secret values in README or source code.**

---

## 5. OAuth Configuration (Google)

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: `AI Capsule`
5. Authorised redirect URIs:
   - Dev: `http://localhost:3001/auth/google/callback`
   - Prod: `https://your-app.onrender.com/auth/google/callback`
6. Copy **Client ID** and **Client Secret** into `.env`

### OAuth → JWT Flow

1. User clicks "Continue with Google" on `/login` page
2. Browser is redirected to `GET /login` (Express route)
3. Express redirects to Google's OAuth consent screen with the configured scopes (`openid email profile`)
4. After consent, Google redirects to `GET /auth/google/callback?code=…`
5. Express exchanges the `code` for Google tokens via `https://oauth2.googleapis.com/token`
6. Express fetches the user's Google profile (ID, name, email, avatar) via `https://www.googleapis.com/oauth2/v2/userinfo`
7. Express signs its **own application JWT** using `jsonwebtoken` with the user's Google ID as `user_id`
8. The JWT is stored in a **`Secure`, `HttpOnly` cookie named `token`** — it is never exposed to JavaScript or localStorage
9. Express redirects to `/dashboard`
10. On subsequent requests, the browser automatically sends the `token` cookie; Express verifies it with `jwt.verify(token, JWT_SECRET)`

### JWT Verification

The `protect` middleware in `server/middleware/protect.js`:
- Reads `req.cookies.token`
- Calls `jwt.verify(token, process.env.JWT_SECRET)`
- Attaches `req.user = { user_id, username, avatar }` on success
- Returns `401 Unauthorized` if no cookie or if JWT is invalid/expired

All four `/api/capsules` routes use this middleware.

---

## 6. Database

### Technology
SQLite via **sql.js** (pure JavaScript — no native compilation required).

### Schema

```sql
CREATE TABLE IF NOT EXISTS capsules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  prompt_title TEXT NOT NULL,
  prompt_version TEXT,
  prompt_text TEXT NOT NULL,
  response_summary TEXT,
  category TEXT,
  usefulness TEXT,
  reviewed INTEGER DEFAULT 0,
  improved INTEGER DEFAULT 0,
  screenshot_url TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

The table is created automatically when the server starts (if it doesn't already exist).

### User Ownership

`user_id` is the Google user ID obtained from the verified JWT — it is **never** accepted from the frontend request body.

- **CREATE**: `user_id` is inserted from `req.user.user_id`
- **READ**: `WHERE user_id = req.user.user_id`
- **UPDATE**: `WHERE id = ? AND user_id = req.user.user_id` — cannot update another user's record
- **DELETE**: `WHERE id = ? AND user_id = req.user.user_id` — cannot delete another user's record

### Storage Persistence

**⚠️ Limitation:** Render's free tier uses an **ephemeral filesystem**. The `capsules.db` file is stored on Render's local disk and **will be lost on redeploy or restart**. For persistent storage, Render PostgreSQL or an external database would be required. This is documented here as required by the assignment.

---

## 7. cURL Test Commands

Run these against the deployed URL before submission:

### Test 1 — No authentication (must return 401)
```bash
curl -i https://ai-capsule-XXXX.onrender.com/api/capsules
```
**Expected output:**
```
HTTP/2 401
{"error":"Authentication required. No token provided."}
```

### Test 2 — Fake / invalid JWT (must return 401)
```bash
curl -i -H "Cookie: token=fake-token-123" https://ai-capsule-XXXX.onrender.com/api/capsules
```
**Expected output:**
```
HTTP/2 401
{"error":"Invalid or expired token."}
```

*(Update the URL with your actual Render URL before running.)*

---

## 8. One Limitation

**Ephemeral SQLite storage on Render free tier:** Because Render's free tier does not provide persistent disk storage, all capsule records are lost when the service restarts or redeploys. A production application would use Render PostgreSQL, Supabase, PlanetScale or another persistent database service. The assignment spec explicitly notes this limitation is acceptable for submission.

---

## 9. AI-Assisted Development

### Tools Used
- **Google Gemini (Antigravity IDE)** — used extensively for scaffolding, component structure, Express routes, SQLite integration, OAuth/JWT flow, CSS design system, and debugging.
- **ChatGPT** — used for reference on Google OAuth 2.0 redirect URI configuration and sql.js async patterns.

### Problem Found and Corrected in AI-Generated Code

**Problem:** The initial AI-generated database code used `better-sqlite3`, a native Node.js addon that requires Visual Studio C++ build tools to compile on Windows. This caused `npm install` to fail with `gyp ERR! find VS` errors on the development machine.

**Correction:** Switched to `sql.js` (a pure JavaScript port of SQLite compiled to WebAssembly). The `db.js` module was rewritten to use `initSqlJs()` asynchronously and to persist the in-memory database to disk with `saveDb()` after every write operation. This required making all route handlers `async` and updating the capsules router accordingly.

### Verification of OAuth + JWT + Protected API

1. Started the Express server locally with `npm run dev:server`
2. Opened the Vite dev server on port 5173
3. Clicked "Continue with Google" — browser redirected to Google consent screen
4. Completed consent → was redirected to `/dashboard`
5. Opened DevTools → Application → Cookies → confirmed `token` cookie is `HttpOnly` and inaccessible from JavaScript
6. Ran `curl -i http://localhost:3001/api/capsules` without cookie → confirmed `401`
7. Ran `curl -i -H "Cookie: token=fake-token-123" http://localhost:3001/api/capsules` → confirmed `401`
8. Logged in and used the dashboard to perform CREATE, READ, UPDATE and DELETE

### Verification of CRUD + Ownership

- Created a capsule → confirmed it appeared in the list
- Updated the capsule → confirmed changed fields persisted
- Deleted the capsule → confirmed it was removed from the list
- The `user_id` field is never sent from the browser — it is always read from `req.user.user_id` (the verified JWT payload)
- UPDATE and DELETE routes include `AND user_id = ?` in the SQL WHERE clause, preventing cross-user access

### Key Decision: Single-Origin Deployment (Express Serves React Build)

In production, I chose to serve the React `dist/` build as static files directly from Express, rather than deploying the frontend and backend as two separate Render services. This decision eliminates all same-site cookie and CORS complexity: the `token` cookie has `sameSite: 'lax'` and is automatically sent with every API request because both the page and the API share the same origin. It also simplifies the Render deployment to a single service with one URL.

---

## 10. Project Structure

```
AI Capsule/
├── client/                  # React (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── CapsuleCard.jsx
│   │   │   ├── CapsuleForm.jsx
│   │   │   └── Modal.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/
│   ├── middleware/
│   │   └── protect.js       # JWT verify middleware
│   ├── routes/
│   │   ├── health.js        # GET /api/health
│   │   └── capsules.js      # CRUD /api/capsules
│   ├── auth.js              # Google OAuth + JWT issuance
│   ├── db.js                # sql.js SQLite wrapper
│   └── index.js             # Express entry point
├── .env.example
├── .gitignore
├── package.json
├── render.yaml
└── README.md
```
