# Future JP Morgan President Khairi Nugroho Portfolio

Hi, this is my personal portfolio website built in the Swiss Style with Neo-Brutalist architecture. It combines **React**, **Vite**, and an **Express / Cloudflare Pages Functions** backend integrated directly with **Supabase** (PostgreSQL) for database records and media storage.

* **Live Site**: [https://khairi.fun](https://khairi.fun)

---

## Repository Structure & Folder Guide

```text
portfolio/
├── functions/                     # Cloudflare Pages Functions (Serverless Edge API)
├── public/                        # Static assets served at domain root
├── server/                        # Local Node.js / Express development backend
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
├── .env.example                   # Template for required environment variables
├── index.html                     # HTML shell with meta tags, fonts & Tailwind CDN
├── package.json                   # Dependencies, scripts & build configuration
├── supabase-schema.sql            # Complete Supabase SQL migration script & RLS policies
├── vite.config.js                 # Vite build & development proxy configuration
└── wrangler.toml                  # Cloudflare Pages deployment & nodejs_compat configuration
```

---

## Credits

Built with precision by [Khairi Nugroho](https://github.com/khairizakiy).
Special thanks to [Ricky Marove](https://github.com/rickymarove) for the helps.
