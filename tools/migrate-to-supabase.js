// Helper to verify connection and test Supabase tables
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

async function check() {
  console.log(`[Supabase Check] Connecting to ${SUPABASE_URL}...`)

  const tables = ['profile', 'bio', 'experiences', 'projects', 'music', 'tiguan', 'friends', 'cat', 'admin_users', 'pictures']
  for (const t of tables) {
    const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' }).limit(1)
    if (error) {
      console.log(`[-] Table '${t}': Not created yet (${error.message})`)
    } else {
      console.log(`[+] Table '${t}': Ready (${count ?? data?.length ?? 0} rows found)`)
    }
  }

  console.log('\nTo create or update the tables in Supabase:')
  console.log('1. Open Supabase Dashboard -> SQL Editor')
  console.log('2. Run the SQL file: supabase-schema.sql')
}

check()
