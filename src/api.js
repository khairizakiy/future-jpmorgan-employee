const parse = async (res) => {
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`)
  return data
}

const call = (url, method = 'GET', body) => {
  const token = localStorage.getItem('token')
  return fetch(url, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  }).then(parse)
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

  profile: () => call('/api/profile'),
  gallery: () => call('/api/gallery'),
  updateProfile: (d) => call('/api/profile', 'PUT', d),
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

  projects: (scope = 'published') => call(`/api/projects${scope === 'all' ? '?all=1' : ''}`),
  project: (id) => call(`/api/projects/${id}`),
  createProject: (d) => call('/api/projects', 'POST', d),
  updateProject: (id, d) => call(`/api/projects/${id}`, 'PUT', d),
  deleteProject: (id) => call(`/api/projects/${id}`, 'DELETE'),

  threads: (scope = 'published') => call(`/api/threads${scope === 'all' ? '?all=1' : ''}`),
  thread: (id) => call(`/api/threads/${id}`),
  createThread: (d) => call('/api/threads', 'POST', d),
  updateThread: (id, d) => call(`/api/threads/${id}`, 'PUT', d),
  deleteThread: (id) => call(`/api/threads/${id}`, 'DELETE'),

  services: (scope = 'published') => call(`/api/services${scope === 'all' ? '?all=1' : ''}`),
  createService: (d) => call('/api/services', 'POST', d),
  updateService: (id, d) => call(`/api/services/${id}`, 'PUT', d),
  deleteService: (id) => call(`/api/services/${id}`, 'DELETE'),

  awards: (scope = 'published') => call(`/api/awards${scope === 'all' ? '?all=1' : ''}`),
  createAward: (d) => call('/api/awards', 'POST', d),
  updateAward: (id, d) => call(`/api/awards/${id}`, 'PUT', d),
  deleteAward: (id) => call(`/api/awards/${id}`, 'DELETE'),

  pictures: (scope = 'published') => call(`/api/pictures${scope === 'all' ? '?all=1' : ''}`),
  picture: (name) => call(`/api/pictures/${encodeURIComponent(name)}`),
  createPicture: (d) => call('/api/pictures', 'POST', d),
  updatePicture: (id, d) => call(`/api/pictures/${id}`, 'PUT', d),
  deletePicture: (id) => call(`/api/pictures/${id}`, 'DELETE')
}
