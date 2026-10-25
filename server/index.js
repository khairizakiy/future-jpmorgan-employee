import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-dev-secret'

const app = express()
app.use(cors())
app.use(express.json())

// Serve uploaded media
const UPLOADS_DIR = path.join(ROOT, 'public', 'uploads')
app.use('/uploads', express.static(UPLOADS_DIR))

// Guard every write endpoint with JWT auth (login/setup excepted).
// Public GETs stay open so the site itself needs no login.
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next()
  if (
    req.path === '/api/auth/login' ||
    req.path === '/api/auth/setup' ||
    req.path === '/api/auth/reset-local'
  ) {
    return next()
  }
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Login required' })
  try {
    req.admin = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired — log in again' })
  }
})

// Simple photo upload (admin-only, JWT-protected)
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(ROOT, 'public', 'uploads'),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.png'
      cb(null, `img-${Date.now()}${ext}`)
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }
})

// wrap async handlers
const ah = (fn) => (req, res) => Promise.resolve(fn(req, res)).catch((e) => {
  console.error(e)
  res.status(500).json({ error: e.message || 'Server error' })
})

// ---------- System & DB Status ----------
app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    database: db.getMode(),
    timestamp: new Date().toISOString()
  })
})

// ---------- profile (intro section) ----------
app.get(
  '/api/profile',
  ah(async (_req, res) => {
    const profile = await db.getProfile()
    res.json(profile)
  })
)

app.put(
  '/api/profile',
  ah(async (req, res) => {
    const updated = await db.updateProfile(req.body || {})
    res.json(updated)
  })
)

// ---------- bio (about section) ----------
app.get(
  '/api/bio',
  ah(async (_req, res) => {
    const bio = await db.getBio()
    res.json(bio)
  })
)

app.put(
  '/api/bio',
  ah(async (req, res) => {
    const updated = await db.updateBio(req.body || {})
    res.json(updated)
  })
)

app.post('/api/upload', upload.single('photo'), ah(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' })
  const localPath = `/uploads/${req.file.filename}`
  let supabaseUrl = null
  try {
    const fileBuf = await fs.promises.readFile(req.file.path)
    supabaseUrl = await db.uploadToSupabaseStorage(req.file.filename, fileBuf, req.file.mimetype)
  } catch (err) {
    console.warn('[Upload sync to Supabase notice]', err.message)
  }

  const finalUrl = supabaseUrl || localPath

  // Automatically record this picture into Supabase database (public.pictures)
  let picRecord = null
  try {
    picRecord = await db.createPicture({
      name: path.parse(req.file.filename).name,
      title: req.body?.title || req.file.originalname || req.file.filename,
      category: req.body?.category || 'admin-upload',
      url: finalUrl,
      alt_text: req.file.originalname || '',
      published: true
    })
  } catch (err) {
    console.warn('[Auto-sync to Supabase pictures table notice]', err.message)
  }

  res.json({
    path: finalUrl,
    url: finalUrl,
    localPath,
    supabaseUrl,
    picture: picRecord
  })
}))

// ---------- gallery: auto-discover every image in public/uploads + Supabase pictures ----------
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif'])
app.get(
  '/api/gallery',
  ah(async (_req, res) => {
    let images = []
    if (fs.existsSync(UPLOADS_DIR)) {
      const files = await fs.promises.readdir(UPLOADS_DIR)
      images = files
        .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
        .sort((a, b) => a.localeCompare(b))
        .map((f) => `/uploads/${f}`)
    }
    try {
      const dbPics = await db.getPictures(true)
      const picUrls = (dbPics || []).map((p) => p.url).filter(Boolean)
      images = Array.from(new Set([...picUrls, ...images]))
    } catch {}
    res.json(images)
  })
)

// ---------- projects ----------
app.get(
  '/api/projects',
  ah(async (req, res) => {
    const all = req.query.all === '1'
    const rows = await db.getProjects(!all)
    res.json(rows)
  })
)

app.get(
  '/api/projects/:id',
  ah(async (req, res) => {
    const all = req.query.all === '1'
    const project = await db.getProject(req.params.id, !all)
    if (!project) return res.status(404).json({ error: 'Project not found' })
    res.json(project)
  })
)

app.post(
  '/api/projects',
  ah(async (req, res) => {
    const b = req.body || {}
    if (!b.title || !String(b.title).trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }
    const created = await db.createProject(b)
    res.status(201).json(created)
  })
)

app.put(
  '/api/projects/:id',
  ah(async (req, res) => {
    const updated = await db.updateProject(req.params.id, req.body || {})
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  })
)

app.delete(
  '/api/projects/:id',
  ah(async (req, res) => {
    await db.deleteProject(req.params.id)
    res.json({ ok: true })
  })
)

// ---------- threads ----------
app.get(
  '/api/threads',
  ah(async (req, res) => {
    const all = req.query.all === '1'
    const rows = await db.getThreads(!all)
    res.json(rows)
  })
)

app.get(
  '/api/threads/:id',
  ah(async (req, res) => {
    const all = req.query.all === '1'
    const thread = await db.getThread(req.params.id, !all)
    if (!thread) return res.status(404).json({ error: 'Note not found' })
    res.json(thread)
  })
)

app.post(
  '/api/threads',
  ah(async (req, res) => {
    const b = req.body || {}
    if (!b.title || !String(b.title).trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }
    const created = await db.createThread(b)
    res.status(201).json(created)
  })
)

app.put(
  '/api/threads/:id',
  ah(async (req, res) => {
    const updated = await db.updateThread(req.params.id, req.body || {})
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  })
)

app.delete(
  '/api/threads/:id',
  ah(async (req, res) => {
    await db.deleteThread(req.params.id)
    res.json({ ok: true })
  })
)

// ---------- services ----------
app.get(
  '/api/services',
  ah(async (req, res) => {
    const all = req.query.all === '1'
    const rows = await db.getServices(!all)
    res.json(rows)
  })
)

app.post(
  '/api/services',
  ah(async (req, res) => {
    const b = req.body || {}
    if (!b.title || !String(b.title).trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }
    const created = await db.createService(b)
    res.status(201).json(created)
  })
)

app.put(
  '/api/services/:id',
  ah(async (req, res) => {
    const updated = await db.updateService(req.params.id, req.body || {})
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  })
)

app.delete(
  '/api/services/:id',
  ah(async (req, res) => {
    await db.deleteService(req.params.id)
    res.json({ ok: true })
  })
)

// ---------- awards & courses ----------
app.get(
  '/api/awards',
  ah(async (req, res) => {
    const all = req.query.all === '1'
    const rows = await db.getAwardsAndCourses(!all)
    res.json(rows)
  })
)

app.post(
  '/api/awards',
  ah(async (req, res) => {
    const b = req.body || {}
    if (!b.title || !String(b.title).trim()) {
      return res.status(400).json({ error: 'Title is required' })
    }
    const created = await db.createAwardCourse(b)
    res.status(201).json(created)
  })
)

app.put(
  '/api/awards/:id',
  ah(async (req, res) => {
    const updated = await db.updateAwardCourse(req.params.id, req.body || {})
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  })
)

app.delete(
  '/api/awards/:id',
  ah(async (req, res) => {
    await db.deleteAwardCourse(req.params.id)
    res.json({ ok: true })
  })
)

// ---------- pictures (media in Supabase) ----------
app.get(
  '/api/pictures',
  ah(async (req, res) => {
    const all = req.query.all === '1'
    const rows = await db.getPictures(!all)
    res.json(rows)
  })
)

app.get(
  '/api/pictures/:name',
  ah(async (req, res) => {
    const row = await db.getPictureByName(req.params.name)
    if (!row) return res.status(404).json({ error: 'Picture not found' })
    res.json(row)
  })
)

app.post(
  '/api/pictures',
  ah(async (req, res) => {
    const b = req.body || {}
    if (!b.url || !String(b.url).trim()) {
      return res.status(400).json({ error: 'URL is required' })
    }
    const created = await db.createPicture(b)
    res.status(201).json(created)
  })
)

app.put(
  '/api/pictures/:id',
  ah(async (req, res) => {
    const updated = await db.updatePicture(req.params.id, req.body || {})
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  })
)

app.delete(
  '/api/pictures/:id',
  ah(async (req, res) => {
    await db.deletePicture(req.params.id)
    res.json({ ok: true })
  })
)

// ---------- auth (admin login) ----------
app.get(
  '/api/auth/status',
  ah(async (_req, res) => {
    const status = await db.getAdminStatus()
    res.json(status)
  })
)

app.post(
  '/api/auth/setup',
  ah(async (req, res) => {
    const { username, password } = req.body || {}
    if (!username || !String(username).trim() || !password || String(password).length < 4) {
      return res.status(400).json({ error: 'Username and a password (min 4 characters) required' })
    }
    const status = await db.getAdminStatus()
    if (!status.needsSetup) {
      return res.status(403).json({ error: 'Setup already done — log in instead' })
    }
    const hash = await bcrypt.hash(String(password), 10)
    await db.createAdmin(String(username).trim(), hash)
    res.json({ ok: true })
  })
)

app.post(
  '/api/auth/login',
  ah(async (req, res) => {
    const { username, password } = req.body || {}
    const admin = await db.getAdminByUsername(String(username || '').trim())
    const ok = admin && (await bcrypt.compare(String(password || ''), admin.password_hash))
    if (!ok) return res.status(401).json({ error: 'Wrong username or password' })
    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
      expiresIn: '7d'
    })
    res.json({ token, username: admin.username })
  })
)

app.get('/api/auth/me', (req, res) => {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    res.json({ username: payload.username })
  } catch {
    res.status(401).json({ error: 'Not logged in' })
  }
})

app.put(
  '/api/auth/account',
  ah(async (req, res) => {
    const { username, password } = req.body || {}
    if (!username && !password) {
      return res.status(400).json({ error: 'Provide a new username or password' })
    }
    const admin = await db.getAdminById(req.admin.id)
    if (!admin) return res.status(404).json({ error: 'Admin account not found' })

    let newUsername = admin.username
    let newHash = admin.password_hash

    if (username && String(username).trim()) {
      newUsername = String(username).trim()
    }
    if (password) {
      if (String(password).length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters' })
      }
      newHash = await bcrypt.hash(String(password), 10)
    }

    await db.updateAdmin(req.admin.id, newUsername, newHash)
    const token = jwt.sign({ id: req.admin.id, username: newUsername }, JWT_SECRET, {
      expiresIn: '7d'
    })
    res.json({ ok: true, username: newUsername, token })
  })
)

app.post(
  '/api/auth/reset-local',
  ah(async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || ''
    const isLocal =
      ip.includes('127.0.0.1') ||
      ip.includes('::1') ||
      ip.includes('localhost') ||
      !process.env.NODE_ENV ||
      process.env.NODE_ENV === 'development'

    if (!isLocal) {
      return res.status(403).json({ error: 'Reset endpoint only available on local host' })
    }

    const { username, password } = req.body || {}
    if (!username || !password || String(password).length < 4) {
      return res.status(400).json({ error: 'Username and password (min 4 characters) required' })
    }

    const hash = await bcrypt.hash(String(password), 10)
    const existing = await db.getFirstAdmin()
    let adminId
    if (existing) {
      adminId = existing.id
      await db.updateAdmin(adminId, String(username).trim(), hash)
    } else {
      const ins = await db.createAdmin(String(username).trim(), hash)
      adminId = ins.id
    }

    const token = jwt.sign({ id: adminId, username: String(username).trim() }, JWT_SECRET, {
      expiresIn: '7d'
    })
    res.json({ ok: true, username: String(username).trim(), token })
  })
)

// ---------- Static Assets (JS, CSS, Fonts) ----------
app.use('/assets', express.static(path.join(DIST, 'assets')))
app.use('/fonts', express.static(path.join(ROOT, 'public', 'fonts')))

// ============================================================================
// DYNAMIC SSR PAGE HANDLER (NEVER STATIC — ALWAYS RENDERS LATEST DATA ON REQUEST)
// ============================================================================
app.use(async (req, res, next) => {
  if (
    (req.method !== 'GET' && req.method !== 'HEAD') ||
    req.path.startsWith('/api') ||
    req.path.startsWith('/uploads')
  ) {
    return next()
  }

  const htmlPath = path.join(DIST, 'index.html')
  if (!fs.existsSync(htmlPath)) {
    return next()
  }

  try {
    let html = await fs.promises.readFile(htmlPath, 'utf8')

    // 1. Fetch live database records for SSR injection
    const [publishedProjects, profileData, bioData] = await Promise.all([
      db.getProjects(true).catch(() => []),
      db.getProfile().catch(() => null),
      db.getBio().catch(() => null)
    ])

    const ssrState = {
      projects: publishedProjects || [],
      profile: profileData || null,
      bio: bioData || null,
      dbMode: db.getMode(),
      ssrTimestamp: new Date().toISOString()
    }

    // 2. Dynamic SEO tag injection
    if (req.path.startsWith('/work/')) {
      const match = req.path.match(/^\/work\/(\d+)/)
      if (match) {
        const item = (publishedProjects || []).find((p) => String(p.id) === match[1])
        if (item) {
          html = html.replace(
            /<title>.*?<\/title>/,
            `<title>${item.title} — Khairi Nugroho</title>`
          )
        }
      }
    } else if (req.path === '/work') {
      html = html.replace(
        /<title>.*?<\/title>/,
        `<title>Work Archive &amp; Systems — Khairi Nugroho</title>`
      )
    }

    // 3. SSR Data Injection into HTML head
    const ssrScript = `<script id="__SSR_DATA__">window.__INITIAL_DATA__ = ${JSON.stringify(ssrState).replace(/</g, '\\u003c')};</script>`
    html = html.replace('</head>', `${ssrScript}</head>`)

    // 4. Strict dynamic headers: prevents browser or intermediate proxy caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')

    if (req.method === 'HEAD') {
      return res.status(200).end()
    }

    res.send(html)
  } catch (err) {
    console.error('[SSR Error]', err)
    next(err)
  }
})

const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => {
  console.log(`Portfolio API & SSR Server online: http://localhost:${PORT} [DB: ${db.getMode()}]`)
})
