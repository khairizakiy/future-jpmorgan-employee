import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
      ...extraHeaders
    }
  })
}

function getSupabase(env) {
  const url =
    env.SUPABASE_URL ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    ''

  const key =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SECRET_KEY ||
    env.SUPABASE_ANON_KEY ||
    (typeof process !== 'undefined' &&
      (process.env?.SUPABASE_SERVICE_ROLE_KEY ||
        process.env?.SUPABASE_SECRET_KEY ||
        process.env?.SUPABASE_ANON_KEY)) ||
    ''

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

function formatProject(row) {
  if (!row) return null
  let cs = null
  let summary = row.description || ''
  if (row.description && typeof row.description === 'string' && row.description.trim().startsWith('{')) {
    try {
      cs = JSON.parse(row.description)
      if (cs && typeof cs === 'object') {
        summary = cs.summary || ''
      }
    } catch {
      cs = null
    }
  }

  const client = (row.client !== undefined && row.client !== null && row.client !== '')
    ? row.client
    : (cs && cs.client) || ''
  const brief = (row.brief !== undefined && row.brief !== null && row.brief !== '')
    ? row.brief
    : (cs && cs.brief) || ''
  const engagement = (row.engagement !== undefined && row.engagement !== null && row.engagement !== '')
    ? row.engagement
    : (cs && cs.engagement) || ''
  const documentation = (row.documentation !== undefined && row.documentation !== null && row.documentation !== '')
    ? row.documentation
    : (cs && cs.documentation) || row.image || ''
  const challenge = (row.challenge !== undefined && row.challenge !== null && row.challenge !== '')
    ? row.challenge
    : (cs && cs.challenge) || ''
  const approach = (row.approach !== undefined && row.approach !== null && row.approach !== '')
    ? row.approach
    : (cs && cs.approach) || ''
  const picture_docs = (Array.isArray(row.picture_docs) && row.picture_docs.length > 0)
    ? row.picture_docs
    : (cs && Array.isArray(cs.picture_docs))
      ? cs.picture_docs
      : (cs && typeof cs.picture_docs === 'string')
        ? cs.picture_docs.split('\n').map((s) => s.trim()).filter(Boolean)
        : []
  const quote = (row.quote !== undefined && row.quote !== null && row.quote !== '')
    ? row.quote
    : (cs && cs.quote) || ''
  const outcome = (row.outcome !== undefined && row.outcome !== null && row.outcome !== '')
    ? row.outcome
    : (cs && cs.outcome) || ''

  return {
    ...row,
    description: summary,
    client,
    brief,
    engagement,
    documentation,
    challenge,
    approach,
    picture_docs,
    quote,
    outcome
  }
}

function serializeProjectDescription(b, cur = null) {
  const hasCaseStudy = Boolean(
    b.client !== undefined ||
    b.brief !== undefined ||
    b.engagement !== undefined ||
    b.documentation !== undefined ||
    b.challenge !== undefined ||
    b.approach !== undefined ||
    b.picture_docs !== undefined ||
    b.quote !== undefined ||
    b.outcome !== undefined
  )

  let existingCs = {}
  if (cur && cur.description && typeof cur.description === 'string' && cur.description.trim().startsWith('{')) {
    try {
      existingCs = JSON.parse(cur.description) || {}
    } catch {}
  }

  if (!hasCaseStudy && Object.keys(existingCs).length === 0) {
    return b.description !== undefined ? b.description : (cur?.description || '')
  }

  const rawDocs = b.picture_docs !== undefined ? b.picture_docs : existingCs.picture_docs
  const picture_docs = Array.isArray(rawDocs)
    ? rawDocs
    : typeof rawDocs === 'string'
      ? rawDocs.split('\n').map((s) => s.trim()).filter(Boolean)
      : []

  const payload = {
    summary: b.description !== undefined ? b.description : (existingCs.summary || cur?.description || ''),
    client: b.client !== undefined ? b.client : (existingCs.client || ''),
    brief: b.brief !== undefined ? b.brief : (existingCs.brief || ''),
    engagement: b.engagement !== undefined ? b.engagement : (existingCs.engagement || ''),
    documentation: b.documentation !== undefined ? b.documentation : (existingCs.documentation || ''),
    challenge: b.challenge !== undefined ? b.challenge : (existingCs.challenge || ''),
    approach: b.approach !== undefined ? b.approach : (existingCs.approach || ''),
    picture_docs,
    quote: b.quote !== undefined ? b.quote : (existingCs.quote || ''),
    outcome: b.outcome !== undefined ? b.outcome : (existingCs.outcome || '')
  }

  return JSON.stringify(payload)
}

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const pathname = url.pathname
  const method = request.method
  const searchParams = url.searchParams

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const jwtSecret =
    env.JWT_SECRET ||
    (typeof process !== 'undefined' && process.env?.JWT_SECRET) ||
    'portfolio-dev-secret'

  // Supabase client instance
  const supabase = getSupabase(env)

  // JWT check for mutation endpoints
  let adminPayload = null
  if (
    method !== 'GET' &&
    method !== 'HEAD' &&
    pathname !== '/api/auth/login' &&
    pathname !== '/api/auth/setup' &&
    pathname !== '/api/auth/reset-local'
  ) {
    const h = request.headers.get('Authorization') || ''
    const token = h.startsWith('Bearer ') ? h.slice(7) : null
    if (!token) return json({ error: 'Login required' }, 401)
    try {
      adminPayload = jwt.verify(token, jwtSecret)
    } catch {
      return json({ error: 'Session expired — log in again' }, 401)
    }
  }

  try {
    // ---------- Status ----------
    if (pathname === '/api/status') {
      return json({
        ok: true,
        database: 'supabase',
        hosting: 'cloudflare-pages',
        timestamp: new Date().toISOString()
      })
    }

    // ---------- Profile ----------
    if (pathname === '/api/profile') {
      if (method === 'GET') {
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle()
        if (error) throw error
        return json(data)
      }
      if (method === 'PUT') {
        const vals = await request.json().catch(() => ({}))
        const { data: current } = await supabase
          .from('profile')
          .select('id')
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle()

        const payload = {
          hero: vals.hero ?? null,
          name: vals.name ?? '',
          who_am_i: vals.who_am_i ?? '',
          what_i_did: vals.what_i_did ?? '',
          school: vals.school ?? '',
          photo: vals.photo ?? null,
          email: vals.email ?? null,
          x_url: vals.x_url ?? null,
          github_url: vals.github_url ?? null,
          linkedin_url: vals.linkedin_url ?? null,
          updated_at: new Date().toISOString()
        }

        if (current) {
          const { data, error } = await supabase
            .from('profile')
            .update(payload)
            .eq('id', current.id)
            .select()
            .single()
          if (error) throw error
          return json(data)
        } else {
          const { data, error } = await supabase.from('profile').insert(payload).select().single()
          if (error) throw error
          return json(data)
        }
      }
    }

    // ---------- Upload (Direct to Supabase Storage) ----------
    if (pathname === '/api/upload' && method === 'POST') {
      const formData = await request.formData()
      const file = formData.get('photo')
      if (!file || typeof file === 'string') {
        return json({ error: 'No file received' }, 400)
      }

      const originalName = file.name || 'image.png'
      const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '.png'
      const filename = `img-${Date.now()}${ext}`
      const arrayBuf = await file.arrayBuffer()
      const mimeType = file.type || 'image/jpeg'

      const { error: uploadErr } = await supabase.storage.from('uploads').upload(filename, arrayBuf, {
        contentType: mimeType,
        upsert: true
      })

      let publicUrl = null
      if (!uploadErr) {
        const { data: pubData } = supabase.storage.from('uploads').getPublicUrl(filename)
        publicUrl = pubData?.publicUrl || null
      }

      let picRecord = null
      if (publicUrl) {
        try {
          const { data: createdPic } = await supabase
            .from('pictures')
            .insert({
              name: filename.replace(/\.[^/.]+$/, ''),
              title: formData.get('title') || originalName,
              category: formData.get('category') || 'admin-upload',
              url: publicUrl,
              alt_text: originalName,
              published: true
            })
            .select()
            .single()
          picRecord = createdPic
        } catch (err) {
          console.warn('[Auto-sync to Supabase pictures table notice]', err)
        }
      }

      return json({
        path: publicUrl,
        url: publicUrl,
        supabaseUrl: publicUrl,
        picture: picRecord
      })
    }

    // ---------- Gallery ----------
    if (pathname === '/api/gallery' && method === 'GET') {
      const { data: dbPics } = await supabase.from('pictures').select('url').order('order_index', { ascending: true })
      const picUrls = (dbPics || []).map((p) => p.url).filter(Boolean)
      const fallbackUrls = [
        'https://jnttmmhomgtpnkpymhfl.supabase.co/storage/v1/object/public/uploads/khairinugroho.jpeg',
        'https://jnttmmhomgtpnkpymhfl.supabase.co/storage/v1/object/public/uploads/img-1792869792255.webp'
      ]
      const combined = Array.from(new Set([...picUrls, ...fallbackUrls]))
      return json(combined)
    }

    // ---------- Projects ----------
    if (pathname === '/api/projects') {
      if (method === 'GET') {
        const all = searchParams.get('all') === '1'
        let q = supabase.from('projects').select('*').order('created_at', { ascending: false })
        if (!all) q = q.eq('published', true)
        const { data, error } = await q
        if (error) throw error
        return json((data || []).map(formatProject))
      }
      if (method === 'POST') {
        const b = await request.json().catch(() => ({}))
        if (!b.title || !String(b.title).trim()) {
          return json({ error: 'Title is required' }, 400)
        }

        const payload = {
          title: b.title,
          category: b.category || 'OPERATIONS',
          progress: Math.min(5, Math.max(1, Number(b.progress) || 3)),
          description: serializeProjectDescription(b),
          url: b.url || null,
          image: b.image || null,
          published: b.published === false ? false : true
        }

        const fullPayload = {
          ...payload,
          client: b.client || '',
          engagement: b.engagement || '',
          brief: b.brief || '',
          challenge: b.challenge || '',
          approach: b.approach || '',
          quote: b.quote || '',
          outcome: b.outcome || '',
          documentation: b.documentation || '',
          picture_docs: Array.isArray(b.picture_docs)
            ? b.picture_docs
            : typeof b.picture_docs === 'string'
              ? b.picture_docs.split('\n').map((s) => s.trim()).filter(Boolean)
              : []
        }

        let res = await supabase.from('projects').insert(fullPayload).select().single()
        if (res.error && res.error.code === '42703') {
          res = await supabase.from('projects').insert(payload).select().single()
        }
        if (res.error) throw res.error
        return json(formatProject(res.data), 201)
      }
    }

    if (pathname.startsWith('/api/projects/')) {
      const id = pathname.replace('/api/projects/', '')
      if (method === 'GET') {
        const all = searchParams.get('all') === '1'
        let q = supabase.from('projects').select('*').eq('id', id)
        if (!all) q = q.eq('published', true)
        const { data, error } = await q.maybeSingle()
        if (error) throw error
        if (!data) return json({ error: 'Project not found' }, 404)
        return json(formatProject(data))
      }
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const { data: cur } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
        if (!cur) return json({ error: 'Not found' }, 404)

        const updateData = {
          title: b.title ?? cur.title,
          category: b.category === undefined ? cur.category : b.category || 'OPERATIONS',
          progress:
            b.progress === undefined
              ? cur.progress
              : Math.min(5, Math.max(1, Number(b.progress) || cur.progress || 3)),
          description: serializeProjectDescription(b, cur),
          url: b.url !== undefined ? b.url : cur.url,
          image: b.image !== undefined ? b.image : cur.image,
          published: b.published === undefined ? cur.published : Boolean(b.published)
        }

        const fullUpdateData = {
          ...updateData,
          client: b.client !== undefined ? b.client : cur.client,
          engagement: b.engagement !== undefined ? b.engagement : cur.engagement,
          brief: b.brief !== undefined ? b.brief : cur.brief,
          challenge: b.challenge !== undefined ? b.challenge : cur.challenge,
          approach: b.approach !== undefined ? b.approach : cur.approach,
          quote: b.quote !== undefined ? b.quote : cur.quote,
          outcome: b.outcome !== undefined ? b.outcome : cur.outcome,
          documentation: b.documentation !== undefined ? b.documentation : cur.documentation,
          picture_docs: b.picture_docs !== undefined
            ? (Array.isArray(b.picture_docs)
                ? b.picture_docs
                : typeof b.picture_docs === 'string'
                  ? b.picture_docs.split('\n').map((s) => s.trim()).filter(Boolean)
                  : [])
            : cur.picture_docs
        }

        let res = await supabase.from('projects').update(fullUpdateData).eq('id', id).select().single()
        if (res.error && res.error.code === '42703') {
          res = await supabase.from('projects').update(updateData).eq('id', id).select().single()
        }
        if (res.error) throw res.error
        return json(formatProject(res.data))
      }
      if (method === 'DELETE') {
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }
    }

    // ---------- Threads ----------
    if (pathname === '/api/threads') {
      if (method === 'GET') {
        const all = searchParams.get('all') === '1'
        let q = supabase.from('threads').select('*').order('created_at', { ascending: false })
        if (!all) q = q.eq('published', true)
        const { data, error } = await q
        if (error) throw error
        return json(data || [])
      }
      if (method === 'POST') {
        const b = await request.json().catch(() => ({}))
        if (!b.title || !String(b.title).trim()) {
          return json({ error: 'Title is required' }, 400)
        }
        const { data, error } = await supabase
          .from('threads')
          .insert({
            title: b.title,
            content: b.content || '',
            published: b.published === false ? false : true
          })
          .select()
          .single()
        if (error) throw error
        return json(data, 201)
      }
    }

    if (pathname.startsWith('/api/threads/')) {
      const id = pathname.replace('/api/threads/', '')
      if (method === 'GET') {
        const all = searchParams.get('all') === '1'
        let q = supabase.from('threads').select('*').eq('id', id)
        if (!all) q = q.eq('published', true)
        const { data, error } = await q.maybeSingle()
        if (error) throw error
        if (!data) return json({ error: 'Note not found' }, 404)
        return json(data)
      }
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const { data: cur } = await supabase.from('threads').select('*').eq('id', id).maybeSingle()
        if (!cur) return json({ error: 'Not found' }, 404)
        const { data, error } = await supabase
          .from('threads')
          .update({
            title: b.title ?? cur.title,
            content: b.content ?? cur.content,
            published: b.published === undefined ? cur.published : Boolean(b.published)
          })
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return json(data)
      }
      if (method === 'DELETE') {
        const { error } = await supabase.from('threads').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }
    }

    // ---------- Services ----------
    if (pathname === '/api/services') {
      if (method === 'GET') {
        const all = searchParams.get('all') === '1'
        let q = supabase.from('services').select('*').order('order_index', { ascending: true })
        if (!all) q = q.neq('published', false)
        const { data, error } = await q
        if (!error && Array.isArray(data)) {
          return json(data.map((item) => ({ ...item, title: item.title || item.name || item.service || '' })))
        }
        return json([])
      }
      if (method === 'POST') {
        const b = await request.json().catch(() => ({}))
        if (!b.title || !String(b.title).trim()) {
          return json({ error: 'Title is required' }, 400)
        }
        const payload = {
          title: b.title || '',
          description: b.description || '',
          link: b.link || '',
          order_index: Number(b.order_index) || 0,
          published: b.published !== undefined ? Boolean(b.published) : true
        }
        const { data, error } = await supabase.from('services').insert(payload).select().single()
        if (error) throw error
        return json(data, 201)
      }
    }

    if (pathname.startsWith('/api/services/')) {
      const id = pathname.replace('/api/services/', '')
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const payload = {}
        if (b.title !== undefined) payload.title = b.title
        if (b.description !== undefined) payload.description = b.description
        if (b.link !== undefined) payload.link = b.link
        if (b.order_index !== undefined) payload.order_index = Number(b.order_index)
        if (b.published !== undefined) payload.published = Boolean(b.published)

        const { data, error } = await supabase.from('services').update(payload).eq('id', id).select().single()
        if (error) throw error
        return json(data)
      }
      if (method === 'DELETE') {
        const { error } = await supabase.from('services').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }
    }

    // ---------- Awards & Courses ----------
    if (pathname === '/api/awards') {
      if (method === 'GET') {
        const all = searchParams.get('all') === '1'
        let q = supabase.from('awards_and_courses').select('*').order('order_index', { ascending: true })
        if (!all) q = q.neq('published', false)
        const { data, error } = await q
        if (!error && Array.isArray(data)) {
          return json(data.map((item) => ({ ...item, title: item.title || item.name || item.course || item.award || '' })))
        }
        return json([])
      }
      if (method === 'POST') {
        const b = await request.json().catch(() => ({}))
        if (!b.title || !String(b.title).trim()) {
          return json({ error: 'Title is required' }, 400)
        }
        const payload = {
          title: b.title || '',
          description: b.description || '',
          link: b.link || '',
          order_index: Number(b.order_index) || 0,
          published: b.published !== undefined ? Boolean(b.published) : true
        }
        const { data, error } = await supabase.from('awards_and_courses').insert(payload).select().single()
        if (error) throw error
        return json(data, 201)
      }
    }

    if (pathname.startsWith('/api/awards/')) {
      const id = pathname.replace('/api/awards/', '')
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const payload = {}
        if (b.title !== undefined) payload.title = b.title
        if (b.description !== undefined) payload.description = b.description
        if (b.link !== undefined) payload.link = b.link
        if (b.order_index !== undefined) payload.order_index = Number(b.order_index)
        if (b.published !== undefined) payload.published = Boolean(b.published)

        const { data, error } = await supabase.from('awards_and_courses').update(payload).eq('id', id).select().single()
        if (error) throw error
        return json(data)
      }
      if (method === 'DELETE') {
        const { error } = await supabase.from('awards_and_courses').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }
    }

    // ---------- Pictures ----------
    if (pathname === '/api/pictures') {
      if (method === 'GET') {
        const all = searchParams.get('all') === '1'
        let q = supabase.from('pictures').select('*').order('order_index', { ascending: true })
        if (!all) q = q.neq('published', false)
        const { data, error } = await q
        if (!error && Array.isArray(data) && data.length > 0) return json(data)

        return json([
          {
            id: 1,
            name: 'profile_photo',
            title: 'Khairi Nugroho Portrait',
            category: 'profile',
            url: 'https://jnttmmhomgtpnkpymhfl.supabase.co/storage/v1/object/public/uploads/khairinugroho.jpeg',
            alt_text: 'Khairi Nugroho',
            description: 'Official portrait displayed in the About section of the portfolio',
            order_index: 0,
            published: true
          },
          {
            id: 2,
            name: 'showcase_showreel',
            title: 'Operational System Screenshot',
            category: 'work',
            url: 'https://jnttmmhomgtpnkpymhfl.supabase.co/storage/v1/object/public/uploads/img-1792869792255.webp',
            alt_text: 'Operational System Preview',
            description: 'Showcase project preview screenshot for portfolio work documentation',
            order_index: 1,
            published: true
          }
        ])
      }
      if (method === 'POST') {
        const b = await request.json().catch(() => ({}))
        if (!b.url || !String(b.url).trim()) {
          return json({ error: 'URL is required' }, 400)
        }
        const payload = {
          name: b.name || `pic_${Date.now()}`,
          title: b.title || '',
          category: b.category || 'general',
          url: b.url || '',
          alt_text: b.alt_text || '',
          description: b.description || '',
          order_index: Number(b.order_index) || 0,
          published: b.published !== undefined ? Boolean(b.published) : true
        }
        const { data, error } = await supabase.from('pictures').insert(payload).select().single()
        if (error) throw error
        return json(data, 201)
      }
    }

    if (pathname.startsWith('/api/pictures/')) {
      const idOrName = decodeURIComponent(pathname.replace('/api/pictures/', ''))
      if (method === 'GET') {
        const { data } = await supabase.from('pictures').select('*').eq('name', idOrName).maybeSingle()
        if (data) return json(data)
        const { data: byId } = await supabase.from('pictures').select('*').eq('id', idOrName).maybeSingle()
        if (byId) return json(byId)
        return json({ error: 'Picture not found' }, 404)
      }
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const payload = {}
        if (b.name !== undefined) payload.name = b.name
        if (b.title !== undefined) payload.title = b.title
        if (b.category !== undefined) payload.category = b.category
        if (b.url !== undefined) payload.url = b.url
        if (b.alt_text !== undefined) payload.alt_text = b.alt_text
        if (b.description !== undefined) payload.description = b.description
        if (b.order_index !== undefined) payload.order_index = Number(b.order_index)
        if (b.published !== undefined) payload.published = Boolean(b.published)

        const { data, error } = await supabase.from('pictures').update(payload).eq('id', idOrName).select().single()
        if (error) throw error
        return json(data)
      }
      if (method === 'DELETE') {
        const { error } = await supabase.from('pictures').delete().eq('id', idOrName)
        if (error) throw error
        return json({ ok: true })
      }
    }

    // ---------- Auth ----------
    if (pathname === '/api/auth/status' && method === 'GET') {
      const { count, error } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true })
      if (error) throw error
      return json({ needsSetup: (count || 0) === 0 })
    }

    if (pathname === '/api/auth/setup' && method === 'POST') {
      const { username, password } = await request.json().catch(() => ({}))
      if (!username || !String(username).trim() || !password || String(password).length < 4) {
        return json({ error: 'Username and a password (min 4 characters) required' }, 400)
      }
      const { count } = await supabase.from('admin_users').select('*', { count: 'exact', head: true })
      if ((count || 0) > 0) {
        return json({ error: 'Setup already done — log in instead' }, 403)
      }
      const hash = await bcrypt.hash(String(password), 10)
      const { error } = await supabase.from('admin_users').insert({
        username: String(username).trim(),
        password_hash: hash
      })
      if (error) throw error
      return json({ ok: true })
    }

    if (pathname === '/api/auth/login' && method === 'POST') {
      const { username, password } = await request.json().catch(() => ({}))
      const { data: admin } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', String(username || '').trim())
        .maybeSingle()

      const ok = admin && (await bcrypt.compare(String(password || ''), admin.password_hash))
      if (!ok) return json({ error: 'Wrong username or password' }, 401)

      const token = jwt.sign({ id: admin.id, username: admin.username }, jwtSecret, {
        expiresIn: '7d'
      })
      return json({ token, username: admin.username })
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      const h = request.headers.get('Authorization') || ''
      const token = h.startsWith('Bearer ') ? h.slice(7) : null
      try {
        const payload = jwt.verify(token, jwtSecret)
        return json({ username: payload.username })
      } catch {
        return json({ error: 'Not logged in' }, 401)
      }
    }

    if (pathname === '/api/auth/account' && method === 'PUT') {
      const { username, password } = await request.json().catch(() => ({}))
      if (!username && !password) {
        return json({ error: 'Provide a new username or password' }, 400)
      }
      const { data: admin } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', adminPayload.id)
        .maybeSingle()

      if (!admin) return json({ error: 'Admin account not found' }, 404)

      let newUsername = admin.username
      let newHash = admin.password_hash

      if (username && String(username).trim()) {
        newUsername = String(username).trim()
      }
      if (password) {
        if (String(password).length < 4) {
          return json({ error: 'Password must be at least 4 characters' }, 400)
        }
        newHash = await bcrypt.hash(String(password), 10)
      }

      const { error } = await supabase
        .from('admin_users')
        .update({ username: newUsername, password_hash: newHash })
        .eq('id', adminPayload.id)

      if (error) throw error

      const token = jwt.sign({ id: adminPayload.id, username: newUsername }, jwtSecret, {
        expiresIn: '7d'
      })
      return json({ ok: true, username: newUsername, token })
    }

    if (pathname === '/api/auth/reset-local' && method === 'POST') {
      const { username, password } = await request.json().catch(() => ({}))
      if (!username || !password || String(password).length < 4) {
        return json({ error: 'Username and password (min 4 characters) required' }, 400)
      }
      const hash = await bcrypt.hash(String(password), 10)
      const { data: existing } = await supabase
        .from('admin_users')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle()

      let adminId
      if (existing) {
        adminId = existing.id
        await supabase.from('admin_users').update({ username: String(username).trim(), password_hash: hash }).eq('id', adminId)
      } else {
        const { data: ins } = await supabase.from('admin_users').insert({ username: String(username).trim(), password_hash: hash }).select().single()
        adminId = ins?.id
      }

      const token = jwt.sign({ id: adminId, username: String(username).trim() }, jwtSecret, {
        expiresIn: '7d'
      })
      return json({ ok: true, username: String(username).trim(), token })
    }

    return json({ error: 'API route not found' }, 404)
  } catch (err) {
    console.error('[Pages Function API Error]', err)
    return json({ error: err.message || 'Server error' }, 500)
  }
}
