import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'

const emptyProject = {
  title: '',
  category: 'OPERATIONS',
  progress: 3,
  description: '',
  url: '',
  image: '',
  published: true,
  client: '',
  brief: '',
  engagement: '',
  documentation: '',
  challenge: '',
  approach: '',
  picture_docs: '',
  quote: '',
  outcome: ''
}

const CATEGORY_SUGGESTIONS = [
  'OPERATIONS',
  'FINANCE & TRADING',
  'WEB DEVELOPMENT',
  'AI & AUTOMATION',
  'QUANT SPREADSHEET',
  'RESEARCH & PA'
]

export default function Admin() {
  // Auth state: 'loading' | 'setup' | 'login' | 'ok'
  const [authView, setAuthView] = useState('loading')
  const [authMode, setAuthMode] = useState('login') // 'login' | 'reset'
  const [who, setWho] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authErr, setAuthErr] = useState('')

  // Active Tab
  const [activeTab, setActiveTab] = useState('projects') // 'projects' | 'profile' | 'security'

  // Projects State
  const [projects, setProjects] = useState([])
  const [projForm, setProjForm] = useState(emptyProject)
  const [editingId, setEditingId] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Profile State
  const [profile, setProfile] = useState({
    hero: '',
    name: '',
    who_am_i: '',
    what_i_did: '',
    school: '',
    photo: null,
    email: '',
    x_url: '',
    github_url: '',
    linkedin_url: ''
  })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Services & Awards State
  const [servicesList, setServicesList] = useState([])
  const [awardsList, setAwardsList] = useState([])
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', link: '', order_index: 0, published: true })
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [awardForm, setAwardForm] = useState({ title: '', description: '', link: '', order_index: 0, published: true })
  const [editingAwardId, setEditingAwardId] = useState(null)

  // Pictures & Media State (Supabase Auto-Sync)
  const [picturesList, setPicturesList] = useState([])
  const [pictureForm, setPictureForm] = useState({
    name: '',
    title: '',
    category: 'profile',
    url: '',
    alt_text: '',
    description: '',
    order_index: 0,
    published: true
  })
  const [editingPicId, setEditingPicId] = useState(null)
  const [uploadingPicMedia, setUploadingPicMedia] = useState(false)
  const picMediaInputRef = useRef(null)

  // Security Form State
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Feedback notifications
  const [toast, setToast] = useState(null)
  const formRef = useRef(null)
  const fileInputRef = useRef(null)
  const photoInputRef = useRef(null)
  const docMediaInputRef = useRef(null)
  const multiDocsInputRef = useRef(null)
  const [uploadingDocMedia, setUploadingDocMedia] = useState(false)
  const [uploadingMultiDocs, setUploadingMultiDocs] = useState(false)

  const showToast = (message, isError = false) => {
    setToast({ message, isError })
    setTimeout(() => setToast(null), 4000)
  }

  const loadAll = () => {
    Promise.all([
      api.projects('all'),
      api.profile(),
      api.services('all'),
      api.awards('all'),
      api.pictures('all')
    ])
      .then(([prList, prof, sList, aList, picList]) => {
        if (Array.isArray(prList)) setProjects(prList)
        if (prof) setProfile(prof)
        if (Array.isArray(sList)) setServicesList(sList)
        if (Array.isArray(aList)) setAwardsList(aList)
        if (Array.isArray(picList)) setPicturesList(picList)
      })
      .catch((err) => showToast(err.message, true))
  }

  // Check auth status on mount
  useEffect(() => {
    api
      .authStatus()
      .then(async ({ needsSetup }) => {
        if (needsSetup) {
          setAuthView('setup')
          return
        }
        if (!localStorage.getItem('token')) {
          setAuthView('login')
          return
        }
        try {
          const me = await api.authMe()
          setWho(me.username)
          setNewUsername(me.username)
          setAuthView('ok')
          loadAll()
        } catch {
          api.authLogout()
          setAuthView('login')
        }
      })
      .catch(() => setAuthView('login'))
  }, [])

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthErr('')
    try {
      const res = await api.authLogin({ username: usernameInput, password: passwordInput })
      api.authSaveToken(res.token)
      setWho(res.username)
      setNewUsername(res.username)
      setPasswordInput('')
      setAuthView('ok')
      loadAll()
      showToast(`Welcome, ${res.username}. Admin console loaded.`)
    } catch (ex) {
      setAuthErr(ex.message || 'Login failed. Check credentials.')
    }
  }

  // Setup handler (first-time only)
  const handleSetup = async (e) => {
    e.preventDefault()
    setAuthErr('')
    if (passwordInput.length < 4) {
      setAuthErr('Password must be at least 4 characters long.')
      return
    }
    try {
      await api.authSetup({ username: usernameInput, password: passwordInput })
      const res = await api.authLogin({ username: usernameInput, password: passwordInput })
      api.authSaveToken(res.token)
      setWho(res.username)
      setNewUsername(res.username)
      setPasswordInput('')
      setAuthView('ok')
      loadAll()
      showToast('Admin account created successfully.')
    } catch (ex) {
      setAuthErr(ex.message || 'Setup failed.')
    }
  }

  // Local reset handler (for when credentials are forgotten)
  const handleResetLocal = async (e) => {
    e.preventDefault()
    setAuthErr('')
    if (passwordInput.length < 4) {
      setAuthErr('Password must be at least 4 characters long.')
      return
    }
    try {
      const res = await api.authResetLocal({ username: usernameInput, password: passwordInput })
      api.authSaveToken(res.token)
      setWho(res.username)
      setNewUsername(res.username)
      setPasswordInput('')
      setAuthView('ok')
      loadAll()
      showToast(`Admin account updated & logged in as ${res.username}.`)
    } catch (ex) {
      setAuthErr(ex.message || 'Reset failed.')
    }
  }

  // Logout handler
  const handleLogout = () => {
    api.authLogout()
    setWho('')
    setAuthView('login')
    showToast('Logged out.')
  }

  // Image Upload handler for Project
  const handleProjectImageUpload = async (file) => {
    if (!file) return
    setUploadingImage(true)
    try {
      const res = await api.upload(file)
      if (res && res.path) {
        setProjForm((prev) => ({ ...prev, image: res.path }))
        showToast('Image uploaded and attached.')
      }
    } catch (ex) {
      showToast(ex.message || 'Upload failed', true)
    } finally {
      setUploadingImage(false)
    }
  }

  // Photo Upload handler for Profile
  const handleProfilePhotoUpload = async (file) => {
    if (!file) return
    setUploadingPhoto(true)
    try {
      const res = await api.upload(file)
      if (res && res.path) {
        setProfile((prev) => ({ ...prev, photo: res.path }))
        await api.updateProfile({ photo: res.path })
        api.pictures('all').then((pList) => {
          if (Array.isArray(pList)) setPicturesList(pList)
        }).catch(() => {})
        showToast('Profile photo uploaded and synchronized to Supabase.')
      }
    } catch (ex) {
      showToast(ex.message || 'Photo upload failed', true)
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Documentation (Monitor Media) Upload handler
  const handleDocumentationUpload = async (file) => {
    if (!file) return
    setUploadingDocMedia(true)
    try {
      const res = await api.upload(file)
      if (res && res.path) {
        setProjForm((prev) => ({ ...prev, documentation: res.path }))
        showToast('Hero documentation media uploaded.')
      }
    } catch (ex) {
      showToast(ex.message || 'Documentation upload failed', true)
    } finally {
      setUploadingDocMedia(false)
    }
  }

  // Multiple Picture Docs Upload handler
  const handleMultiDocsUpload = async (files) => {
    if (!files || !files.length) return
    setUploadingMultiDocs(true)
    try {
      const list = Array.from(files)
      const uploadPromises = list.map((f) => api.upload(f))
      const results = await Promise.all(uploadPromises)
      const paths = results.filter((r) => r?.path).map((r) => r.path)
      setProjForm((prev) => {
        const existing = typeof prev.picture_docs === 'string'
          ? prev.picture_docs.split('\n').map((s) => s.trim()).filter(Boolean)
          : Array.isArray(prev.picture_docs) ? prev.picture_docs : []
        const combined = [...existing, ...paths]
        return { ...prev, picture_docs: combined.join('\n') }
      })
      showToast(`Uploaded ${paths.length} documentation pictures.`)
    } catch (ex) {
      showToast(ex.message || 'Picture documentation upload failed', true)
    } finally {
      setUploadingMultiDocs(false)
    }
  }

  // Project Submit (Create or Update)
  const handleProjectSubmit = async (e) => {
    e.preventDefault()
    if (!projForm.title.trim()) {
      showToast('Project title is required.', true)
      return
    }

    const payload = {
      title: projForm.title,
      category: projForm.category || 'General',
      progress: Number(projForm.progress) || 3,
      description: projForm.description,
      url: projForm.url,
      image: projForm.image,
      published: projForm.published,
      client: projForm.client,
      brief: projForm.brief,
      engagement: projForm.engagement,
      documentation: projForm.documentation,
      challenge: projForm.challenge,
      approach: projForm.approach,
      picture_docs: projForm.picture_docs,
      quote: projForm.quote,
      outcome: projForm.outcome
    }

    try {
      if (editingId) {
        // Update existing project
        const updated = await api.updateProject(editingId, payload)
        setProjects((prev) => prev.map((p) => (p.id === editingId ? updated : p)))
        showToast(`Project #${editingId} updated successfully.`)
        handleCancelEdit()
      } else {
        // Create new project
        const created = await api.createProject(payload)
        setProjects((prev) => [created, ...prev])
        setProjForm(emptyProject)
        showToast('New project published.')
      }
    } catch (ex) {
      showToast(ex.message || 'Operation failed', true)
    }
  }

  // Trigger Edit
  const startEditing = (p) => {
    setEditingId(p.id)
    setProjForm({
      title: p.title || '',
      category: p.category || 'OPERATIONS',
      progress: p.progress || 3,
      description: p.description || '',
      url: p.url || '',
      image: p.image || '',
      published: Boolean(p.published),
      client: p.client || '',
      brief: p.brief || '',
      engagement: p.engagement || '',
      documentation: p.documentation || '',
      challenge: p.challenge || '',
      approach: p.approach || '',
      picture_docs: Array.isArray(p.picture_docs) ? p.picture_docs.join('\n') : (p.picture_docs || ''),
      quote: p.quote || '',
      outcome: p.outcome || ''
    })
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null)
    setProjForm(emptyProject)
  }

  // Toggle Publish
  const handleTogglePublish = async (p) => {
    try {
      const updated = await api.updateProject(p.id, { published: !p.published })
      setProjects((prev) => prev.map((item) => (item.id === p.id ? updated : item)))
      showToast(`Project #${p.id} set to ${updated.published ? 'Published' : 'Draft'}.`)
    } catch (ex) {
      showToast(ex.message || 'Toggle failed', true)
    }
  }

  // Delete Project
  const handleDeleteProject = async (p) => {
    if (!window.confirm(`Are you sure you want to delete "${p.title}"? This cannot be undone.`)) {
      return
    }
    try {
      await api.deleteProject(p.id)
      setProjects((prev) => prev.filter((item) => item.id !== p.id))
      if (editingId === p.id) handleCancelEdit()
      showToast(`Project "${p.title}" deleted.`)
    } catch (ex) {
      showToast(ex.message || 'Delete failed', true)
    }
  }

  // Save Profile Info
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      const updated = await api.updateProfile(profile)
      setProfile(updated)
      showToast('Profile information saved.')
    } catch (ex) {
      showToast(ex.message || 'Failed to save profile', true)
    }
  }

  // Save Account Credentials (change username/password)
  const handleSaveSecurity = async (e) => {
    e.preventDefault()
    if (newPassword && newPassword.length < 4) {
      showToast('Password must be at least 4 characters long.', true)
      return
    }
    if (newPassword && newPassword !== confirmPassword) {
      showToast('Passwords do not match.', true)
      return
    }

    try {
      const res = await api.updateAccount({
        username: newUsername,
        password: newPassword || undefined
      })
      if (res && res.token) {
        api.authSaveToken(res.token)
        setWho(res.username)
      }
      setNewPassword('')
      setConfirmPassword('')
      showToast('Account credentials updated successfully. Token refreshed.')
    } catch (ex) {
      showToast(ex.message || 'Failed to update account', true)
    }
  }

  // Service Handlers
  const handleSaveService = async (e) => {
    e.preventDefault()
    if (!serviceForm.title.trim()) {
      showToast('Service title is required.', true)
      return
    }
    try {
      if (editingServiceId) {
        const updated = await api.updateService(editingServiceId, serviceForm)
        setServicesList((prev) => prev.map((s) => (s.id === editingServiceId ? updated : s)))
        showToast('Service updated successfully.')
        setEditingServiceId(null)
      } else {
        const created = await api.createService(serviceForm)
        setServicesList((prev) => [...prev, created])
        showToast('Service created successfully.')
      }
      setServiceForm({ title: '', description: '', link: '', order_index: 0, published: true })
    } catch (ex) {
      showToast(ex.message || 'Failed to save service', true)
    }
  }

  const handleEditService = (s) => {
    setEditingServiceId(s.id)
    setServiceForm({
      title: s.title || '',
      description: s.description || '',
      link: s.link || '',
      order_index: s.order_index ?? 0,
      published: s.published !== undefined ? Boolean(s.published) : true
    })
  }

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service permanently?')) return
    try {
      await api.deleteService(id)
      setServicesList((prev) => prev.filter((s) => s.id !== id))
      showToast('Service deleted.')
    } catch (ex) {
      showToast(ex.message || 'Failed to delete service', true)
    }
  }

  // Award / Course Handlers
  const handleSaveAward = async (e) => {
    e.preventDefault()
    if (!awardForm.title.trim()) {
      showToast('Award/Course title is required.', true)
      return
    }
    try {
      if (editingAwardId) {
        const updated = await api.updateAward(editingAwardId, awardForm)
        setAwardsList((prev) => prev.map((a) => (a.id === editingAwardId ? updated : a)))
        showToast('Award/Course updated successfully.')
        setEditingAwardId(null)
      } else {
        const created = await api.createAward(awardForm)
        setAwardsList((prev) => [...prev, created])
        showToast('Award/Course created successfully.')
      }
      setAwardForm({ title: '', description: '', link: '', order_index: 0, published: true })
    } catch (ex) {
      showToast(ex.message || 'Failed to save award/course', true)
    }
  }

  const handleEditAward = (a) => {
    setEditingAwardId(a.id)
    setAwardForm({
      title: a.title || '',
      description: a.description || '',
      link: a.link || '',
      order_index: a.order_index ?? 0,
      published: a.published !== undefined ? Boolean(a.published) : true
    })
  }

  const handleDeleteAward = async (id) => {
    if (!window.confirm('Delete this award/course permanently?')) return
    try {
      await api.deleteAward(id)
      setAwardsList((prev) => prev.filter((a) => a.id !== id))
      showToast('Award/Course deleted.')
    } catch (ex) {
      showToast(ex.message || 'Failed to delete award/course', true)
    }
  }

  // Pictures & Media Handlers (Supabase Auto-Sync)
  const handlePictureUpload = async (file) => {
    if (!file) return
    setUploadingPicMedia(true)
    try {
      const res = await api.upload(file)
      if (res && res.path) {
        const cleanName = (file.name || 'image').replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '_')
        setPictureForm((prev) => ({
          ...prev,
          url: res.path,
          name: prev.name || cleanName,
          title: prev.title || file.name.replace(/\.[^/.]+$/, '')
        }))
        showToast('Image uploaded directly to Supabase Storage.')
      }
    } catch (ex) {
      showToast(ex.message || 'Upload failed', true)
    } finally {
      setUploadingPicMedia(false)
    }
  }

  const handleSavePicture = async (e) => {
    e.preventDefault()
    if (!pictureForm.url.trim()) {
      showToast('Picture URL or uploaded file is required.', true)
      return
    }
    const cleanName = (pictureForm.name || pictureForm.title || `pic_${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')

    const payload = {
      ...pictureForm,
      name: cleanName
    }

    try {
      if (editingPicId) {
        const updated = await api.updatePicture(editingPicId, payload)
        setPicturesList((prev) => prev.map((p) => (p.id === editingPicId ? updated : p)))
        showToast('Picture updated in Supabase.')
        setEditingPicId(null)
      } else {
        const created = await api.createPicture(payload)
        setPicturesList((prev) => [created, ...prev])
        showToast('Picture saved directly to Supabase.')
      }
      setPictureForm({
        name: '',
        title: '',
        category: 'profile',
        url: '',
        alt_text: '',
        description: '',
        order_index: 0,
        published: true
      })
    } catch (ex) {
      showToast(ex.message || 'Failed to save picture in Supabase', true)
    }
  }

  const handleEditPicture = (p) => {
    setEditingPicId(p.id)
    setPictureForm({
      name: p.name || '',
      title: p.title || '',
      category: p.category || 'profile',
      url: p.url || '',
      alt_text: p.alt_text || '',
      description: p.description || '',
      order_index: p.order_index ?? 0,
      published: p.published !== undefined ? Boolean(p.published) : true
    })
  }

  const handleDeletePicture = async (id) => {
    if (!window.confirm('Delete this picture record from Supabase permanently?')) return
    try {
      await api.deletePicture(id)
      setPicturesList((prev) => prev.filter((p) => p.id !== id))
      showToast('Picture deleted from Supabase.')
    } catch (ex) {
      showToast(ex.message || 'Failed to delete picture', true)
    }
  }

  // RENDER: Loading
  if (authView === 'loading') {
    return (
      <div className="nb-admin-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="nb-admin-badge">SYSTEM // INITIALIZING</span>
          <p className="mono-micro" style={{ marginTop: '16px', color: 'rgba(250, 248, 245, 0.6)' }}>
            LOADING SECURE CONSOLE…
          </p>
        </div>
      </div>
    )
  }

  // RENDER: Auth Screen (Login or Setup)
  if (authView === 'setup' || authView === 'login') {
    return (
      <div className="nb-admin-root">
        {/* Minimal Header */}
        <header className="nb-admin-header">
          <div className="nb-admin-header-inner">
            <a href="/" className="nb-admin-brand">
              <span className="kjoy-bizcard-monogram" style={{ width: '28px', height: '28px', fontSize: '13px' }}>
                K
              </span>
              <span className="mono-micro" style={{ letterSpacing: '0.12em' }}>
                KHAIRI NUGROHO
              </span>
            </a>
            <a href="/" className="nb-btn nb-btn-outline nb-btn-sm">
              ← BACK TO WEBSITE
            </a>
          </div>
        </header>

        <div className="nb-auth-stage">
          <div className="nb-auth-card">
            <div style={{ marginBottom: '24px' }}>
              <div className="nb-admin-badge" style={{ marginBottom: '12px' }}>
                {authView === 'setup'
                  ? '[FIRST-TIME INITIALIZATION]'
                  : authMode === 'reset'
                    ? '[LOCAL CREDENTIALS RESET]'
                    : '[AUTHENTICATED ACCESS ONLY]'}
              </div>
              <h1 className="nb-admin-title" style={{ fontSize: '32px' }}>
                {authView === 'setup'
                  ? 'CREATE ADMIN'
                  : authMode === 'reset'
                    ? 'SET PASSWORD'
                    : 'ADMIN LOGIN'}
              </h1>
              <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.6)', marginTop: '8px' }}>
                {authView === 'setup'
                  ? 'First time here. Set your admin credentials. Stored securely in database, never in git.'
                  : authMode === 'reset'
                    ? 'Type your preferred username & password below. Will update MySQL and log in immediately.'
                    : 'Enter your credentials to manage projects and site content.'}
              </p>
            </div>

            {authErr && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  color: '#f87171',
                  padding: '12px 14px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  marginBottom: '20px'
                }}
              >
                [AUTH ERROR] {authErr}
              </div>
            )}

            <form
              onSubmit={
                authView === 'setup'
                  ? handleSetup
                  : authMode === 'reset'
                    ? handleResetLocal
                    : handleLogin
              }
            >
              <div className="nb-form-group" style={{ marginBottom: '18px' }}>
                <label className="nb-label">USERNAME</label>
                <input
                  type="text"
                  className="nb-input"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin username"
                  required
                  autoFocus
                />
              </div>

              <div className="nb-form-group" style={{ marginBottom: '26px' }}>
                <label className="nb-label">
                  PASSWORD {authView === 'setup' && '(MIN 4 CHARACTERS)'}
                </label>
                <input
                  type="password"
                  className="nb-input"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="nb-btn nb-btn-primary"
                style={{ width: '100%', padding: '14px' }}
              >
                {authView === 'setup'
                  ? 'INITIALIZE & LOG IN →'
                  : authMode === 'reset'
                    ? 'SET CREDENTIALS & LOG IN →'
                    : 'ACCESS CONSOLE →'}
              </button>
            </form>

            {authView !== 'setup' && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthErr('')
                    setAuthMode((prev) => (prev === 'login' ? 'reset' : 'login'))
                  }}
                  className="mono-micro"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#7A0E22',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  {authMode === 'login'
                    ? 'FORGOT PASSWORD? SET / RESET LOCALLY'
                    : '← BACK TO STANDARD LOGIN'}
                </button>
              </div>
            )}

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(250, 248, 245, 0.1)' }}>
              <p className="mono-micro" style={{ fontSize: '10px', color: 'rgba(250, 248, 245, 0.45)' }}>
                CREDENTIALS SAFEGUARDED • BCRYPT 10 ROUNDS • ZERO HARDCODED KEYS
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // RENDER: Main Admin Console
  return (
    <div className="nb-admin-root">
      {/* Top Header */}
      <header className="nb-admin-header">
        <div className="nb-admin-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="/" className="nb-admin-brand">
              <span className="kjoy-bizcard-monogram" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                K
              </span>
              <div>
                <span className="mono-micro" style={{ fontWeight: 600, letterSpacing: '0.1em' }}>
                  KHAIRI NUGROHO
                </span>
                <span className="mono-micro" style={{ display: 'block', fontSize: '9px', color: 'rgba(250, 248, 245, 0.4)' }}>
                  PORTFOLIO HQ
                </span>
              </div>
            </a>
            <span className="nb-admin-badge">[CONTROL ROOM]</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a href="/" className="nb-btn nb-btn-outline nb-btn-sm">
              VIEW SITE ↗
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.6)', fontSize: '10px' }}>
                LOGGED IN AS: <strong style={{ color: '#FAF8F5' }}>{who}</strong>
              </span>
              <button type="button" onClick={handleLogout} className="nb-btn nb-btn-outline nb-btn-sm" style={{ borderColor: 'rgba(250, 248, 245, 0.2)' }}>
                LOG OUT
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="nb-admin-container">
        {/* Hero Title Row */}
        <div className="nb-admin-title-row">
          <div>
            <div className="mono-micro" style={{ color: '#7A0E22', letterSpacing: '0.14em', fontWeight: 600 }}>
              CONTENT &amp; PORTFOLIO ENGINE
            </div>
            <h1 className="nb-admin-title">ADMIN CONSOLE</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span className="nb-status-pill published">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
              SERVER // ONLINE
            </span>
            <span className="nb-status-pill draft">
              {projects.length} PROJECTS REGISTERED
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="nb-admin-tabs">
          <button
            type="button"
            className={`nb-admin-tab ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            [01 // PROJECTS MANAGEMENT]
          </button>
          <button
            type="button"
            className={`nb-admin-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            [02 // PROFILE &amp; BIO]
          </button>
          <button
            type="button"
            className={`nb-admin-tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            [03 // SERVICES &amp; AWARDS]
          </button>
          <button
            type="button"
            className={`nb-admin-tab ${activeTab === 'pictures' ? 'active' : ''}`}
            onClick={() => setActiveTab('pictures')}
          >
            [04 // PICTURES &amp; MEDIA]
          </button>
          <button
            type="button"
            className={`nb-admin-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            [05 // ACCOUNT SECURITY]
          </button>
        </div>

        {/* ================= TAB 1: PROJECTS ================= */}
        {activeTab === 'projects' && (
          <div>
            {/* Project Form Card */}
            <div className="nb-card" ref={formRef}>
              <div className="nb-card-header">
                <div>
                  <h2 className="nb-card-title">
                    {editingId ? `[EDITING PROJECT #${editingId}]` : '[ADD NEW PROJECT]'}
                  </h2>
                  <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.5)', marginTop: '4px' }}>
                    {editingId
                      ? 'Modify project details. Updates immediately synchronize with the Work section.'
                      : 'Publish a new project. Visitors will be able to see it in the Work section and open its link.'}
                  </p>
                </div>
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="nb-btn nb-btn-outline nb-btn-sm">
                    ✕ CANCEL EDIT
                  </button>
                )}
              </div>

              <form onSubmit={handleProjectSubmit}>
                <div className="nb-form-grid">
                  {/* Title */}
                  <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="nb-label">
                      <span>1. PROJECT TITLE</span>
                      <span style={{ color: '#7A0E22' }}>*REQUIRED</span>
                    </label>
                    <input
                      type="text"
                      className="nb-input"
                      value={projForm.title}
                      onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                      placeholder="e.g. Market & Trading Telemetry Dashboard"
                      required
                    />
                  </div>

                  {/* Category / Label */}
                  <div className="nb-form-group">
                    <label className="nb-label">
                      <span>2. LABEL / TYPE (CATEGORY)</span>
                      <span>CHIP ON CARD</span>
                    </label>
                    <input
                      type="text"
                      className="nb-input"
                      value={projForm.category}
                      onChange={(e) => setProjForm({ ...projForm, category: e.target.value })}
                      placeholder="e.g. OPERATIONS & ASYNC HQ"
                    />
                    <div className="nb-chip-suggestions">
                      {CATEGORY_SUGGESTIONS.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className="nb-chip"
                          onClick={() => setProjForm({ ...projForm, category: cat })}
                        >
                          +{cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Project URL / Link */}
                  <div className="nb-form-group">
                    <label className="nb-label">
                      <span>5. PROJECT LINK / URL</span>
                      <span style={{ color: '#4ade80' }}>OPENS IN WORK SECTION</span>
                    </label>
                    <input
                      type="text"
                      className="nb-input"
                      value={projForm.url}
                      onChange={(e) => setProjForm({ ...projForm, url: e.target.value })}
                      placeholder="https://my-app.com or https://github.com/..."
                    />
                    <span className="mono-micro" style={{ fontSize: '9px', color: 'rgba(250, 248, 245, 0.4)', marginTop: '6px' }}>
                      Visitors click &ldquo;OPEN PROJECT ↗&rdquo; on the card to visit this exact link.
                    </span>
                  </div>

                  {/* Image Upload & Path */}
                  <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="nb-label">
                      <span>3. PROJECT IMAGE</span>
                      <span>UPLOAD FILE OR ENTER URL</span>
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'center' }}>
                      {/* Upload Box */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={(e) => handleProjectImageUpload(e.target.files?.[0])}
                        />
                        <div
                          className="nb-upload-zone"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              border: '1px solid rgba(250, 248, 245, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(250, 248, 245, 0.05)',
                              fontFamily: 'var(--font-mono)'
                            }}
                          >
                            ↑
                          </div>
                          <div>
                            <div className="mono-micro" style={{ fontWeight: 600 }}>
                              {uploadingImage ? 'UPLOADING IMAGE…' : 'CLICK TO UPLOAD IMAGE'}
                            </div>
                            <div className="mono-micro" style={{ fontSize: '9px', color: 'rgba(250, 248, 245, 0.5)' }}>
                              PNG, JPG, WEBP, AVIF (UP TO 5MB)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Manual URL Input & Preview */}
                      <div>
                        <input
                          type="text"
                          className="nb-input"
                          value={projForm.image}
                          onChange={(e) => setProjForm({ ...projForm, image: e.target.value })}
                          placeholder="/uploads/doc-1.avif or https://..."
                        />
                        {projForm.image && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                            <img src={projForm.image} alt="Preview" className="nb-upload-preview" />
                            <div className="mono-micro" style={{ fontSize: '10px' }}>
                              <span>PREVIEW LOADED</span>
                              <button
                                type="button"
                                onClick={() => setProjForm({ ...projForm, image: '' })}
                                className="nb-btn nb-btn-danger nb-btn-sm"
                                style={{ display: 'block', marginTop: '4px' }}
                              >
                                REMOVE
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description / Bio */}
                  <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="nb-label">
                      <span>4. SUMMARY / BIO</span>
                      <span>SHOWN ON WORK PREVIEW CARD</span>
                    </label>
                    <textarea
                      className="nb-textarea"
                      value={projForm.description}
                      onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                      placeholder="Operational headquarters and digital framework built for dependable everyday team execution..."
                    />
                  </div>

                  {/* ================= FULL CASE STUDY SECTION ================= */}
                  <div className="nb-form-group" style={{ gridColumn: 'span 2', marginTop: '16px', paddingTop: '20px', borderTop: '1px solid rgba(250, 248, 245, 0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="nb-label" style={{ color: '#7A0E22', fontWeight: 700, fontSize: '11px' }}>
                        ★ FULL CASE STUDY SPECIFICATION (OPENED ON &ldquo;READ FULL CASE STUDY&rdquo;)
                      </span>
                      <span className="mono-micro" style={{ fontSize: '10px', color: 'rgba(250, 248, 245, 0.5)' }}>
                        SYNCHRONIZES WITH LIVE IN-PAGE CASE STUDY
                      </span>
                    </div>
                  </div>

                  {/* Client & Engagement */}
                  <div className="nb-form-group">
                    <label className="nb-label">
                      <span>A. CLIENT</span>
                      <span>NAME / BRAND</span>
                    </label>
                    <input
                      type="text"
                      className="nb-input"
                      value={projForm.client || ''}
                      onChange={(e) => setProjForm({ ...projForm, client: e.target.value })}
                      placeholder="e.g. KD Beauty Studio"
                    />
                  </div>

                  <div className="nb-form-group">
                    <label className="nb-label">
                      <span>B. ENGAGEMENT</span>
                      <span>ROLE / SCOPE</span>
                    </label>
                    <input
                      type="text"
                      className="nb-input"
                      value={projForm.engagement || ''}
                      onChange={(e) => setProjForm({ ...projForm, engagement: e.target.value })}
                      placeholder="e.g. Full-Stack Web Development, UI/UX Architecture"
                    />
                  </div>

                  {/* Brief */}
                  <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="nb-label">
                      <span>C. BRIEF</span>
                      <span>CORE OBJECTIVE &amp; PROJECT GOAL</span>
                    </label>
                    <textarea
                      className="nb-textarea"
                      style={{ minHeight: '80px' }}
                      value={projForm.brief || ''}
                      onChange={(e) => setProjForm({ ...projForm, brief: e.target.value })}
                      placeholder="Explain the client problem, target audience, and primary deliverables..."
                    />
                  </div>

                  {/* Hero Documentation: Video or Picture Full on Monitor */}
                  <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="nb-label">
                      <span>D. DOCUMENTATION (FULL MONITOR DISPLAY)</span>
                      <span>VIDEO (.MP4) OR HIGH-RES PICTURE URL</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      ref={docMediaInputRef}
                      style={{ display: 'none' }}
                      onChange={(e) => handleDocumentationUpload(e.target.files?.[0])}
                    />
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="nb-input"
                        style={{ flex: 1 }}
                        value={projForm.documentation || ''}
                        onChange={(e) => setProjForm({ ...projForm, documentation: e.target.value })}
                        placeholder="/uploads/my-doc.jpg or video mp4 url..."
                      />
                      <button
                        type="button"
                        onClick={() => docMediaInputRef.current && docMediaInputRef.current.click()}
                        className="nb-btn nb-btn-outline nb-btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {uploadingDocMedia ? 'UPLOADING…' : '↑ UPLOAD MEDIA'}
                      </button>
                    </div>
                  </div>

                  {/* Challenge */}
                  <div className="nb-form-group">
                    <label className="nb-label">
                      <span>E. CHALLENGE</span>
                      <span>OBSTACLES &amp; CONSTRAINTS</span>
                    </label>
                    <textarea
                      className="nb-textarea"
                      style={{ minHeight: '110px' }}
                      value={projForm.challenge || ''}
                      onChange={(e) => setProjForm({ ...projForm, challenge: e.target.value })}
                      placeholder="The operational constraints, technical hurdles, and legacy limitations..."
                    />
                  </div>

                  {/* Approach */}
                  <div className="nb-form-group">
                    <label className="nb-label">
                      <span>F. APPROACH</span>
                      <span>STRATEGY &amp; EXECUTION</span>
                    </label>
                    <textarea
                      className="nb-textarea"
                      style={{ minHeight: '110px' }}
                      value={projForm.approach || ''}
                      onChange={(e) => setProjForm({ ...projForm, approach: e.target.value })}
                      placeholder="The methodology, architecture decisions, tools, and execution workflow..."
                    />
                  </div>

                  {/* Picture Documentation: 1 Spotlight + 8-Grid */}
                  <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="nb-label">
                      <span>G. PICTURE DOCUMENTATION (1 SPOTLIGHT + 8-GRID)</span>
                      <span>ONE IMAGE URL PER LINE (FIRST IS SPOTLIGHT, NEXT ARE UP TO 8 GRID)</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      ref={multiDocsInputRef}
                      style={{ display: 'none' }}
                      onChange={(e) => handleMultiDocsUpload(e.target.files)}
                    />
                    <textarea
                      className="nb-textarea"
                      style={{ minHeight: '100px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                      value={projForm.picture_docs || ''}
                      onChange={(e) => setProjForm({ ...projForm, picture_docs: e.target.value })}
                      placeholder="/uploads/spotlight.jpg&#10;/uploads/grid-1.jpg&#10;/uploads/grid-2.jpg"
                    />
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => multiDocsInputRef.current && multiDocsInputRef.current.click()}
                        className="nb-btn nb-btn-outline nb-btn-sm"
                      >
                        {uploadingMultiDocs ? 'UPLOADING PICTURES…' : '↑ BATCH UPLOAD PICTURES'}
                      </button>
                      <span className="mono-micro" style={{ fontSize: '10px', color: 'rgba(250, 248, 245, 0.45)' }}>
                        Select multiple images to append. If left empty, 8 default system doc frames are rendered.
                      </span>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="nb-label">
                      <span>H. DIRECTIVE QUOTE</span>
                      <span>CLIENT FEEDBACK / TESTIMONIAL</span>
                    </label>
                    <textarea
                      className="nb-textarea"
                      style={{ minHeight: '70px' }}
                      value={projForm.quote || ''}
                      onChange={(e) => setProjForm({ ...projForm, quote: e.target.value })}
                      placeholder="e.g. Khairi brought unbelievable precision, velocity, and discipline to our digital infrastructure."
                    />
                  </div>

                  {/* Outcome */}
                  <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="nb-label">
                      <span>I. THE OUTCOME</span>
                      <span>FINAL RESULTS &amp; IMPACT (ACCOMPANIES &ldquo;VISIT WEBSITE&rdquo;)</span>
                    </label>
                    <textarea
                      className="nb-textarea"
                      style={{ minHeight: '80px' }}
                      value={projForm.outcome || ''}
                      onChange={(e) => setProjForm({ ...projForm, outcome: e.target.value })}
                      placeholder="e.g. Launched with zero downtime, resulting in a 40% increase in direct client bookings."
                    />
                  </div>

                  {/* Progress & Published Status */}
                  <div className="nb-form-group">
                    <label className="nb-label">
                      <span>COMPLETION PROGRESS</span>
                      <span>{(Number(projForm.progress) || 3) * 20}% DONE</span>
                    </label>
                    <select
                      className="nb-select"
                      value={projForm.progress}
                      onChange={(e) => setProjForm({ ...projForm, progress: e.target.value })}
                    >
                      <option value="1">1/5 — 20% (PLANNING &amp; RESEARCH)</option>
                      <option value="2">2/5 — 40% (PROTOTYPING)</option>
                      <option value="3">3/5 — 60% (IN ACTIVE DEVELOPMENT)</option>
                      <option value="4">4/5 — 80% (FINAL TESTING)</option>
                      <option value="5">5/5 — 100% (PRODUCTION READY)</option>
                    </select>
                  </div>

                  <div className="nb-form-group" style={{ justifyContent: 'center' }}>
                    <label className="nb-label">PUBLICATION STATUS</label>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '6px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={projForm.published}
                          onChange={(e) => setProjForm({ ...projForm, published: e.target.checked })}
                          style={{ accentColor: '#7A0E22', width: '16px', height: '16px' }}
                        />
                        <span className="mono-micro" style={{ fontSize: '11px' }}>
                          PUBLISH TO LIVE WEBSITE WORK SECTION
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(250, 248, 245, 0.14)' }}>
                  <button type="submit" className="nb-btn nb-btn-primary">
                    {editingId ? 'SAVE PROJECT CHANGES ✓' : 'PUBLISH PROJECT TO WEBSITE →'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={handleCancelEdit} className="nb-btn nb-btn-outline">
                      CANCEL
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setProjForm(emptyProject)}
                    className="nb-btn nb-btn-outline"
                    style={{ marginLeft: 'auto' }}
                  >
                    RESET FORM
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Projects List */}
            <div className="nb-card">
              <div className="nb-card-header">
                <div>
                  <h2 className="nb-card-title">[REGISTERED PROJECTS // ARCHIVE]</h2>
                  <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.5)', marginTop: '4px' }}>
                    Manage, edit, or remove published projects. Click &ldquo;EDIT&rdquo; to load into form.
                  </p>
                </div>
                <span className="mono-micro" style={{ fontSize: '11px', color: '#FAF8F5' }}>
                  {projects.length} TOTAL
                </span>
              </div>

              {projects.length === 0 ? (
                <div style={{ padding: '36px 0', textAlign: 'center', color: 'rgba(250, 248, 245, 0.4)' }}>
                  <p className="mono-micro">[NO PROJECTS PUBLISHED YET]</p>
                  <p style={{ marginTop: '8px', fontSize: '13px' }}>
                    Use the form above to add your first project.
                  </p>
                </div>
              ) : (
                <div className="nb-table-wrap">
                  <table className="nb-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>PREVIEW</th>
                        <th>TITLE &amp; CATEGORY</th>
                        <th>LINK / URL</th>
                        <th>PROGRESS</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p, idx) => (
                        <tr key={p.id}>
                          <td>
                            {p.image ? (
                              <img src={p.image} alt={p.title} className="nb-table-thumb" />
                            ) : (
                              <div className="nb-table-fallback">
                                <span>{String(idx + 1).padStart(2, '0')}</span>
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                              {p.title}
                            </div>
                            <span className="nb-admin-badge" style={{ fontSize: '9px', padding: '2px 6px' }}>
                              {p.category || 'GENERAL'}
                            </span>
                          </td>
                          <td>
                            {p.url ? (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mono-micro"
                                style={{ color: '#FAF8F5', textDecoration: 'underline', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <span>{p.url.replace(/^https?:\/\//, '').slice(0, 28)}…</span>
                                <span>↗</span>
                              </a>
                            ) : (
                              <span className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.35)', fontSize: '10px' }}>
                                [NO EXTERNAL URL]
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="mono-micro" style={{ fontSize: '11px' }}>
                              {(p.progress || 3) * 20}% ({p.progress || 3}/5)
                            </div>
                          </td>
                          <td>
                            <span className={`nb-status-pill ${p.published ? 'published' : 'draft'}`}>
                              {p.published ? '● LIVE' : '○ DRAFT'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <a
                                href={`/#${p.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nb-btn nb-btn-outline nb-btn-sm"
                                title="View on Live Website"
                                style={{ textDecoration: 'none' }}
                              >
                                LIVE VIEW ↗
                              </a>
                              <button
                                type="button"
                                onClick={() => startEditing(p)}
                                className="nb-btn nb-btn-outline nb-btn-sm"
                                title="Edit this project"
                              >
                                EDIT ✎
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(p)}
                                className="nb-btn nb-btn-outline nb-btn-sm"
                                title={p.published ? 'Unpublish' : 'Publish'}
                              >
                                {p.published ? 'UNPUBLISH' : 'PUBLISH'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(p)}
                                className="nb-btn nb-btn-danger nb-btn-sm"
                                title="Delete this project"
                              >
                                DELETE ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: PROFILE & BIO ================= */}
        {activeTab === 'profile' && (
          <div className="nb-card">
            <div className="nb-card-header">
              <div>
                <h2 className="nb-card-title">[MY IDENTITY &amp; BIO PROFILE]</h2>
                <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.5)', marginTop: '4px' }}>
                  Top hero blurb, intro, who am I, school, and contact details.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="nb-form-grid">
                <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="nb-label">HERO HOOK BLURB (DISPLAYED AT TOP)</label>
                  <textarea
                    className="nb-textarea"
                    style={{ minHeight: '70px' }}
                    value={profile.hero || ''}
                    onChange={(e) => setProfile({ ...profile, hero: e.target.value })}
                    placeholder="e.g. Hungry student, Formula 1 and Finance enthusiast, Memecoins and Stocks traders."
                  />
                </div>

                <div className="nb-form-group">
                  <label className="nb-label">FULL NAME</label>
                  <input
                    type="text"
                    className="nb-input"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="Khairi Nugroho"
                  />
                </div>

                <div className="nb-form-group">
                  <label className="nb-label">CONTACT EMAIL</label>
                  <input
                    type="email"
                    className="nb-input"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="khairizakiyn@gmail.com"
                  />
                </div>

                <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="nb-label">WHO AM I (CORE BIO)</label>
                  <textarea
                    className="nb-textarea"
                    value={profile.who_am_i || ''}
                    onChange={(e) => setProfile({ ...profile, who_am_i: e.target.value })}
                    placeholder="One paragraph explaining your background, focus, and drive..."
                  />
                </div>

                <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="nb-label">WHAT I DID (EXPERIENCE &amp; CURRENT FOCUS)</label>
                  <textarea
                    className="nb-textarea"
                    value={profile.what_i_did || ''}
                    onChange={(e) => setProfile({ ...profile, what_i_did: e.target.value })}
                    placeholder="What you are currently building or learning..."
                  />
                </div>

                <div className="nb-form-group">
                  <label className="nb-label">SCHOOL / EDUCATION</label>
                  <input
                    type="text"
                    className="nb-input"
                    value={profile.school || ''}
                    onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                    placeholder="Studying at Vocational School in Batam"
                  />
                </div>

                {/* Profile Photo */}
                <div className="nb-form-group">
                  <label className="nb-label">PORTRAIT / AVATAR</label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={photoInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => handleProfilePhotoUpload(e.target.files?.[0])}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current && photoInputRef.current.click()}
                      className="nb-btn nb-btn-outline nb-btn-sm"
                    >
                      {uploadingPhoto ? 'UPLOADING…' : 'UPLOAD PHOTO ↑'}
                    </button>
                    {profile.photo && (
                      <img
                        src={profile.photo}
                        alt="Profile avatar"
                        style={{ width: '44px', height: '44px', objectFit: 'cover', border: '1px solid rgba(250, 248, 245, 0.2)' }}
                      />
                    )}
                  </div>
                </div>

                {/* Social Links */}
                <div className="nb-form-group">
                  <label className="nb-label">X / TWITTER URL</label>
                  <input
                    type="text"
                    className="nb-input"
                    value={profile.x_url || ''}
                    onChange={(e) => setProfile({ ...profile, x_url: e.target.value })}
                    placeholder="https://x.com/..."
                  />
                </div>

                <div className="nb-form-group">
                  <label className="nb-label">GITHUB URL</label>
                  <input
                    type="text"
                    className="nb-input"
                    value={profile.github_url || ''}
                    onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>

                <div className="nb-form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="nb-label">LINKEDIN URL</label>
                  <input
                    type="text"
                    className="nb-input"
                    value={profile.linkedin_url || ''}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(250, 248, 245, 0.14)' }}>
                <button type="submit" className="nb-btn nb-btn-primary">
                  SAVE PROFILE DATA ✓
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 3: SERVICES & AWARDS ================= */}
        {activeTab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Supabase Notice Banner */}
            <div
              className="nb-card"
              style={{
                border: '1px solid rgba(122, 14, 34, 0.4)',
                background: 'rgba(122, 14, 34, 0.08)',
                padding: '20px 24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="nb-admin-badge" style={{ borderColor: 'var(--bg-burgundy)', color: '#FF6B81' }}>
                  SUPABASE DB SYNC
                </span>
                <span className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.8)' }}>
                  Tables: <code>public.services</code> &amp; <code>public.awards_and_courses</code>
                </span>
              </div>
              <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.6)', marginTop: '8px', lineHeight: 1.6 }}>
                Items saved here are stored in Supabase and displayed live in the About section. You can also input or manage rows manually in your Supabase Dashboard Table Editor. SQL file is located at <code>db/supabase-services-and-awards.sql</code>.
              </p>
            </div>

            {/* Grid of Two Columns: Services & Awards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '28px' }}>
              {/* SECTION A: SERVICES */}
              <div className="nb-card">
                <div className="nb-card-header">
                  <div>
                    <h2 className="nb-card-title">
                      {editingServiceId ? `[EDITING SERVICE #${editingServiceId}]` : '[ADD NEW SERVICE]'}
                    </h2>
                    <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.5)', marginTop: '4px' }}>
                      Operational services shown in About section
                    </p>
                  </div>
                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingServiceId(null)
                        setServiceForm({ title: '', description: '', link: '', order_index: 0, published: true })
                      }}
                      className="nb-btn nb-btn-outline nb-btn-sm"
                    >
                      ✕ CANCEL
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveService}>
                  <div className="nb-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="nb-form-group">
                      <label className="nb-label">SERVICE TITLE *</label>
                      <input
                        type="text"
                        className="nb-input"
                        value={serviceForm.title}
                        onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                        placeholder="e.g. Microsoft Excel"
                        required
                      />
                    </div>

                    <div className="nb-form-group">
                      <label className="nb-label">DESCRIPTION (OPTIONAL)</label>
                      <input
                        type="text"
                        className="nb-input"
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        placeholder="e.g. Financial modeling & spreadsheet architecture"
                      />
                    </div>

                    <div className="nb-form-group">
                      <label className="nb-label">EXTERNAL LINK / URL (OPTIONAL)</label>
                      <input
                        type="url"
                        className="nb-input"
                        value={serviceForm.link}
                        onChange={(e) => setServiceForm({ ...serviceForm, link: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div className="nb-form-group" style={{ flex: 1 }}>
                        <label className="nb-label">DISPLAY ORDER</label>
                        <input
                          type="number"
                          className="nb-input"
                          value={serviceForm.order_index}
                          onChange={(e) => setServiceForm({ ...serviceForm, order_index: Number(e.target.value) })}
                        />
                      </div>
                      <div className="nb-form-group" style={{ flex: 1, paddingTop: '22px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          <input
                            type="checkbox"
                            checked={serviceForm.published}
                            onChange={(e) => setServiceForm({ ...serviceForm, published: e.target.checked })}
                          />
                          PUBLISHED (ACTIVE)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(250, 248, 245, 0.14)' }}>
                    <button type="submit" className="nb-btn nb-btn-primary">
                      {editingServiceId ? 'UPDATE SERVICE ✓' : 'ADD SERVICE +'}
                    </button>
                  </div>
                </form>

                {/* List of existing services */}
                <div style={{ marginTop: '28px', borderTop: '1px solid rgba(250, 248, 245, 0.14)', paddingTop: '20px' }}>
                  <h3 className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.7)', marginBottom: '14px', letterSpacing: '0.08em' }}>
                    CURRENT SERVICES ({servicesList.length})
                  </h3>
                  {servicesList.length === 0 ? (
                    <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.4)' }}>
                      No custom services added yet. Default items are currently displayed.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {servicesList.map((s, idx) => (
                        <div
                          key={s.id || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            background: 'rgba(250, 248, 245, 0.03)',
                            border: '1px solid rgba(250, 248, 245, 0.08)'
                          }}
                        >
                          <div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(250, 248, 245, 0.4)', marginRight: '8px' }}>
                              #{s.order_index ?? idx + 1}
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--bg-white)', fontSize: '14px' }}>
                              {s.title}
                            </span>
                            {s.link && (
                              <span className="mono-micro" style={{ marginLeft: '8px', color: '#68D391', fontSize: '11px' }}>
                                [LINK]
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleEditService(s)}
                              className="nb-btn nb-btn-outline nb-btn-sm"
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              EDIT
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(s.id)}
                              className="nb-btn nb-btn-danger nb-btn-sm"
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              DEL
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION B: AWARDS & COURSES */}
              <div className="nb-card">
                <div className="nb-card-header">
                  <div>
                    <h2 className="nb-card-title">
                      {editingAwardId ? `[EDITING AWARD #${editingAwardId}]` : '[ADD NEW AWARD / COURSE]'}
                    </h2>
                    <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.5)', marginTop: '4px' }}>
                      Courses, certs &amp; awards shown in About section
                    </p>
                  </div>
                  {editingAwardId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAwardId(null)
                        setAwardForm({ title: '', description: '', link: '', order_index: 0, published: true })
                      }}
                      className="nb-btn nb-btn-outline nb-btn-sm"
                    >
                      ✕ CANCEL
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveAward}>
                  <div className="nb-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="nb-form-group">
                      <label className="nb-label">TITLE *</label>
                      <input
                        type="text"
                        className="nb-input"
                        value={awardForm.title}
                        onChange={(e) => setAwardForm({ ...awardForm, title: e.target.value })}
                        placeholder="e.g. Financial Markets & Macroeconomics"
                        required
                      />
                    </div>

                    <div className="nb-form-group">
                      <label className="nb-label">DESCRIPTION (OPTIONAL)</label>
                      <input
                        type="text"
                        className="nb-input"
                        value={awardForm.description}
                        onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
                        placeholder="e.g. Macro indicators, monetary policy, and market analysis"
                      />
                    </div>

                    <div className="nb-form-group">
                      <label className="nb-label">CERTIFICATE / VERIFICATION LINK (OPTIONAL)</label>
                      <input
                        type="url"
                        className="nb-input"
                        value={awardForm.link}
                        onChange={(e) => setAwardForm({ ...awardForm, link: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div className="nb-form-group" style={{ flex: 1 }}>
                        <label className="nb-label">DISPLAY ORDER</label>
                        <input
                          type="number"
                          className="nb-input"
                          value={awardForm.order_index}
                          onChange={(e) => setAwardForm({ ...awardForm, order_index: Number(e.target.value) })}
                        />
                      </div>
                      <div className="nb-form-group" style={{ flex: 1, paddingTop: '22px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          <input
                            type="checkbox"
                            checked={awardForm.published}
                            onChange={(e) => setAwardForm({ ...awardForm, published: e.target.checked })}
                          />
                          PUBLISHED (ACTIVE)
                        </label>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(250, 248, 245, 0.14)' }}>
                    <button type="submit" className="nb-btn nb-btn-primary">
                      {editingAwardId ? 'UPDATE AWARD ✓' : 'ADD AWARD / COURSE +'}
                    </button>
                  </div>
                </form>

                {/* List of existing awards */}
                <div style={{ marginTop: '28px', borderTop: '1px solid rgba(250, 248, 245, 0.14)', paddingTop: '20px' }}>
                  <h3 className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.7)', marginBottom: '14px', letterSpacing: '0.08em' }}>
                    CURRENT AWARDS &amp; COURSES ({awardsList.length})
                  </h3>
                  {awardsList.length === 0 ? (
                    <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.4)' }}>
                      No custom awards added yet. Default items are currently displayed.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {awardsList.map((a, idx) => (
                        <div
                          key={a.id || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            background: 'rgba(250, 248, 245, 0.03)',
                            border: '1px solid rgba(250, 248, 245, 0.08)'
                          }}
                        >
                          <div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(250, 248, 245, 0.4)', marginRight: '8px' }}>
                              #{a.order_index ?? idx + 1}
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--bg-white)', fontSize: '14px' }}>
                              {a.title}
                            </span>
                            {a.link && (
                              <span className="mono-micro" style={{ marginLeft: '8px', color: '#68D391', fontSize: '11px' }}>
                                [LINK]
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleEditAward(a)}
                              className="nb-btn nb-btn-outline nb-btn-sm"
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              EDIT
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAward(a.id)}
                              className="nb-btn nb-btn-danger nb-btn-sm"
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              DEL
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PICTURES & MEDIA ================= */}
        {activeTab === 'pictures' && (
          <div>
            <div className="nb-card" style={{ marginBottom: '24px' }}>
              <div className="nb-card-header">
                <div>
                  <h2 className="nb-card-title">
                    {editingPicId ? `[EDIT PICTURE #${editingPicId}]` : '[UPLOAD & REGISTER PICTURE]'}
                  </h2>
                  <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.5)', marginTop: '4px' }}>
                    Uploaded pictures are automatically synced directly to Supabase Storage &amp; Database (<code>public.pictures</code>)
                  </p>
                </div>
                <span className="nb-admin-badge" style={{ color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.4)' }}>
                  SUPABASE AUTO-SYNC
                </span>
              </div>

              <form onSubmit={handleSavePicture}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div className="nb-form-group">
                    <label className="nb-label">PICTURE TITLE *</label>
                    <input
                      type="text"
                      className="nb-input"
                      value={pictureForm.title}
                      onChange={(e) => setPictureForm({ ...pictureForm, title: e.target.value })}
                      placeholder="e.g. Profile Portrait, Project Showcase 1"
                      required
                    />
                  </div>

                  <div className="nb-form-group">
                    <label className="nb-label">UNIQUE IDENTIFIER / SLUG *</label>
                    <input
                      type="text"
                      className="nb-input"
                      value={pictureForm.name}
                      onChange={(e) => setPictureForm({ ...pictureForm, name: e.target.value })}
                      placeholder="e.g. profile_photo, showcase_doc_1"
                      required
                    />
                  </div>

                  <div className="nb-form-group">
                    <label className="nb-label">CATEGORY</label>
                    <select
                      className="nb-select"
                      value={pictureForm.category}
                      onChange={(e) => setPictureForm({ ...pictureForm, category: e.target.value })}
                    >
                      <option value="profile">Profile Photo</option>
                      <option value="work">Featured Work</option>
                      <option value="project">Project Showcase</option>
                      <option value="gallery">Gallery / Media</option>
                      <option value="credential">Credential / Cert</option>
                    </select>
                  </div>

                  <div className="nb-form-group">
                    <label className="nb-label">ORDER INDEX</label>
                    <input
                      type="number"
                      className="nb-input"
                      value={pictureForm.order_index}
                      onChange={(e) => setPictureForm({ ...pictureForm, order_index: e.target.value })}
                    />
                  </div>
                </div>

                <div className="nb-form-group" style={{ marginTop: '16px' }}>
                  <label className="nb-label">DIRECT IMAGE URL / SUPABASE STORAGE URL *</label>
                  <input
                    type="file"
                    ref={picMediaInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={(e) => handlePictureUpload(e.target.files?.[0])}
                  />
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="nb-input"
                      value={pictureForm.url}
                      onChange={(e) => setPictureForm({ ...pictureForm, url: e.target.value })}
                      placeholder="https://...supabase.co/storage/... or /uploads/..."
                      required
                    />
                    <button
                      type="button"
                      onClick={() => picMediaInputRef.current && picMediaInputRef.current.click()}
                      className="nb-btn nb-btn-outline nb-btn-sm"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {uploadingPicMedia ? 'UPLOADING TO SUPABASE...' : 'UPLOAD PICTURE'}
                    </button>
                  </div>
                </div>

                {pictureForm.url && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '14px 0' }}>
                    <img
                      src={pictureForm.url}
                      alt="Preview"
                      className="nb-upload-preview"
                      style={{ maxHeight: '70px', objectFit: 'cover', border: '1px solid rgba(250, 248, 245, 0.2)' }}
                    />
                    <span className="mono-micro" style={{ color: '#4ade80' }}>
                      SUPABASE PREVIEW LOADED
                    </span>
                  </div>
                )}

                <div className="nb-form-group" style={{ marginTop: '16px' }}>
                  <label className="nb-label">DESCRIPTION / METADATA</label>
                  <input
                    type="text"
                    className="nb-input"
                    value={pictureForm.description || ''}
                    onChange={(e) => setPictureForm({ ...pictureForm, description: e.target.value })}
                    placeholder="Brief description or usage note..."
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button type="submit" className="nb-btn nb-btn-primary">
                    {editingPicId ? 'UPDATE IN SUPABASE' : 'SAVE TO SUPABASE'}
                  </button>
                  {editingPicId && (
                    <button
                      type="button"
                      className="nb-btn nb-btn-secondary"
                      onClick={() => {
                        setEditingPicId(null)
                        setPictureForm({
                          name: '',
                          title: '',
                          category: 'profile',
                          url: '',
                          alt_text: '',
                          description: '',
                          order_index: 0,
                          published: true
                        })
                      }}
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List of Pictures currently in Supabase */}
            <div className="nb-card">
              <div className="nb-card-header">
                <div>
                  <h3 className="nb-card-title">LIVE SUPABASE PICTURES ({picturesList.length})</h3>
                  <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.5)', marginTop: '4px' }}>
                    Records from table <code>public.pictures</code>
                  </p>
                </div>
              </div>

              {picturesList.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(250, 248, 245, 0.4)' }}>
                  No pictures registered yet. Upload an image above to automatically save to Supabase.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {picturesList.map((pic) => (
                    <div
                      key={pic.id || pic.name}
                      style={{
                        background: 'rgba(250, 248, 245, 0.03)',
                        border: '1px solid rgba(250, 248, 245, 0.15)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ width: '100%', height: '140px', overflow: 'hidden', background: '#000', border: '1px solid rgba(250, 248, 245, 0.1)' }}>
                        <img
                          src={pic.url}
                          alt={pic.title || pic.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--bg-white)' }}>{pic.title || pic.name}</strong>
                        <span className="mono-micro" style={{ padding: '2px 6px', background: 'rgba(122, 14, 34, 0.6)', color: '#FAF8F5' }}>
                          {pic.category || 'MEDIA'}
                        </span>
                      </div>
                      <span className="mono-micro" style={{ fontSize: '10px', color: 'rgba(250, 248, 245, 0.4)', wordBreak: 'break-all' }}>
                        {pic.url}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(250, 248, 245, 0.1)' }}>
                        <button
                          type="button"
                          className="nb-btn nb-btn-outline nb-btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleEditPicture(pic)}
                        >
                          EDIT
                        </button>
                        <button
                          type="button"
                          className="nb-btn nb-btn-danger nb-btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => handleDeletePicture(pic.id)}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 5: ACCOUNT SECURITY ================= */}
        {activeTab === 'security' && (
          <div className="nb-card" style={{ maxWidth: '640px' }}>
            <div className="nb-card-header">
              <div>
                <h2 className="nb-card-title">[ACCOUNT SECURITY // CREDENTIALS]</h2>
                <p className="mono-micro" style={{ color: 'rgba(250, 248, 245, 0.5)', marginTop: '4px' }}>
                  Change username or password directly. Stored securely in database via bcrypt hash.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSecurity}>
              <div className="nb-form-group" style={{ marginBottom: '18px' }}>
                <label className="nb-label">ADMIN USERNAME</label>
                <input
                  type="text"
                  className="nb-input"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="admin username"
                  required
                />
              </div>

              <div className="nb-form-group" style={{ marginBottom: '18px' }}>
                <label className="nb-label">NEW PASSWORD (LEAVE BLANK TO KEEP UNCHANGED)</label>
                <input
                  type="password"
                  className="nb-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="minimum 4 characters"
                />
              </div>

              <div className="nb-form-group" style={{ marginBottom: '26px' }}>
                <label className="nb-label">CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  className="nb-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="re-enter new password"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="nb-btn nb-btn-primary">
                  UPDATE CREDENTIALS ✓
                </button>
              </div>
            </form>

            <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid rgba(250, 248, 245, 0.1)' }}>
              <div className="mono-micro" style={{ fontSize: '10px', color: 'rgba(250, 248, 245, 0.45)', lineHeight: 1.6 }}>
                [NOTE] Credentials are never stored in repository files and cannot be leaked via git push.
                You can also reset credentials from terminal anytime with:
                <br />
                <code style={{ color: '#FAF8F5', background: 'rgba(250, 248, 245, 0.08)', padding: '2px 6px' }}>
                  npm run admin:set &lt;username&gt; &lt;password&gt;
                </code>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Real-time Toast Notification */}
      {toast && (
        <div className={`nb-toast ${toast.isError ? 'error' : ''}`}>
          <span>{toast.isError ? '[!] ERROR:' : '[✓] SUCCESS:'}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
