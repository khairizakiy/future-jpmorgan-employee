# Future JP Morgan President Khairi Nugroho Portfolio

Hi, this is my personal portfolio website built in the Swiss Style with Neo-Brutalist architecture. It combines **React**, **Vite**, and an **Express / Cloudflare Pages Functions** backend integrated directly with **Supabase** (PostgreSQL) for database records and media storage.

* **Live Site**: [https://khairi.fun](https://khairi.fun)
* **Admin Portal**: [https://khairi.fun/admin](https://khairi.fun/admin)

---

## Repository Structure & Folder Guide

```text
portfolio/
├── functions/                     # Cloudflare Pages Functions (Serverless Edge API)
│   └── api/
│       └── [[route]].js           # Catch-all Edge router for /api endpoints on khairi.fun
├── public/                        # Static assets served at domain root
│   ├── fonts/                     # Typography files (FK Screamer, Space Mono, IBM Plex Mono)
│   ├── uploads/                   # Project & gallery images synced with Supabase Storage
│   ├── apple-touch-icon.png       # iOS home screen icon (180x180)
│   ├── favicon.ico                # Standard browser favicon (32x32)
│   ├── favicon.png                # High-resolution PNG favicon (64x64)
│   ├── favicon.svg                # Vector SVG razor-blade icon
│   └── khairinugroho.jpeg         # High-resolution official portrait photo
├── server/                        # Local Node.js / Express development backend
│   ├── db.js                      # Supabase data access layer & database methods
│   └── index.js                   # Express API server with JWT authentication (port 4000)
├── src/                           # React 19 Frontend application (Vite)
│   ├── components/                # Reusable UI components
│   │   └── Header.jsx             # Terminal header navigation bar with route indicator
│   ├── pages/                     # Application page views
│   │   ├── Admin.jsx              # Full admin dashboard (Profile, Work, Music, Cat, etc.)
│   │   ├── CatPage.jsx            # Interactive cat page (Mochi) with live pat counter
│   │   ├── FriendsPage.jsx        # 35mm film photography snapshot gallery
│   │   ├── Home.jsx               # Main portfolio view (Bio, Experience, Projects)
│   │   ├── MusicPage.jsx          # Vinyl crate browser with infinite marquee player
│   │   └── TiguanPage.jsx         # 2021 VW Tiguan R-Line build sheet & mod specs
│   ├── api.js                     # Client-side API fetch client with JWT Bearer auth
│   ├── App.jsx                    # Root React component & router view container
│   ├── index.css                  # Swiss Neo-Brutalist design system & styling
│   ├── main.jsx                   # React DOM entry point
│   └── router.js                  # Lightweight client-side router
├── tools/                         # Maintenance, test & seed scripts
│   ├── migrate-to-supabase.js     # Health check & table readiness verification script
│   └── seed-khairinugroho-data.js # Populates Supabase with complete portfolio records
├── .env.example                   # Template for required environment variables
├── index.html                     # HTML shell with meta tags, fonts & Tailwind CDN
├── package.json                   # Dependencies, scripts & build configuration
├── supabase-schema.sql            # Complete Supabase SQL migration script & RLS policies
├── vite.config.js                 # Vite build & development proxy configuration
└── wrangler.toml                  # Cloudflare Pages deployment & nodejs_compat configuration
```

---

## Detailed Directory Breakdown

### `functions/` — Cloudflare Pages Serverless Edge API
Powers the production backend for **`https://khairi.fun/api/*`** at the edge:
* **`functions/api/[[route]].js`**: A universal catch-all serverless function deployed on Cloudflare Pages. It directly connects to Supabase via `@supabase/supabase-js`, verifies JWT tokens for administrative actions, handles multipart media uploads to Supabase Storage, and aggregates full portfolio records with sub-millisecond edge latency.

### `public/` — Static Web Assets
Static files served directly at the root (`/`) of the domain:
* **`favicon.*`**: Optimized SVG, PNG (64x64), and ICO (32x32) favicon formats for browser tabs, bookmarks, and mobile home screens.
* **`fonts/`**: Self-hosted custom typefaces (**IBM Plex Mono**, **Space Mono**, and **FK Screamer**).
* **`khairinugroho.jpeg`**: High-resolution official portrait photo with local offline fallback.
* **`uploads/`**: Media files and company SVGs.

### `server/` — Local Node.js & Express Backend
Used when developing locally:
* **`index.js`**: Express server running on port `4000` providing local parity with the Cloudflare Pages edge functions.
* **`db.js`**: Database abstraction layer implementing query handling, data sanitization, social link normalization, and fallback defaults.

### `src/` — React 19 Frontend
Source code for the user interface, styled in the Swiss Neo-Brutalist style:
* **`components/`**: Layout blocks like `Header.jsx` with active route pills and retro terminal styling.
* **`pages/`**:
  * **`Home.jsx`**: Main personal homepage presenting the hero header, bio, work experience timeline, and featured project case studies.
  * **`Admin.jsx`**: Administrative portal for managing profile details, bio, experiences, projects, vinyl tracks, and car specifications.
  * **`MusicPage.jsx`**: Vinyl record crate browser featuring a 3-row interactive marquee, customizable playback speed (`0.5x`, `1.0x`, `1.5x`), mood filters, and live album inspection.
  * **`TiguanPage.jsx`**: Automotive build sheet detailing MQB platform modifications, suspension, exhaust, and track runs.
  * **`FriendsPage.jsx`**: 35mm film photo grid capturing roadtrips and snapshots.
  * **`CatPage.jsx`**: Dedicated interactive page for Mochi with real-time pat tracking.
* **`api.js`**: Centralized API utility managing authentication headers, request formatting, and error notifications.
* **`router.js`**: Lightweight client-side router enabling clean URL navigation without heavy dependencies.

### `tools/` — Utilities & Automation
* **`migrate-to-supabase.js`**: Verifies connectivity with your Supabase instance and checks table readiness.
* **`seed-khairinugroho-data.js`**: Seeds initial bio, project case studies, music albums, and car mods directly into Supabase.

---

## Getting Started

### 1. Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** or your preferred package manager
* A **Supabase** account & project ([supabase.com](https://supabase.com))
* A **Cloudflare** account (for Pages deployment)

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/khairizakiy/future-jpmorgan-site.git
cd future-jpmorgan-site
npm install
```

### 3. Environment Configuration
Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Configure your credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Client Vite Environment
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key

# API Server & Authentication
PORT=4000
JWT_SECRET=your-secure-jwt-secret
```

### 4. Database Setup (Supabase)
1. Open your **Supabase Dashboard** → **SQL Editor**.
2. Open [`supabase-schema.sql`](supabase-schema.sql), copy its contents, and click **Run**.
3. (Optional) Run the seed script to populate initial records:
   ```bash
   node tools/seed-khairinugroho-data.js
   ```

### 5. Running Locally
Start both the Express backend (`localhost:4000`) and the Vite dev server (`localhost:5173`) concurrently:

```bash
npm run dev
```

* **Main Site**: [http://localhost:5173](http://localhost:5173)
* **Admin Dashboard**: [http://localhost:5173/admin](http://localhost:5173/admin)
* **Local API Server**: [http://localhost:4000/api](http://localhost:4000/api)

---

## Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs backend Express server (`:4000`) and Vite dev server (`:5173`) concurrently |
| `npm run build` | Compiles client assets to `./dist/` for production |
| `npm start` | Starts the production Express API server |
| `npm run server` | Runs only the Node.js Express server |
| `npm run client` | Runs only the Vite client dev server |
| `npm run preview` | Locally previews the compiled production build |
| `npm run supabase:check` | Verifies Supabase connection and table readiness |
| `npm run pages:deploy` | Builds and deploys directly to Cloudflare Pages via Wrangler |

---

## Deployment to Cloudflare Pages

The production application is hosted on **Cloudflare Pages** at **`khairi.fun`**.

1. Connect your GitHub repository to Cloudflare Pages.
2. Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
3. Add Environment Variables in Cloudflare Pages dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `JWT_SECRET`
4. Or deploy directly from terminal using Wrangler CLI:
   ```bash
   npm run pages:deploy
   ```

---

## Credits

Built with precision by [Khairi Nugroho](https://github.com/khairizakiy).
Special thanks to [Ricky Marove](https://github.com/rickymarove) for the helps.
