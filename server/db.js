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
  const p1 = (row.paragraph_1 !== undefined && row.paragraph_1 !== null && String(row.paragraph_1).trim() !== '')
    ? row.paragraph_1
    : DEFAULT_BIO.paragraph_1
  const p2 = (row.paragraph_2 !== undefined && row.paragraph_2 !== null && String(row.paragraph_2).trim() !== '')
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

      try {
        const local = db.getLocalData()
        local.profile = {
          ...(local.profile || {}),
          name: result.name,
          hero: result.hero,
          headline: result.hero,
          photo: result.photo,
          email: result.email,
          github_url: result.github_url,
          linkedin_url: result.linkedin_url,
          instagram_url: result.instagram_url,
          who_am_i: result.who_am_i,
          what_i_did: result.what_i_did,
          school: result.school
        }
        db.saveLocalData(local)
      } catch (err) {
        console.warn('[Sync local profile notice]', err.message)
      }
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
  },

  // ---------- Local File Helper Fallback ----------
  getLocalData: () => {
    try {
      const raw = fs.readFileSync(path.join(ROOT, 'db', 'portfolio-data.json'), 'utf8')
      return JSON.parse(raw)
    } catch {
      return {}
    }
  },

  saveLocalData: (data) => {
    try {
      const dir = path.join(ROOT, 'db')
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'portfolio-data.json'), JSON.stringify(data, null, 2), 'utf8')
    } catch (err) {
      console.error('[saveLocalData error]', err.message)
    }
  },

  // ---------- Experiences ----------
  getExperiences: async (publishedOnly = true) => {
    try {
      let q = supabase.from('experiences').select('*').order('order_index', { ascending: true })
      if (publishedOnly) q = q.eq('published', true)
      const { data, error } = await q
      if (!error && Array.isArray(data)) {
        return data.map((exp) => ({
          ...exp,
          logo: exp.logo || (exp.initial_bg && (exp.initial_bg.startsWith('http') || exp.initial_bg.startsWith('/uploads')) ? exp.initial_bg : ''),
          job_type: exp.job_type || (Array.isArray(exp.badges) && exp.badges[0]) || 'Full-time'
        }))
      }
    } catch (err) {
      console.warn('[Supabase Experiences Notice]', err.message)
    }
    const local = db.getLocalData()
    return (local.experiences || []).map((exp) => ({
      ...exp,
      logo: exp.logo || (exp.initial_bg && (exp.initial_bg.startsWith('http') || exp.initial_bg.startsWith('/uploads')) ? exp.initial_bg : ''),
      job_type: exp.job_type || (Array.isArray(exp.badges) && exp.badges[0]) || 'Full-time'
    }))
  },

  createExperience: async (b) => {
    const local = db.getLocalData()
    const logoUrl = b.logo || b.image || ''
    const jobType = b.job_type || (Array.isArray(b.badges) && b.badges[0]) || 'Full-time'
    const newExp = {
      id: Date.now(),
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
    try {
      const { data, error } = await supabase.from('experiences').insert(newExp).select().single()
      if (!error && data) return { ...data, logo: logoUrl, job_type: jobType }
      if (error) console.warn('[Supabase createExperience error]', error.message)
    } catch (err) {
      console.warn('[Supabase createExperience exception]', err.message)
    }
    const item = { ...newExp, logo: logoUrl, job_type: jobType }
    local.experiences = [...(local.experiences || []), item]
    db.saveLocalData(local)
    return item
  },

  updateExperience: async (id, b) => {
    const local = db.getLocalData()
    const logoUrl = b.logo !== undefined ? (b.logo || b.image || '') : undefined
    const jobType = b.job_type || (Array.isArray(b.badges) && b.badges[0]) || undefined

    const allowed = ['company', 'initial', 'initial_bg', 'role', 'location', 'period', 'star', 'description', 'badges', 'order_index', 'published']
    const payload = {}
    for (const k of allowed) {
      if (b[k] !== undefined) payload[k] = b[k]
    }
    if (logoUrl !== undefined) {
      payload.initial_bg = logoUrl || payload.initial_bg || '#1b1c18'
    }
    if (jobType !== undefined) {
      payload.badges = [jobType]
    }

    try {
      const { data, error } = await supabase.from('experiences').update(payload).eq('id', id).select().single()
      if (!error && data) {
        return {
          ...data,
          logo: logoUrl || (data.initial_bg && (data.initial_bg.startsWith('http') || data.initial_bg.startsWith('/uploads')) ? data.initial_bg : ''),
          job_type: jobType || (Array.isArray(data.badges) && data.badges[0]) || 'Full-time'
        }
      }
      if (error) console.warn('[Supabase updateExperience error]', error.message)
    } catch (err) {
      console.warn('[Supabase updateExperience exception]', err.message)
    } 
    if (local.experiences) {
      const idx = local.experiences.findIndex((e) => String(e.id) === String(id))
      if (idx !== -1) {
        local.experiences[idx] = {
          ...local.experiences[idx],
          ...payload,
          ...(logoUrl !== undefined ? { logo: logoUrl } : {}),
          ...(jobType !== undefined ? { job_type: jobType } : {})
        }
        db.saveLocalData(local)
        return local.experiences[idx]
      }
    }
    return null
  },

  deleteExperience: async (id) => {
    try {
      await supabase.from('experiences').delete().eq('id', id)
    } catch {}
    const local = db.getLocalData()
    if (local.experiences) {
      local.experiences = local.experiences.filter((e) => String(e.id) !== String(id))
      db.saveLocalData(local)
    }
    return true
  },

  // ---------- Music ----------
  getMusic: async () => {
    const DEFAULT_MOODS = {
      'lock-in': { title: 'Lock In', headliners: 'Aphex Twin, Floating Points', description: 'Polyrhythms and high-tempo modular synthesis for deep flow states. Also listening to: Four Tet, Jon Hopkins, Bicep, Overmono.' },
      'study': { title: 'Study', headliners: 'Nils Frahm, Brian Eno', description: 'Tactile felt piano, tape echoes, spatial acoustics. Also listening to: Harold Budd, Max Richter, Hania Rani.' },
      'game': { title: 'Game', headliners: 'Disasterpeace, Mick Gordon', description: 'Chiptune architecture and sub-octave drive. Also listening to: Lena Raine, Darren Korb, HEALTH.' },
      'drive': { title: 'Night Drive', headliners: 'Deftones, Kavinsky', description: 'Low-end punch through the Tiguan’s subwoofer on coastal 101. Also listening to: Gunship, The Midnight, Chromatics.' }
    }
    const mapAlbum = (a) => ({
      ...a,
      image: a.image || a.cover || (a.gradient && (a.gradient.startsWith('http') || a.gradient.startsWith('/uploads')) ? a.gradient : null)
    })
    try {
      const { data, error } = await supabase.from('music').select('*').order('order_index', { ascending: true })
      if (!error && Array.isArray(data) && data.length > 0) {
        const local = db.getLocalData()
        const moodRow = data.find((r) => r.tag === '__MOODS__' || r.title === '__MOODS__')
        let moods = { ...DEFAULT_MOODS, ...(local.music?.moods || {}) }
        if (moodRow && moodRow.note) {
          try {
            const parsed = JSON.parse(moodRow.note)
            if (parsed && typeof parsed === 'object') moods = parsed
          } catch {}
        }
        const albums = data.filter((r) => r.tag !== '__MOODS__' && r.title !== '__MOODS__').map(mapAlbum)
        return {
          total_albums: albums.length,
          current_status: local.music?.current_status || 'playing • 1.0x',
          albums,
          moods
        }
      }
    } catch (err) {
      console.warn('[Supabase Music Notice]', err.message)
    }
    const local = db.getLocalData()
    const fallbackAlbums = (local.music?.albums || []).filter((r) => r.tag !== '__MOODS__' && r.title !== '__MOODS__').map(mapAlbum)
    return {
      total_albums: fallbackAlbums.length,
      current_status: local.music?.current_status || 'playing • 1.0x',
      albums: fallbackAlbums,
      moods: local.music?.moods || DEFAULT_MOODS
    }
  },

  updateMusicMoods: async (moods) => {
    const serialized = JSON.stringify(moods)
    try {
      const { data: existing } = await supabase.from('music').select('id').eq('tag', '__MOODS__').maybeSingle()
      if (existing?.id) {
        await supabase.from('music').update({
          title: '__MOODS__',
          artist: 'System',
          tag: '__MOODS__',
          note: serialized,
          published: false
        }).eq('id', existing.id)
      } else {
        await supabase.from('music').insert({
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
      }
    } catch (err) {
      console.warn('[Supabase updateMusicMoods error]', err.message)
    }
    const local = db.getLocalData()
    if (!local.music) local.music = {}
    local.music.moods = moods
    db.saveLocalData(local)
    return moods
  },

  updateMusicAlbum: async (id, b) => {
    const local = db.getLocalData()
    const imgUrl = b.image !== undefined ? (b.image || b.cover || '') : undefined
    const payload = { ...b }
    if (imgUrl !== undefined) {
      payload.gradient = imgUrl || payload.gradient || 'linear-gradient(135deg, #1f2937, #111827)'
    }
    delete payload.image
    delete payload.cover

    try {
      const { data, error } = await supabase.from('music').update(payload).eq('id', id).select().single()
      if (!error && data) {
        return {
          ...data,
          image: imgUrl || (data.gradient && (data.gradient.startsWith('http') || data.gradient.startsWith('/uploads')) ? data.gradient : null)
        }
      }
    } catch {}
    if (local.music?.albums) {
      const idx = local.music.albums.findIndex((a) => String(a.id) === String(id))
      if (idx !== -1) {
        local.music.albums[idx] = { ...local.music.albums[idx], ...b, ...(imgUrl !== undefined ? { image: imgUrl } : {}) }
        db.saveLocalData(local)
        return local.music.albums[idx]
      }
    }
    return null
  },

  createMusicAlbum: async (b) => {
    const local = db.getLocalData()
    const imgUrl = b.image || b.cover || ''
    const newAlbum = {
      id: Date.now(),
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
    try {
      const { data, error } = await supabase.from('music').insert(newAlbum).select().single()
      if (!error && data) return { ...data, image: imgUrl }
    } catch {}
    if (!local.music) local.music = { albums: [] }
    if (!local.music.albums) local.music.albums = []
    const withImage = { ...newAlbum, image: imgUrl }
    local.music.albums.push(withImage)
    db.saveLocalData(local)
    return withImage
  },

  deleteMusicAlbum: async (id) => {
    try {
      await supabase.from('music').delete().eq('id', id)
    } catch {}
    const local = db.getLocalData()
    if (local.music?.albums) {
      local.music.albums = local.music.albums.filter((a) => String(a.id) !== String(id))
      db.saveLocalData(local)
    }
    return true
  },

  // ---------- 2021 Tiguan ----------
  getTiguan: async () => {
    try {
      const { data, error } = await supabase.from('tiguan').select('*').limit(1).maybeSingle()
      if (!error && data) {
        return data
      }
    } catch (err) {
      console.warn('[Supabase Tiguan Notice]', err.message)
    }
    const local = db.getLocalData()
    return local.tiguan || {}
  },

  updateTiguan: async (b) => {
    const local = db.getLocalData()
    try {
      const { data: cur } = await supabase.from('tiguan').select('id').limit(1).maybeSingle()
      if (cur) {
        const { data, error } = await supabase.from('tiguan').update(b).eq('id', cur.id).select().single()
        if (!error && data) return data
      } else {
        const { data, error } = await supabase.from('tiguan').insert({ id: 1, ...b }).select().single()
        if (!error && data) return data
      }
    } catch {}
    local.tiguan = { ...(local.tiguan || {}), ...b }
    db.saveLocalData(local)
    return local.tiguan
  },

  // ---------- Friends & Film ----------
  getFriends: async () => {
    try {
      const { data, error } = await supabase.from('friends').select('*').order('order_index', { ascending: true })
      if (!error && Array.isArray(data) && data.length > 0) {
        const local = db.getLocalData()
        return {
          title: local.friends?.title || 'friends & film',
          subtitle: local.friends?.subtitle || 'good people, roadtrips, and late diner coffee',
          photos: data
        }
      }
    } catch (err) {
      console.warn('[Supabase Friends Notice]', err.message)
    }
    const local = db.getLocalData()
    return local.friends || { title: 'friends & film', subtitle: 'good people, roadtrips, and late diner coffee', photos: [] }
  },

  createFriendsPhoto: async (b) => {
    const local = db.getLocalData()
    const newPhoto = {
      id: Date.now(),
      url: b.url || '',
      title: b.title || '',
      meta: b.meta || '',
      order_index: Number(b.order_index) || 0,
      published: true
    }
    try {
      const { data, error } = await supabase.from('friends').insert(newPhoto).select().single()
      if (!error && data) return data
    } catch {}
    if (!local.friends) local.friends = { title: 'friends & film', subtitle: 'good people, roadtrips, and late diner coffee', photos: [] }
    local.friends.photos.push(newPhoto)
    db.saveLocalData(local)
    return newPhoto
  },

  updateFriendsPhoto: async (id, b) => {
    const local = db.getLocalData()
    try {
      const { data, error } = await supabase.from('friends').update(b).eq('id', id).select().single()
      if (!error && data) return data
    } catch {}
    if (local.friends?.photos) {
      const idx = local.friends.photos.findIndex((p) => String(p.id) === String(id))
      if (idx !== -1) {
        local.friends.photos[idx] = { ...local.friends.photos[idx], ...b }
        db.saveLocalData(local)
        return local.friends.photos[idx]
      }
    }
    return null
  },

  deleteFriendsPhoto: async (id) => {
    try {
      await supabase.from('friends').delete().eq('id', id)
    } catch {}
    const local = db.getLocalData()
    if (local.friends?.photos) {
      local.friends.photos = local.friends.photos.filter((p) => String(p.id) !== String(id))
      db.saveLocalData(local)
    }
    return true
  },

  // ---------- Cat (Mochi) ----------
  getCat: async () => {
    try {
      const { data, error } = await supabase.from('cat').select('*').limit(1).maybeSingle()
      if (!error && data) {
        const local = db.getLocalData()
        return {
          ...data,
          purr_messages: local.cat?.purr_messages || []
        }
      }
    } catch (err) {
      console.warn('[Supabase Cat Notice]', err.message)
    }
    const local = db.getLocalData()
    return local.cat || { name: 'Mochi', role: 'Chief QA & Keyboard Blocker', pats: 0, photos: [], purr_messages: [] }
  },

  patCat: async () => {
    const local = db.getLocalData()
    let currentPats = Number(local.cat?.pats) || 0
    currentPats += 1
    if (local.cat) local.cat.pats = currentPats
    db.saveLocalData(local)

    try {
      const { data: cur } = await supabase.from('cat').select('id, pats').limit(1).maybeSingle()
      if (cur) {
        await supabase.from('cat').update({ pats: (cur.pats || 0) + 1 }).eq('id', cur.id)
      }
    } catch {}

    const msgs = local.cat?.purr_messages || [
      '// status: purring softly at 432 Hz',
      '// status: kneading the ergonomic keyboard',
      '// status: happy blink received ^_^',
      '// status: headbutting terminal cursor'
    ]
    const message = msgs[(currentPats - 1) % msgs.length]

    return {
      pats: currentPats,
      status_message: message + ' (total pats: ' + currentPats + ')'
    }
  },

  updateCat: async (b) => {
    const local = db.getLocalData()
    try {
      const { data: cur } = await supabase.from('cat').select('id').limit(1).maybeSingle()
      if (cur) {
        const { data, error } = await supabase.from('cat').update(b).eq('id', cur.id).select().single()
        if (!error && data) return data
      } else {
        const { data, error } = await supabase.from('cat').insert({ id: 1, ...b }).select().single()
        if (!error && data) return data
      }
    } catch {}
    local.cat = { ...(local.cat || {}), ...b }
    db.saveLocalData(local)
    return local.cat
  },

  // ---------- Full Aggregated Data for SSR ----------
  getFullPortfolio: async () => {
    const [profile, bio, projects, experiences, music, tiguan, friends, cat] = await Promise.all([
      db.getProfile().catch(() => null),
      db.getBio().catch(() => null),
      db.getProjects(true).catch(() => []),
      db.getExperiences(true).catch(() => []),
      db.getMusic().catch(() => ({})),
      db.getTiguan().catch(() => ({})),
      db.getFriends().catch(() => ({})),
      db.getCat().catch(() => ({}))
    ])

    const local = db.getLocalData()
    return {
      profile: profile || local.profile,
      bio: bio || local.bio,
      projects: Array.isArray(projects) ? projects : (local.projects || []),
      experiences: Array.isArray(experiences) ? experiences : (local.experiences || []),
      music: (music && music.albums && music.albums.length > 0) ? music : local.music,
      tiguan: (tiguan && tiguan.photos && tiguan.photos.length > 0) ? tiguan : local.tiguan,
      friends: (friends && friends.photos && friends.photos.length > 0) ? friends : local.friends,
      cat: (cat && cat.photos && cat.photos.length > 0) ? cat : local.cat,
      dbMode: db.getMode(),
      timestamp: new Date().toISOString()
    }
  }
}
