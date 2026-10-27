import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'db', 'portfolio-data.json'), 'utf8'))

async function seed() {
  console.log(`[Seed] Connecting to Supabase at ${SUPABASE_URL}...`)

  // 1. Update Profile
  console.log('Updating profile in Supabase...')
  const profilePayload = {
    name: data.profile.name,
    hero: data.profile.headline,
    who_am_i: data.profile.bio_paragraphs[0],
    what_i_did: data.profile.bio_paragraphs[1],
    school: data.profile.bio_paragraphs[2],
    photo: data.profile.photo,
    email: data.profile.email,
    x_url: data.profile.instagram_url,
    instagram_url: data.profile.instagram_url,
    github_url: data.profile.github_url,
    linkedin_url: data.profile.linkedin_url,
    updated_at: new Date().toISOString()
  }

  const { data: existingProf } = await supabase.from('profile').select('id').limit(1).maybeSingle()
  if (existingProf) {
    const { error } = await supabase.from('profile').update(profilePayload).eq('id', existingProf.id)
    if (error) console.warn('Profile update warning:', error.message)
    else console.log('[+] Profile updated successfully!')
  } else {
    const { error } = await supabase.from('profile').insert({ id: 1, ...profilePayload })
    if (error) console.warn('Profile insert warning:', error.message)
    else console.log('[+] Profile created successfully!')
  }

  // 2. Update Bio
  console.log('Updating bio in Supabase...')
  const bioPayload = {
    subtitle: data.profile.headline,
    paragraph_1: data.profile.bio_paragraphs[0],
    paragraph_2: data.profile.bio_paragraphs[1],
    content: data.profile.bio_paragraphs.join('\n\n'),
    updated_at: new Date().toISOString()
  }

  const { data: existingBio } = await supabase.from('bio').select('id').limit(1).maybeSingle()
  if (existingBio) {
    const { error } = await supabase.from('bio').update(bioPayload).eq('id', existingBio.id)
    if (error) console.warn('Bio update warning:', error.message)
    else console.log('[+] Bio updated successfully!')
  } else {
    const { error } = await supabase.from('bio').insert({ id: 1, ...bioPayload })
    if (error) console.warn('Bio insert warning:', error.message)
    else console.log('[+] Bio created successfully!')
  }

  // 3. Update Projects
  console.log('Updating projects in Supabase...')
  // Clear old demo projects
  await supabase.from('projects').delete().neq('id', 0)
  for (const p of data.projects) {
    const { error } = await supabase.from('projects').insert({
      id: p.id,
      title: p.title,
      category: p.category,
      progress: 5,
      description: p.description,
      image: p.image,
      url: p.links?.[0]?.url || 'https://github.com',
      published: true
    })
    if (error) console.warn(`Project insert warning for ${p.title}:`, error.message)
    else console.log(`[+] Inserted project: ${p.title}`)
  }

  // 4. Update Pictures
  console.log('Updating pictures gallery in Supabase...')
  await supabase.from('pictures').delete().neq('id', 0)
  const picturesToInsert = [
    {
      name: 'khairinugroho',
      title: 'Khairi Nugroho Portrait',
      category: 'profile',
      url: data.profile.photo,
      alt_text: 'Khairi Nugroho',
      description: 'khairinugroho.jpeg',
      order_index: 0,
      published: true
    },
    ...data.tiguan.photos.map((p, idx) => ({
      name: `tiguan_${p.id}`,
      title: p.caption,
      category: 'tiguan',
      url: p.url,
      alt_text: p.caption,
      description: p.caption,
      order_index: idx + 1,
      published: true
    })),
    ...data.friends.photos.map((p, idx) => ({
      name: `friend_${p.id}`,
      title: p.title,
      category: 'friends',
      url: p.url,
      alt_text: p.title,
      description: p.meta,
      order_index: idx + 10,
      published: true
    })),
    ...data.cat.photos.map((p, idx) => ({
      name: `cat_${p.id}`,
      title: p.caption,
      category: 'cat',
      url: p.url,
      alt_text: p.caption,
      description: p.caption,
      order_index: idx + 20,
      published: true
    }))
  ]

  for (const pic of picturesToInsert) {
    const { error } = await supabase.from('pictures').insert(pic)
    if (error) console.warn(`Picture insert notice for ${pic.name}:`, error.message)
  }
  console.log('[+] Pictures table synchronized with new photo media!')

  console.log('\n[Seed Completed Successfully!]')
}

seed().catch(console.error)
