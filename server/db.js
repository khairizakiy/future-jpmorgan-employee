import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[Database] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})
console.log(`[Database] Connected to Supabase (${SUPABASE_URL})`)

// ---------- Helpers for Case Study serialization in projects ----------
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

function normalizeSocialUrl(url) {
  if (!url || typeof url !== 'string') return url
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return 'https://' + trimmed
}


const DEFAULT_BIO = {
  id: 1,
  subtitle: '1 YEAR IN WEB DEVELOPMENT',
  paragraph_1: "I'm Khairi Nugroho, a vocational high school student driven by precision, discipline, and execution. Passionate about Formula 1 strategy, macroeconomics, finance, and market trading.",
  paragraph_2: "Currently available as a dependable everyday operator and virtual employee—handling Microsoft Excel data, Word documentation, research summarizing, and Personal Assistant operations.",
  content: "I'm Khairi Nugroho, a vocational high school student driven by precision, discipline, and execution. Passionate about Formula 1 strategy, macroeconomics, finance, and market trading.\n\nCurrently available as a dependable everyday operator and virtual employee—handling Microsoft Excel data, Word documentation, research summarizing, and Personal Assistant operations.",
  paragraphs: [
    "I'm Khairi Nugroho, a vocational high school student driven by precision, discipline, and execution. Passionate about Formula 1 strategy, macroeconomics, finance, and market trading.",
    "Currently available as a dependable everyday operator and virtual employee—handling Microsoft Excel data, Word documentation, research summarizing, and Personal Assistant operations."
  ]
}

function formatBio(row) {
  if (!row) return { ...DEFAULT_BIO }
  const p1 = (row.paragraph_1 !== undefined && row.paragraph_1 !== null)
    ? row.paragraph_1
    : DEFAULT_BIO.paragraph_1
  const p2 = (row.paragraph_2 !== undefined && row.paragraph_2 !== null)
    ? row.paragraph_2
    : DEFAULT_BIO.paragraph_2

  const paragraphs = [p1, p2].filter(Boolean)
  const content = paragraphs.join('\n\n')

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

let localBioMemory = null

export const db = {
  getMode: () => 'supabase',

  // ---------- Profile ----------
  getProfile: async () => {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    if (data) {
      if (!data.instagram_url && data.x_url) {
        data.instagram_url = data.x_url
      }
      if (data.linkedin_url) data.linkedin_url = normalizeSocialUrl(data.linkedin_url)
      if (data.github_url) data.github_url = normalizeSocialUrl(data.github_url)
      if (data.instagram_url) data.instagram_url = normalizeSocialUrl(data.instagram_url)
      if (data.x_url) data.x_url = normalizeSocialUrl(data.x_url)
    }
    return data
  },

  updateProfile: async (vals) => {
    const current = await db.getProfile()
    const instagram = vals.instagram_url !== undefined
      ? vals.instagram_url
      : (vals.x_url !== undefined ? vals.x_url : (current?.instagram_url || current?.x_url || null))

    const payload = {
      hero: vals.hero !== undefined ? vals.hero : (current?.hero ?? null),
      name: vals.name !== undefined ? vals.name : (current?.name ?? ''),
      who_am_i: vals.who_am_i !== undefined ? vals.who_am_i : (current?.who_am_i ?? ''),
      what_i_did: vals.what_i_did !== undefined ? vals.what_i_did : (current?.what_i_did ?? ''),
      school: vals.school !== undefined ? vals.school : (current?.school ?? ''),
      photo: vals.photo !== undefined ? vals.photo : (current?.photo ?? null),
      email: vals.email !== undefined ? vals.email : (current?.email ?? null),
      x_url: instagram ? normalizeSocialUrl(instagram) : null,
      github_url: vals.github_url !== undefined
        ? (vals.github_url ? normalizeSocialUrl(vals.github_url) : null)
        : (current?.github_url ?? null),
      linkedin_url: vals.linkedin_url !== undefined
        ? (vals.linkedin_url ? normalizeSocialUrl(vals.linkedin_url) : null)
        : (current?.linkedin_url ?? null),
      updated_at: new Date().toISOString()
    }

    let result = null
    if (current) {
      const withInsta = { ...payload, instagram_url: payload.x_url }
      const tryFirst = await supabase
        .from('profile')
        .update(withInsta)
        .eq('id', current.id)
        .select()
        .single()

      if (!tryFirst.error) {
        result = tryFirst.data
      } else {
        const fallback = await supabase
          .from('profile')
          .update(payload)
          .eq('id', current.id)
          .select()
          .single()
        if (fallback.error) throw fallback.error
        result = fallback.data
      }
    } else {
      const withInsta = { ...payload, instagram_url: payload.x_url }
      const tryFirst = await supabase.from('profile').insert(withInsta).select().single()
      if (!tryFirst.error) {
        result = tryFirst.data
      } else {
        const fallback = await supabase.from('profile').insert(payload).select().single()
        if (fallback.error) throw fallback.error
        result = fallback.data
      }
    }
    if (result) {
      result.instagram_url = result.instagram_url || result.x_url || null
      if (result.linkedin_url) result.linkedin_url = normalizeSocialUrl(result.linkedin_url)
      if (result.github_url) result.github_url = normalizeSocialUrl(result.github_url)
    }
    return result
  },


  // ---------- Bio (About Section) ----------
  getBio: async () => {
    try {
      const { data, error } = await supabase
        .from('bio')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (!error && data) {
        return formatBio(data)
      }
      if (error) {
        console.warn('[Supabase Bio Notice]', error.message)
      }
    } catch (err) {
      console.warn('[Supabase Bio Fallback]', err.message)
    }

    if (localBioMemory) {
      return formatBio(localBioMemory)
    }

    return { ...DEFAULT_BIO }
  },

  updateBio: async (vals) => {
    const current = await db.getBio()
    const subtitle = vals.subtitle !== undefined ? vals.subtitle : (current?.subtitle || DEFAULT_BIO.subtitle)
    const p1 = vals.paragraph_1 !== undefined ? vals.paragraph_1 : (current?.paragraph_1 ?? DEFAULT_BIO.paragraph_1)
    const p2 = vals.paragraph_2 !== undefined ? vals.paragraph_2 : (current?.paragraph_2 ?? DEFAULT_BIO.paragraph_2)
    const content = vals.content !== undefined ? vals.content : [p1, p2].filter(Boolean).join('\n\n')

    const payload = {
      subtitle,
      paragraph_1: p1,
      paragraph_2: p2,
      content,
      updated_at: new Date().toISOString()
    }

    localBioMemory = { ...current, ...payload }

    try {
      const { data: existing, error: existErr } = await supabase.from('bio').select('id').limit(1).maybeSingle()
      if (existing) {
        const { data, error } = await supabase
          .from('bio')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return formatBio(data)
      } else {
        const { data, error } = await supabase
          .from('bio')
          .insert({ id: 1, ...payload })
          .select()
          .single()
        if (error) throw error
        return formatBio(data)
      }
    } catch (err) {
      console.warn('[Supabase Bio Update Fallback]', err.message)
      return formatBio(localBioMemory)
    }
  },

  // ---------- Projects ----------
  getProjects: async (publishedOnly = true) => {
    let query = supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (publishedOnly) {
      query = query.eq('published', true)
    }
    const { data, error } = await query
    if (error) throw error
    return (data || []).map(formatProject)
  },

  getProject: async (id, publishedOnly = false) => {
    let query = supabase.from('projects').select('*').eq('id', id)
    if (publishedOnly) {
      query = query.eq('published', true)
    }
    const { data, error } = await query.maybeSingle()
    if (error) throw error
    return formatProject(data)
  },

  createProject: async (b) => {
    let imgUrl = b.image || null
    if (imgUrl && imgUrl.startsWith('/uploads/')) {
      const filename = imgUrl.replace('/uploads/', '')
      const diskPath = path.join(ROOT, 'public', 'uploads', filename)
      if (fs.existsSync(diskPath)) {
        try {
          const buf = fs.readFileSync(diskPath)
          const ext = path.extname(filename).toLowerCase()
          const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
          const sbUrl = await db.uploadToSupabaseStorage(filename, buf, mime)
          if (sbUrl) imgUrl = sbUrl
        } catch {}
      }
    }

    const payload = {
      title: b.title,
      category: b.category || 'OPERATIONS',
      progress: Math.min(5, Math.max(1, Number(b.progress) || 3)),
      description: serializeProjectDescription(b),
      url: b.url || null,
      image: imgUrl,
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
    return formatProject(res.data)
  },

  updateProject: async (id, b) => {
    const cur = await db.getProject(id, false)
    if (!cur) return null
    let newImage = b.image !== undefined ? b.image : cur.image
    if (newImage && newImage.startsWith('/uploads/')) {
      const filename = newImage.replace('/uploads/', '')
      const diskPath = path.join(ROOT, 'public', 'uploads', filename)
      if (fs.existsSync(diskPath)) {
        try {
          const buf = fs.readFileSync(diskPath)
          const ext = path.extname(filename).toLowerCase()
          const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
          const sbUrl = await db.uploadToSupabaseStorage(filename, buf, mime)
          if (sbUrl) newImage = sbUrl
        } catch {}
      }
    }

    const updateData = {
      title: b.title ?? cur.title,
      category: b.category === undefined ? cur.category : b.category || 'OPERATIONS',
      progress:
        b.progress === undefined
          ? cur.progress
          : Math.min(5, Math.max(1, Number(b.progress) || cur.progress || 3)),
      description: serializeProjectDescription(b, cur),
      url: b.url !== undefined ? b.url : cur.url,
      image: newImage,
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
    return formatProject(res.data)
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
    return true
  },

  // ---------- Threads ----------
  getThreads: async (publishedOnly = true) => {
    let q = supabase.from('threads').select('*').order('created_at', { ascending: false })
    if (publishedOnly) q = q.eq('published', true)
    const { data, error } = await q
    if (error) throw error
    return data || []
  },

  getThread: async (id, publishedOnly = false) => {
    let q = supabase.from('threads').select('*').eq('id', id)
    if (publishedOnly) q = q.eq('published', true)
    const { data, error } = await q.maybeSingle()
    if (error) throw error
    return data
  },

  createThread: async (b) => {
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
    return data
  },

  updateThread: async (id, b) => {
    const cur = await db.getThread(id, false)
    if (!cur) return null
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
    return data
  },

  deleteThread: async (id) => {
    const { error } = await supabase.from('threads').delete().eq('id', id)
    if (error) throw error
    return true
  },

  // ---------- Admin Auth ----------
  getAdminStatus: async () => {
    const { count, error } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    return { needsSetup: (count || 0) === 0 }
  },

  getAdminByUsername: async (username) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .maybeSingle()
    if (error) throw error
    return data
  },

  getAdminById: async (id) => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data
  },

  createAdmin: async (username, password_hash) => {
    const { data, error } = await supabase
      .from('admin_users')
      .insert({ username, password_hash })
      .select()
      .single()
    if (error) throw error
    return data
  },

  updateAdmin: async (id, username, password_hash) => {
    const { data, error } = await supabase
      .from('admin_users')
      .update({ username, password_hash })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  getFirstAdmin: async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  },

  // ---------- Services ----------
  getServices: async (publishedOnly = true) => {
    try {
      let q = supabase.from('services').select('*').order('order_index', { ascending: true })
      if (publishedOnly) {
        q = q.neq('published', false)
      }
      const { data, error } = await q
      if (!error && Array.isArray(data)) {
        return data.map((item) => ({
          ...item,
          title: item.title || item.name || item.service || ''
        }))
      }
      if (error) {
        console.warn('[Supabase Services Notice]', error.message)
      }
    } catch (err) {
      console.warn('[Supabase Services Fallback]', err.message)
    }
    return []
  },

  createService: async (b) => {
    const payload = {
      title: b.title || '',
      description: b.description || '',
      link: b.link || '',
      order_index: Number(b.order_index) || 0,
      published: b.published !== undefined ? Boolean(b.published) : true
    }
    const { data, error } = await supabase.from('services').insert(payload).select().single()
    if (error) throw error
    return data
  },

  updateService: async (id, b) => {
    const payload = {}
    if (b.title !== undefined) payload.title = b.title
    if (b.description !== undefined) payload.description = b.description
    if (b.link !== undefined) payload.link = b.link
    if (b.order_index !== undefined) payload.order_index = Number(b.order_index)
    if (b.published !== undefined) payload.published = Boolean(b.published)

    const { data, error } = await supabase.from('services').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  deleteService: async (id) => {
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) throw error
    return true
  },

  // ---------- Awards & Courses ----------
  getAwardsAndCourses: async (publishedOnly = true) => {
    try {
      let q = supabase.from('awards_and_courses').select('*').order('order_index', { ascending: true })
      if (publishedOnly) {
        q = q.neq('published', false)
      }
      const { data, error } = await q
      if (!error && Array.isArray(data)) {
        return data.map((item) => ({
          ...item,
          title: item.title || item.name || item.course || item.award || ''
        }))
      }
    } catch (err) {
      console.warn('[Supabase Awards Notice]', err.message)
    }
    return []
  },

  createAwardCourse: async (b) => {
    const payload = {
      title: b.title || '',
      description: b.description || '',
      link: b.link || '',
      order_index: Number(b.order_index) || 0,
      published: b.published !== undefined ? Boolean(b.published) : true
    }
    const { data, error } = await supabase.from('awards_and_courses').insert(payload).select().single()
    if (error) throw error
    return data
  },

  updateAwardCourse: async (id, b) => {
    const payload = {}
    if (b.title !== undefined) payload.title = b.title
    if (b.description !== undefined) payload.description = b.description
    if (b.link !== undefined) payload.link = b.link
    if (b.order_index !== undefined) payload.order_index = Number(b.order_index)
    if (b.published !== undefined) payload.published = Boolean(b.published)

    const { data, error } = await supabase.from('awards_and_courses').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  deleteAwardCourse: async (id) => {
    const { error } = await supabase.from('awards_and_courses').delete().eq('id', id)
    if (error) throw error
    return true
  },

  // ---------- Pictures (Media / Images in Supabase) ----------
  getPictures: async (publishedOnly = true) => {
    try {
      let q = supabase.from('pictures').select('*').order('order_index', { ascending: true })
      if (publishedOnly) {
        q = q.neq('published', false)
      }
      const { data, error } = await q
      if (!error && Array.isArray(data) && data.length > 0) return data
    } catch (err) {
      console.warn('[Supabase Pictures Notice]', err.message)
    }

    // Default pictures in Supabase Storage
    return [
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
    ]
  },

  getPictureByName: async (name) => {
    try {
      const { data, error } = await supabase.from('pictures').select('*').eq('name', name).maybeSingle()
      if (!error && data) return data
    } catch {}
    const all = await db.getPictures(false)
    return all.find((p) => p.name === name) || null
  },

  createPicture: async (b) => {
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
    return data
  },

  updatePicture: async (id, b) => {
    const payload = {}
    if (b.name !== undefined) payload.name = b.name
    if (b.title !== undefined) payload.title = b.title
    if (b.category !== undefined) payload.category = b.category
    if (b.url !== undefined) payload.url = b.url
    if (b.alt_text !== undefined) payload.alt_text = b.alt_text
    if (b.description !== undefined) payload.description = b.description
    if (b.order_index !== undefined) payload.order_index = Number(b.order_index)
    if (b.published !== undefined) payload.published = Boolean(b.published)

    const { data, error } = await supabase.from('pictures').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  deletePicture: async (id) => {
    const { error } = await supabase.from('pictures').delete().eq('id', id)
    if (error) throw error
    return true
  },

  uploadToSupabaseStorage: async (filename, buffer, mimeType) => {
    try {
      const { error } = await supabase.storage.from('uploads').upload(filename, buffer, {
        contentType: mimeType || 'image/jpeg',
        upsert: true
      })
      if (!error) {
        const { data } = supabase.storage.from('uploads').getPublicUrl(filename)
        return data?.publicUrl || null
      }
    } catch (e) {
      console.warn('[Supabase Storage upload warning]', e.message)
    }
    return null
  }
}
