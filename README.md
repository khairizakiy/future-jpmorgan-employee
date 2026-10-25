# Future JP Morgan President Khairi "Zakiy" Nugroho Folio

Hi, this is my personal portfolio website built in the Swiss Style with Neo-Brutalist architecture. It combines **React**, **Vite**, and an **Express** server integrated directly with **Supabase** for database records and media storage.

---

## Project Structure

```text
/
├── db/
│   └── supabase-admin-sync.sql   # Complete Supabase schema, RLS policies & initial seeds
├── public/
│   ├── fonts/                    # Typography (FK Screamer, Space Mono, IBM Plex Mono)
│   ├── uploads/                  # Uploaded media (synced with Supabase Storage)
│   ├── favicon.svg               # "K" Monogram favicon
│   └── favicon.png               # PNG fallback favicon
├── server/
│   ├── db.js                     # Pure Supabase client & data operations (Projects, Profile, Media)
│   └── index.js                  # Express API server, JWT authentication & dynamic SSR injection
├── src/
│   ├── components/
│   │   ├── AboutSection.jsx      # Bio, credentials, services, awards & photo
│   │   ├── ContactSection.jsx    # Reach out section, 3D interactive business card
│   │   ├── CustomCursor.jsx      # Fluid custom cursor with physics
│   │   ├── HeroSection.jsx       # Watermark, 3D metallic sculpture stage
│   │   ├── InlineCaseStudy.jsx   # Dynamic case study expansion (Brief, Challenge, Outcome)
│   │   ├── MetallicKSculpture.jsx# Interactive 3D metallic "K" sculpture with drag physics
│   │   ├── StickyHeader.jsx      # Minimal sticky navigation & scroll progress
│   │   └── WorkSection.jsx       # Featured projects grid & inline case studies
│   ├── pages/
│   │   ├── Admin.jsx             # Admin dashboard (Projects, Profile, Media, Services, Awards)
│   │   └── Home.jsx              # Main page assembly & smooth Lenis scrolling
│   ├── api.js                    # Client-side API client
│   ├── App.jsx                   # Client view router
│   ├── index.css                 # Atelier design system & responsive styling
│   └── main.jsx                  # React DOM entry point
├── tools/
│   └── migrate-to-supabase.js    # Supabase connection & table readiness verification script
├── .env.example                  # Environment configuration template
├── index.html                    # HTML shell
├── package.json                  # Dependencies & npm scripts
├── supabase-admin-sync.sql       # Root copy of Supabase SQL migration script
└── vite.config.js                # Vite build & dev proxy configuration
```

---

## Getting Started

### 1. Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** or your preferred package manager
* A **Supabase** project ([supabase.com](https://supabase.com))

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/khairizakiy/portfolio.git
cd portfolio
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Fill in your Supabase project credentials and server secrets:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key

# Client Vite Environment
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key

# API & SSR Server
PORT=4000
JWT_SECRET=your-secure-jwt-secret
```

### 4. Database Setup (Supabase)
1. Open your **Supabase Dashboard** → **SQL Editor**.
2. Open [`supabase-admin-sync.sql`](supabase-admin-sync.sql) (or `db/supabase-admin-sync.sql`).
3. Paste and run the script. This creates:
   * `public.projects` (Full case studies, briefs, challenges, outcomes, directive quotes, images)
   * `public.pictures` (Media management synced to Supabase Storage `uploads` bucket)
   * `public.profile` (Bio, portrait photo, contact details, social links)
   * `public.services` (Expandable service cards)
   * `public.awards_and_courses` (Expandable credentials & course entries)
   * `public.admin_users` (JWT-authenticated admin access)
4. Verify your Supabase tables anytime by running:

```bash
npm run supabase:check
```

### 5. Running Locally
Start both the Express backend (`localhost:4000`) and the Vite dev server (`localhost:5173`) concurrently:

```bash
npm run dev
```

* **Main Portfolio**: [http://localhost:5173](http://localhost:5173)
* **Admin Dashboard**: [http://localhost:5173/admin](http://localhost:5173/admin)
* **API Server**: [http://localhost:4000](http://localhost:4000)

---

## Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs backend Express server (`:4000`) and Vite dev server (`:5173`) concurrently |
| `npm run build` | Compiles client assets to `./dist/` for production |
| `npm start` | Starts the production Express API & SSR server |
| `npm run server` | Runs only the Node.js Express server |
| `npm run client` | Runs only the Vite client dev server |
| `npm run preview` | Locally previews the compiled production build |
| `npm run supabase:check`| Checks database connection and table readiness in Supabase |

---

## Deployment

The project can be deployed to any Node.js hosting platform (e.g. **Render**, **Railway**, **Fly.io**, or **Vercel** with Node serverless):

1. Set the build command: `npm run build`
2. Set the start command: `npm start`
3. Provide your environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, etc.) in your hosting dashboard.

---

## Credits

Built with precision by [Khairi Nugroho](https://github.com/khairizakiy)
Special thanks to [Ricky Marove](https://github.com/rickymarove)
