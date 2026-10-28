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
    'https://jnttmmhomgtpnkpymhfl.supabase.co'

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

const DEFAULT_PROFILE = {
  name: 'Khairi Nugroho',
  hero: 'quantitative researcher • batam, id',
  who_am_i: 'Vocational high school student driven by precision, discipline, and execution. Passionate about Formula 1 strategy, macroeconomics, finance, and market trading.',
  what_i_did: 'Available as a dependable everyday operator and virtual employee—handling Microsoft Excel data, Word documentation, research summarizing, and Personal Assistant operations.',
  school: 'Vocational High School Student • Developer & Quantitative Researcher',
  photo: 'https://jnttmmhomgtpnkpymhfl.supabase.co/storage/v1/object/public/uploads/khairinugroho.jpeg',
  skills: [
    'Quantitative Research & Macro Strategy',
    'Financial Modeling & Quant Trading',
    'Advanced Microsoft Excel & Data Operations',
    'TypeScript, React, Node.js & Systems Architecture'
  ],
  email: 'khairinugroho@gmail.com',
  x_url: 'https://instagram.com/khairinugroho',
  github_url: 'https://github.com/khairinugroho',
  linkedin_url: 'https://linkedin.com/in/khairinugroho',
  spotify_url: 'https://open.spotify.com/user/j45vdoajmtkvdq33tunybf9o6?si=3163aa858f2341ab',
  resume_url: '#',
  motto: 'Precision is quiet; restraint speaks louder than ornamentation.'
}

const DEFAULT_BIO = {
  id: 1,
  subtitle: 'quantitative researcher • batam, id',
  paragraph_1: "Hi! I'm Khairi, a systems architect and software engineer based in Batam.",
  paragraph_2: "Most of my time goes into distributed backends, clean type-safe frontend architecture (TypeScript + Rust), and building tools that run fast without useless computational bloat.",
  content: "Hi! I'm Khairi, a systems architect and software engineer based in Batam.\n\nMost of my time goes into distributed backends, clean type-safe frontend architecture (TypeScript + Rust), and building tools that run fast without useless computational bloat.",
  paragraphs: [
    "Hi! I'm Khairi, a systems architect and software engineer based in Batam.",
    "Most of my time goes into distributed backends, clean type-safe frontend architecture (TypeScript + Rust), and building tools that run fast without useless computational bloat."
  ]
}

const DEFAULT_MOODS = {
  'lock-in': {
    title: 'Lock In',
    artists: 'Aphex Twin, Floating Points, Four Tet, Jon Hopkins, Bicep, Overmono'
  },
  'study': {
    title: 'Study',
    artists: 'Nils Frahm, Brian Eno, Harold Budd, Max Richter, Hania Rani'
  },
  'game': {
    title: 'Game',
    artists: 'Disasterpeace, Mick Gordon, Lena Raine, Darren Korb, HEALTH'
  },
  'drive': {
    title: 'Night Drive',
    artists: 'Deftones, Kavinsky, Gunship, The Midnight, Chromatics'
  }
}

function normalizeMoods(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_MOODS }
  const res = {}
  for (const [key, val] of Object.entries(raw)) {
    if (!val || typeof val !== 'object') continue
    let artists = val.artists || ''
    if (!artists) {
      if (val.headliners && val.description) {
        const also = val.description.includes('Also listening to:')
          ? val.description.split('Also listening to:')[1].replace(/\.$/, '').trim()
          : ''
        artists = [val.headliners, also].filter(Boolean).join(', ')
      } else {
        artists = val.headliners || val.description || ''
      }
    }
    res[key] = {
      title: val.title || key,
      artists
    }
  }
  return Object.keys(res).length > 0 ? res : { ...DEFAULT_MOODS }
}

function extractMoods(records) {
  const moodRow = (records || []).find((r) => r.tag === '__MOODS__' || r.title === '__MOODS__')
  if (moodRow && moodRow.note) {
    try {
      const parsed = JSON.parse(moodRow.note)
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return normalizeMoods(parsed)
      }
    } catch (e) {
      console.warn('Failed to parse moods JSON:', e)
    }
  }
  return { ...DEFAULT_MOODS }
}

function formatBio(row) {
  if (!row) return { ...DEFAULT_BIO }
  const p1 = (row.paragraph_1 !== undefined && row.paragraph_1 !== null && String(row.paragraph_1).trim() !== '')
    ? row.paragraph_1
    : DEFAULT_BIO.paragraph_1
  const p2 = (row.paragraph_2 !== undefined && row.paragraph_2 !== null && String(row.paragraph_2).trim() !== '')
    ? row.paragraph_2
    : DEFAULT_BIO.paragraph_2

  const paragraphs = [p1, p2].filter(Boolean)
  const content = row.content || paragraphs.join('\n\n')

  return {
    ...row,
    id: row.id || 1,
    subtitle: row.subtitle || DEFAULT_BIO.subtitle,
    paragraph_1: p1,
    paragraph_2: p2,
    content,
    paragraphs
  }
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
    id: row.id,
    summary,
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

function formatExperience(row) {
  if (!row) return null
  const logo = row.logo || (row.initial_bg && (row.initial_bg.startsWith('http') || row.initial_bg.startsWith('/uploads')) ? row.initial_bg : '')
  const job_type = row.job_type || (Array.isArray(row.badges) && row.badges[0]) || 'Full-time'
  return {
    ...row,
    logo,
    job_type
  }
}

function formatMusic(a) {
  if (!a) return null
  return {
    ...a,
    image: a.image || a.cover || (a.gradient && (a.gradient.startsWith('http') || a.gradient.startsWith('/uploads')) ? a.gradient : null)
  }
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
    'f2b735095f994daff427d53a228a6c1185712db39c2cc372f13403a9679e0a9d'

  // Supabase client instance
  const supabase = getSupabase(env)

  // JWT check for mutation endpoints (excluding public endpoints like login, setup, cat pat)
  let adminPayload = null
  const isPublicPost =
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/setup' ||
    pathname === '/api/auth/reset-local' ||
    pathname === '/api/cat/pat'

  if (method !== 'GET' && method !== 'HEAD' && !isPublicPost) {
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
        status: 'ok',
        server: 'online',
        database: 'supabase',
        hosting: 'cloudflare-pages (khairi.fun)',
        timestamp: new Date().toISOString()
      })
    }

    // ---------- Full Aggregated Data for Home Page ----------
    if (pathname === '/api/portfolio-full' && method === 'GET') {
      const [
        { data: profData },
        { data: bioData },
        { data: projData },
        { data: expData },
        { data: musData },
        { data: tigData },
        { data: frData },
        { data: catData }
      ] = await Promise.all([
        supabase.from('profile').select('*').limit(1).maybeSingle(),
        supabase.from('bio').select('*').limit(1).maybeSingle(),
        supabase.from('projects').select('*').eq('published', true).order('created_at', { ascending: false }),
        supabase.from('experiences').select('*').eq('published', true).order('order_index', { ascending: true }),
        supabase.from('music').select('*').order('order_index', { ascending: true }),
        supabase.from('tiguan').select('*').limit(1).maybeSingle(),
        supabase.from('friends').select('*').order('order_index', { ascending: true }),
        supabase.from('cat').select('*').limit(1).maybeSingle()
      ])

      let skillsData = []
      try {
        const { data: sRows, error: sErr } = await supabase.from('skills').select('*').eq('published', true).order('order_index', { ascending: true })
        if (!sErr && Array.isArray(sRows) && sRows.length > 0) {
          skillsData = sRows
        }
      } catch {}

      const rawProf = profData || DEFAULT_PROFILE
      const profile = {
        ...DEFAULT_PROFILE,
        ...rawProf,
        skills: rawProf.skills || (skillsData.length > 0 ? skillsData.map(s => s.name) : DEFAULT_PROFILE.skills),
        instagram_url: rawProf.instagram_url || rawProf.x_url || '',
        x_url: rawProf.x_url || rawProf.instagram_url || ''
      }
      const bio = formatBio(bioData)
      const projects = (projData || []).map(formatProject)
      const experiences = (expData || []).map(formatExperience)
      const rawMusData = musData || []
      const moods = extractMoods(rawMusData)
      const albums = rawMusData.filter((r) => r.tag !== '__MOODS__' && r.title !== '__MOODS__').map(formatMusic)
      const music = {
        total_albums: albums.length,
        current_status: 'playing • 1.0x',
        albums,
        moods
      }
      const tiguan = tigData || {
        title: '2021 Volkswagen Tiguan R-Line (MQB platform)',
        color: 'Deep Black Pearl',
        photos: [],
        mods: []
      }
      const friends = {
        title: 'friends & film',
        subtitle: 'good people, roadtrips, and late diner coffee',
        photos: frData || []
      }
      const cat = catData || {
        name: 'Mochi',
        role: 'Chief QA & Keyboard Blocker',
        pats: 0,
        photos: [],
        purr_messages: [
          '// status: purring softly at 432 Hz',
          '// status: kneading the ergonomic keyboard',
          '// status: happy blink received ^_^',
          '// status: headbutting terminal cursor'
        ]
      }

      return json({
        profile,
        bio,
        skills: skillsData.length > 0 ? skillsData : profile.skills,
        projects,
        experiences,
        music,
        tiguan,
        friends,
        cat,
        dbMode: 'supabase-pages',
        timestamp: new Date().toISOString()
      })
    }

    // ---------- Profile ----------
    if (pathname === '/api/profile') {
      if (method === 'GET') {
        const { data, error } = await supabase.from('profile').select('*').limit(1).maybeSingle()
        if (error) throw error
        const p = data || DEFAULT_PROFILE
        let skills = p.skills || DEFAULT_PROFILE.skills
        if (!p.skills) {
          try {
            const { data: sData } = await supabase.from('skills').select('*').order('order_index', { ascending: true })
            if (sData && sData.length > 0) skills = sData
          } catch {}
        }
        return json({
          ...DEFAULT_PROFILE,
          ...p,
          skills,
          instagram_url: p.instagram_url || p.x_url || '',
          x_url: p.x_url || p.instagram_url || ''
        })
      }
      if (method === 'PUT') {
        const body = await request.json().catch(() => ({}))
        const payload = { ...body }
        delete payload.id
        delete payload.created_at

        // Safely map instagram_url to x_url if present
        if (payload.instagram_url !== undefined) {
          if (!payload.x_url) payload.x_url = payload.instagram_url
          delete payload.instagram_url
        }

        // Parse skills if string with newlines
        let skillsList = null
        if (payload.skills !== undefined) {
          if (typeof payload.skills === 'string') {
            if (payload.skills.includes('\n')) {
              payload.skills = payload.skills.split('\n').map((s) => s.trim()).filter(Boolean)
            } else if (payload.skills.includes(',')) {
              payload.skills = payload.skills.split(',').map((s) => s.trim()).filter(Boolean)
            }
          }
          skillsList = Array.isArray(payload.skills) ? payload.skills : [payload.skills]
        }

        const { data: cur } = await supabase.from('profile').select('id').limit(1).maybeSingle()
        let result
        if (cur) {
          let updateRes = await supabase.from('profile').update(payload).eq('id', cur.id).select().single()
          if (updateRes.error && updateRes.error.message?.includes('skills')) {
            const fallbackPayload = { ...payload }
            delete fallbackPayload.skills
            updateRes = await supabase.from('profile').update(fallbackPayload).eq('id', cur.id).select().single()
          }
          if (updateRes.error) throw updateRes.error
          result = updateRes.data
        } else {
          let insertRes = await supabase.from('profile').insert({ id: 1, ...payload }).select().single()
          if (insertRes.error && insertRes.error.message?.includes('skills')) {
            const fallbackPayload = { ...payload }
            delete fallbackPayload.skills
            insertRes = await supabase.from('profile').insert({ id: 1, ...fallbackPayload }).select().single()
          }
          if (insertRes.error) throw insertRes.error
          result = insertRes.data
        }

        // Sync skills table if available
        if (skillsList && skillsList.length > 0) {
          try {
            await supabase.from('skills').delete().neq('id', 0)
            const rowsToInsert = skillsList.map((name, idx) => ({
              name: typeof name === 'object' ? (name.name || name.label) : String(name),
              category: 'General',
              order_index: idx + 1,
              published: true
            }))
            await supabase.from('skills').insert(rowsToInsert)
          } catch {}
        }

        return json({
          ...result,
          skills: payload.skills || result?.skills || DEFAULT_PROFILE.skills,
          instagram_url: result?.instagram_url || result?.x_url || '',
          x_url: result?.x_url || result?.instagram_url || ''
        })
      }
    }

    // ---------- Skills ----------
    if (pathname === '/api/skills') {
      if (method === 'GET') {
        let skills = DEFAULT_PROFILE.skills
        try {
          const { data, error } = await supabase.from('skills').select('*').eq('published', true).order('order_index', { ascending: true })
          if (!error && Array.isArray(data) && data.length > 0) skills = data
        } catch {}
        return json(skills)
      }
    }

    // ---------- Bio ----------
    if (pathname === '/api/bio') {
      if (method === 'GET') {
        const { data, error } = await supabase.from('bio').select('*').limit(1).maybeSingle()
        if (error) throw error
        return json(formatBio(data))
      }
      if (method === 'PUT') {
        const body = await request.json().catch(() => ({}))
        const { data: cur } = await supabase.from('bio').select('id').limit(1).maybeSingle()
        let result
        if (cur) {
          const { data, error } = await supabase.from('bio').update(body).eq('id', cur.id).select().single()
          if (error) throw error
          result = data
        } else {
          const { data, error } = await supabase.from('bio').insert({ id: 1, ...body }).select().single()
          if (error) throw error
          result = data
        }
        return json(formatBio(result))
      }
    }

    // ---------- Experiences ----------
    if (pathname === '/api/experiences') {
      if (method === 'GET') {
        const all = searchParams.get('all') === '1'
        let q = supabase.from('experiences').select('*').order('order_index', { ascending: true })
        if (!all) q = q.eq('published', true)
        const { data, error } = await q
        if (error) throw error
        return json((data || []).map(formatExperience))
      }
      if (method === 'POST') {
        const b = await request.json().catch(() => ({}))
        const logoUrl = b.logo || b.image || ''
        const jobType = b.job_type || (Array.isArray(b.badges) && b.badges[0]) || 'Full-time'
        const newExp = {
          company: b.company || '',
          initial: b.initial || (b.company ? b.company[0].toUpperCase() : 'E'),
          initial_bg: logoUrl || b.initial_bg || '#1b1c18',
          role: b.role || '',
          location: b.location || '',
          period: b.period || '',
          star: Boolean(b.star),
          description: b.description || '',
          badges: [jobType],
          order_index: Number(b.order_index) || 0,
          published: b.published !== false
        }
        const { data, error } = await supabase.from('experiences').insert(newExp).select().single()
        if (error) throw error
        return json(formatExperience(data), 201)
      }
    }

    if (pathname.startsWith('/api/experiences/')) {
      const id = pathname.replace('/api/experiences/', '')
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const logoUrl = b.logo !== undefined ? b.logo : undefined
        const jobType = b.job_type !== undefined ? b.job_type : undefined
        const payload = { ...b }
        delete payload.logo
        delete payload.job_type
        if (logoUrl !== undefined) payload.initial_bg = logoUrl
        if (jobType !== undefined) payload.badges = [jobType]

        const { data, error } = await supabase.from('experiences').update(payload).eq('id', id).select().single()
        if (error) throw error
        return json(formatExperience(data))
      }
      if (method === 'DELETE') {
        const { error } = await supabase.from('experiences').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }
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
        const caseStudy = {
          client: b.client || '',
          brief: b.brief || '',
          engagement: b.engagement || '',
          documentation: b.documentation || b.image || '',
          challenge: b.challenge || '',
          approach: b.approach || '',
          picture_docs: Array.isArray(b.picture_docs) ? b.picture_docs : [],
          quote: b.quote || '',
          outcome: b.outcome || '',
          summary: b.description || b.summary || ''
        }
        const newProj = {
          title: b.title || '',
          category: b.category || 'SYSTEMS',
          progress: Number(b.progress) || 5,
          description: JSON.stringify(caseStudy),
          image: b.image || caseStudy.documentation || '',
          url: b.url || '',
          star: Boolean(b.star),
          stars_count: b.stars_count || '',
          tags: Array.isArray(b.tags) ? b.tags : [],
          links: Array.isArray(b.links) ? b.links : [],
          published: b.published !== false
        }
        const { data, error } = await supabase.from('projects').insert(newProj).select().single()
        if (error) throw error
        return json(formatProject(data), 201)
      }
    }

    if (pathname.startsWith('/api/projects/')) {
      const id = pathname.replace('/api/projects/', '')
      if (method === 'GET') {
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
        if (error || !data) return json({ error: 'Project not found' }, 404)
        return json(formatProject(data))
      }
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const { data: cur } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
        if (!cur) return json({ error: 'Project not found' }, 404)

        const curFormatted = formatProject(cur)
        const caseStudy = {
          client: b.client !== undefined ? b.client : curFormatted.client,
          brief: b.brief !== undefined ? b.brief : curFormatted.brief,
          engagement: b.engagement !== undefined ? b.engagement : curFormatted.engagement,
          documentation: b.documentation !== undefined ? b.documentation : (b.image !== undefined ? b.image : curFormatted.documentation),
          challenge: b.challenge !== undefined ? b.challenge : curFormatted.challenge,
          approach: b.approach !== undefined ? b.approach : curFormatted.approach,
          picture_docs: b.picture_docs !== undefined ? b.picture_docs : curFormatted.picture_docs,
          quote: b.quote !== undefined ? b.quote : curFormatted.quote,
          outcome: b.outcome !== undefined ? b.outcome : curFormatted.outcome,
          summary: b.description !== undefined ? b.description : (b.summary !== undefined ? b.summary : curFormatted.summary)
        }
        const payload = { ...b }
        delete payload.client
        delete payload.brief
        delete payload.engagement
        delete payload.documentation
        delete payload.challenge
        delete payload.approach
        delete payload.picture_docs
        delete payload.quote
        delete payload.outcome
        delete payload.summary
        payload.description = JSON.stringify(caseStudy)

        const { data, error } = await supabase.from('projects').update(payload).eq('id', id).select().single()
        if (error) throw error
        return json(formatProject(data))
      }
      if (method === 'DELETE') {
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }
    }

    // ---------- Music Moods ----------
    if (pathname === '/api/music/moods') {
      if (method === 'GET') {
        const { data, error } = await supabase.from('music').select('*').eq('tag', '__MOODS__').maybeSingle()
        if (error) throw error
        let moods = { ...DEFAULT_MOODS }
        if (data && data.note) {
          try {
            const parsed = JSON.parse(data.note)
            if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
              moods = normalizeMoods(parsed)
            }
          } catch {}
        }
        return json({ moods })
      }
      if (method === 'PUT' || method === 'POST') {
        const b = await request.json().catch(() => ({}))
        const moods = b.moods || b
        const serialized = JSON.stringify(moods)

        const { data: existing } = await supabase.from('music').select('id').eq('tag', '__MOODS__').maybeSingle()
        if (existing?.id) {
          const { error } = await supabase.from('music').update({
            title: '__MOODS__',
            artist: 'System',
            tag: '__MOODS__',
            note: serialized,
            published: false
          }).eq('id', existing.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('music').insert({
            title: '__MOODS__',
            artist: 'System',
            year: '2026',
            genre: 'Config',
            tag: '__MOODS__',
            note: serialized,
            gradient: 'linear-gradient(135deg, #000, #111)',
            row_index: 0,
            order_index: 9999,
            published: false
          })
          if (error) throw error
        }
        return json({ ok: true, moods })
      }
    }

    // ---------- Music ----------
    if (pathname === '/api/music') {
      if (method === 'GET') {
        const { data, error } = await supabase.from('music').select('*').order('order_index', { ascending: true })
        if (error) throw error
        const rawData = data || []
        const moods = extractMoods(rawData)
        const albums = rawData.filter((r) => r.tag !== '__MOODS__' && r.title !== '__MOODS__').map(formatMusic)
        return json({
          total_albums: albums.length,
          current_status: 'playing • 1.0x',
          albums,
          moods
        })
      }
      if (method === 'POST') {
        const b = await request.json().catch(() => ({}))
        const imgUrl = b.image || b.cover || ''
        const newAlbum = {
          title: b.title || '',
          artist: b.artist || '',
          year: b.year || new Date().getFullYear().toString(),
          genre: b.genre || '',
          tag: b.tag || '',
          note: b.note || '',
          progress: Number(b.progress) || 50,
          time: b.time || '02:00 / 04:00',
          initial: b.initial || (b.artist ? b.artist.slice(0, 2).toUpperCase() : 'MU'),
          gradient: imgUrl || b.gradient || 'linear-gradient(135deg, #1f2937, #111827)',
          row_index: Number(b.row || b.row_index) || 1,
          order_index: Number(b.order_index) || 0,
          published: true
        }
        const { data, error } = await supabase.from('music').insert(newAlbum).select().single()
        if (error) throw error
        return json(formatMusic(data), 201)
      }
    }

    if (pathname.startsWith('/api/music/')) {
      const id = pathname.replace('/api/music/', '')
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const imgUrl = b.image !== undefined ? (b.image || b.cover || '') : undefined
        const payload = { ...b }
        if (imgUrl !== undefined) {
          payload.gradient = imgUrl || payload.gradient || 'linear-gradient(135deg, #1f2937, #111827)'
        }
        delete payload.image
        delete payload.cover

        const { data, error } = await supabase.from('music').update(payload).eq('id', id).select().single()
        if (error) throw error
        return json(formatMusic(data))
      }
      if (method === 'DELETE') {
        const { error } = await supabase.from('music').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }
    }

    // ---------- Tiguan ----------
    if (pathname === '/api/tiguan') {
      if (method === 'GET') {
        const { data, error } = await supabase.from('tiguan').select('*').limit(1).maybeSingle()
        if (error) throw error
        return json(data || {
          title: '2021 Volkswagen Tiguan R-Line (MQB platform)',
          color: 'Deep Black Pearl',
          photos: [],
          mods: []
        })
      }
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const { data: cur } = await supabase.from('tiguan').select('id').limit(1).maybeSingle()
        let result
        if (cur) {
          const { data, error } = await supabase.from('tiguan').update(b).eq('id', cur.id).select().single()
          if (error) throw error
          result = data
        } else {
          const { data, error } = await supabase.from('tiguan').insert({ id: 1, ...b }).select().single()
          if (error) throw error
          result = data
        }
        return json(result)
      }
    }

    // ---------- Friends ----------
    if (pathname === '/api/friends') {
      if (method === 'GET') {
        const { data, error } = await supabase.from('friends').select('*').order('order_index', { ascending: true })
        if (error) throw error
        return json({
          title: 'friends & film',
          subtitle: 'good people, roadtrips, and late diner coffee',
          photos: data || []
        })
      }
      if (method === 'POST') {
        const b = await request.json().catch(() => ({}))
        const newPhoto = {
          url: b.url || '',
          title: b.title || '',
          meta: b.meta || '',
          order_index: Number(b.order_index) || 0,
          published: true
        }
        const { data, error } = await supabase.from('friends').insert(newPhoto).select().single()
        if (error) throw error
        return json(data, 201)
      }
    }

    if (pathname.startsWith('/api/friends/')) {
      const id = pathname.replace('/api/friends/', '')
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const { data, error } = await supabase.from('friends').update(b).eq('id', id).select().single()
        if (error) throw error
        return json(data)
      }
      if (method === 'DELETE') {
        const { error } = await supabase.from('friends').delete().eq('id', id)
        if (error) throw error
        return json({ ok: true })
      }
    }

    // ---------- Cat (Mochi) ----------
    if (pathname === '/api/cat') {
      if (method === 'GET') {
        const { data, error } = await supabase.from('cat').select('*').limit(1).maybeSingle()
        if (error) throw error
        return json(data || {
          name: 'Mochi',
          role: 'Chief QA & Keyboard Blocker',
          pats: 0,
          photos: [],
          purr_messages: [
            '// status: purring softly at 432 Hz',
            '// status: kneading the ergonomic keyboard',
            '// status: happy blink received ^_^',
            '// status: headbutting terminal cursor'
          ]
        })
      }
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const { data: cur } = await supabase.from('cat').select('id').limit(1).maybeSingle()
        let result
        if (cur) {
          const { data, error } = await supabase.from('cat').update(b).eq('id', cur.id).select().single()
          if (error) throw error
          result = data
        } else {
          const { data, error } = await supabase.from('cat').insert({ id: 1, ...b }).select().single()
          if (error) throw error
          result = data
        }
        return json(result)
      }
    }

    if (pathname === '/api/cat/pat' && method === 'POST') {
      const { data: cur } = await supabase.from('cat').select('id, pats').limit(1).maybeSingle()
      let currentPats = (cur?.pats || 0) + 1
      if (cur) {
        await supabase.from('cat').update({ pats: currentPats }).eq('id', cur.id)
      } else {
        await supabase.from('cat').insert({ id: 1, name: 'Mochi', pats: currentPats })
      }
      const msgs = [
        '// status: purring softly at 432 Hz',
        '// status: kneading the ergonomic keyboard',
        '// status: happy blink received ^_^',
        '// status: headbutting terminal cursor'
      ]
      const message = msgs[(currentPats - 1) % msgs.length]
      return json({
        pats: currentPats,
        status_message: `${message} (total pats: ${currentPats})`
      })
    }

    // ---------- Pictures & Gallery ----------
    if (pathname === '/api/gallery' && method === 'GET') {
      const { data, error } = await supabase
        .from('pictures')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return json(data || [])
    }

    if (pathname === '/api/pictures') {
      if (method === 'GET') {
        const all = searchParams.get('all') === '1'
        let q = supabase.from('pictures').select('*').order('created_at', { ascending: false })
        if (!all) q = q.eq('published', true)
        const { data, error } = await q
        if (error) throw error
        return json(data || [])
      }
      if (method === 'POST') {
        const b = await request.json().catch(() => ({}))
        const { data, error } = await supabase.from('pictures').insert(b).select().single()
        if (error) throw error
        return json(data, 201)
      }
    }

    if (pathname.startsWith('/api/pictures/')) {
      const idOrName = decodeURIComponent(pathname.replace('/api/pictures/', ''))
      if (method === 'GET') {
        let q = supabase.from('pictures').select('*')
        if (/^\d+$/.test(idOrName)) q = q.eq('id', idOrName)
        else q = q.eq('name', idOrName)
        const { data, error } = await q.maybeSingle()
        if (error || !data) return json({ error: 'Picture not found' }, 404)
        return json(data)
      }
      if (method === 'PUT') {
        const b = await request.json().catch(() => ({}))
        const { data, error } = await supabase.from('pictures').update(b).eq('id', idOrName).select().single()
        if (error) throw error
        return json(data)
      }
      if (method === 'DELETE') {
        const { error } = await supabase.from('pictures').delete().eq('id', idOrName)
        if (error) throw error
        return json({ ok: true })
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

      // Attempt upload to Supabase storage 'uploads' or 'portfolio'
      let uploadErr = null
      let bucket = 'uploads'
      let { error: err1 } = await supabase.storage.from(bucket).upload(filename, arrayBuf, {
        contentType: mimeType,
        upsert: true
      })
      if (err1) {
        bucket = 'portfolio'
        const { error: err2 } = await supabase.storage.from(bucket).upload(filename, arrayBuf, {
          contentType: mimeType,
          upsert: true
        })
        uploadErr = err2
      }

      let publicUrl = null
      if (!uploadErr) {
        const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(filename)
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
        } catch {}
      }

      return json({
        path: publicUrl,
        url: publicUrl,
        supabaseUrl: publicUrl,
        picture: picRecord
      })
    }

    // ---------- Auth ----------
    if (pathname === '/api/auth/status' && method === 'GET') {
      const { count, error } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true })
      if (error) {
        // Table might not exist yet or empty
        return json({ needsSetup: true })
      }
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
      const trimmedUsername = String(username || '').trim()
      const inputPwd = String(password || '')

      if (!trimmedUsername || !inputPwd) {
        return json({ error: 'Username and password required' }, 400)
      }

      const { data: admin } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('username', trimmedUsername)
        .maybeSingle()

      if (!admin) return json({ error: 'Wrong username or password' }, 401)

      let ok = false
      if (admin.password_hash) {
        if (
          admin.password_hash.startsWith('$2a$') ||
          admin.password_hash.startsWith('$2b$') ||
          admin.password_hash.startsWith('$2y$')
        ) {
          ok = await bcrypt.compare(inputPwd, admin.password_hash)
        } else {
          ok = admin.password_hash.trim() === inputPwd.trim()
          if (ok) {
            try {
              const newHash = await bcrypt.hash(inputPwd.trim(), 10)
              await supabase.from('admin_users').update({ password_hash: newHash }).eq('id', admin.id)
            } catch {}
          }
        }
      }

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
      const trimmed = String(username || '').trim()
      if (!trimmed || !password || String(password).length < 4) {
        return json({ error: 'Username and password (min 4 characters) required' }, 400)
      }
      const hash = await bcrypt.hash(String(password), 10)
      const { data: existing } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('username', trimmed)
        .maybeSingle()

      let adminId
      if (existing) {
        adminId = existing.id
        await supabase.from('admin_users').update({ password_hash: hash }).eq('id', adminId)
      } else {
        const { data: firstAdmin } = await supabase
          .from('admin_users')
          .select('*')
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (firstAdmin) {
          adminId = firstAdmin.id
          await supabase.from('admin_users').update({ username: trimmed, password_hash: hash }).eq('id', adminId)
        } else {
          const { data: ins } = await supabase.from('admin_users').insert({ username: trimmed, password_hash: hash }).select().single()
          adminId = ins?.id
        }
      }

      const token = jwt.sign({ id: adminId, username: trimmed }, jwtSecret, {
        expiresIn: '7d'
      })
      return json({ ok: true, username: trimmed, token })
    }

    return json({ error: 'API route not found' }, 404)
  } catch (err) {
    console.error('[Pages Function API Error]', err)
    return json({ error: err.message || 'Server error' }, 500)
  }
}
