const parse = async (res) => {
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('text/html')) {
    throw new Error(`API endpoint returned HTML instead of JSON. Ensure the server or Cloudflare Pages Functions are active on khairi.fun.`)
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`)
  if (data === null) throw new Error(`Invalid response received (${res.status})`)
  return data
}

const call = async (url, method = 'GET', body) => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    })
    return await parse(res)
  } catch (err) {
    if (err.message && (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to fetch') || err.message.includes('500'))) {
      const target = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://khairi.fun/api'
      throw new Error(`API server is unreachable at ${target}. Ensure your server or Cloudflare Pages Functions are active.`)
    }
    throw err
  }
}

export const api = {
  authStatus: () => call('/api/auth/status'),
  authSetup: (d) => call('/api/auth/setup', 'POST', d),
  authLogin: (d) => call('/api/auth/login', 'POST', d),
  authMe: () => call('/api/auth/me'),
  authLogout: () => localStorage.removeItem('token'),
  authSaveToken: (t) => localStorage.setItem('token', t),
  authResetLocal: (d) => call('/api/auth/reset-local', 'POST', d),
  updateAccount: (d) => call('/api/auth/account', 'PUT', d),

  portfolioFull: () => call('/api/portfolio-full'),

  profile: () => call('/api/profile'),
  gallery: () => call('/api/gallery'),
  updateProfile: (d) => call('/api/profile', 'PUT', d),
  bio: () => call('/api/bio'),
  updateBio: (d) => call('/api/bio', 'PUT', d),
  upload: (file) => {
    const token = localStorage.getItem('token')
    const fd = new FormData()
    fd.append('photo', file)
    return fetch('/api/upload', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: fd
    }).then(parse)
  },

  experiences: (scope = 'published') => call(`/api/experiences${scope === 'all' ? '?all=1' : ''}`),
  createExperience: (d) => call('/api/experiences', 'POST', d),
  updateExperience: (id, d) => call(`/api/experiences/${id}`, 'PUT', d),
  deleteExperience: (id) => call(`/api/experiences/${id}`, 'DELETE'),

  projects: (scope = 'published') => call(`/api/projects${scope === 'all' ? '?all=1' : ''}`),
  project: (id) => call(`/api/projects/${id}`),
  createProject: (d) => call('/api/projects', 'POST', d),
  updateProject: (id, d) => call(`/api/projects/${id}`, 'PUT', d),
  deleteProject: (id) => call(`/api/projects/${id}`, 'DELETE'),

  music: () => call('/api/music'),
  createMusicAlbum: (d) => call('/api/music', 'POST', d),
  updateMusicAlbum: (id, d) => call(`/api/music/${id}`, 'PUT', d),
  deleteMusicAlbum: (id) => call(`/api/music/${id}`, 'DELETE'),

  tiguan: () => call('/api/tiguan'),
  updateTiguan: (d) => call('/api/tiguan', 'PUT', d),

  friends: () => call('/api/friends'),
  createFriendsPhoto: (d) => call('/api/friends', 'POST', d),
  updateFriendsPhoto: (id, d) => call(`/api/friends/${id}`, 'PUT', d),
  deleteFriendsPhoto: (id) => call(`/api/friends/${id}`, 'DELETE'),

  cat: () => call('/api/cat'),
  updateCat: (d) => call('/api/cat', 'PUT', d),
  patCat: () => call('/api/cat/pat', 'POST'),

  pictures: (scope = 'published') => call(`/api/pictures${scope === 'all' ? '?all=1' : ''}`),
  picture: (name) => call(`/api/pictures/${encodeURIComponent(name)}`),
  createPicture: (d) => call('/api/pictures', 'POST', d),
  updatePicture: (id, d) => call(`/api/pictures/${id}`, 'PUT', d),
  deletePicture: (id) => call(`/api/pictures/${id}`, 'DELETE')
}
