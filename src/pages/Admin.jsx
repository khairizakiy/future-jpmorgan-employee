import { useState, useEffect, useRef } from 'react'
import Header from '../components/Header.jsx'
import { navigate } from '../router.js'
import { api } from '../api.js'

export default function Admin() {
  // Auth state
  const [authView, setAuthView] = useState('loading') // 'loading' | 'login' | 'setup' | 'ok'
  const [authMode, setAuthMode] = useState('login') // 'login' | 'reset'
  const [who, setWho] = useState('')
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [authErr, setAuthErr] = useState('')
  const [serverOnline, setServerOnline] = useState(true)

  // Active Tab: matching home page sections
  const [activeTab, setActiveTab] = useState('whoami') // 'whoami' | 'experiences' | 'projects' | 'music' | 'tiguan' | 'friends' | 'cat' | 'security'

  // Notifications
  const [toast, setToast] = useState(null)
  const showToast = (message, isError = false) => {
    setToast({ message, isError })
    if (!isError && typeof window !== 'undefined') {
      window.__INITIAL_DATA__ = null
    }
    setTimeout(() => setToast(null), 3500)
  }

  // File upload state & ref
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const uploadCallbackRef = useRef(null)

  const triggerUpload = (callback) => {
    uploadCallbackRef.current = callback
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await api.upload(file)
      const finalUrl = res?.url || res?.path || res?.localPath
      if (finalUrl) {
        showToast('Photo uploaded successfully.')
        if (typeof uploadCallbackRef.current === 'function') {
          uploadCallbackRef.current(finalUrl)
        }
      } else {
        showToast('Upload succeeded but no URL was returned.', true)
      }
    } catch (err) {
      showToast(err.message || 'Upload failed', true)
    } finally {
      setUploading(false)
      uploadCallbackRef.current = null
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // ----------------------------------------------------
  // SECTION 1: WHOAMI (Profile & Bio)
  // ----------------------------------------------------
  const [profile, setProfile] = useState({
    name: 'Khairi Nugroho',
    hero: 'batam, id',
    who_am_i: "Hi! I'm Khairi, a systems architect and software engineer based in Batam.",
    what_i_did: 'Most of my time goes into distributed backends, clean type-safe frontend architecture (TypeScript + Rust), and building tools that run fast without useless computational bloat.',
    school: "When I'm not pushing commits, I'm usually underneath the chassis of my 2021 VW Tiguan doing suspension tweaks, hunting for obscure vinyl records, or hanging out with my cat Mochi.",
    photo: '',
    photo_label: 'khairinugroho.jpeg',
    email: 'khairizakiyn@gmail.com',
    linkedin_url: 'https://linkedin.com/khairinugroho',
    github_url: 'https://github.com/khairizakiy',
    instagram_url: 'https://instagram.com/zkiyngrh',
    spotify_url: 'https://open.spotify.com/user/j45vdoajmtkvdq33tunybf9o6?si=3163aa858f2341ab',
    motto: 'Precision is quiet; restraint speaks louder than ornamentation.'
  })

  const [savingProfile, setSavingProfile] = useState(false)

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await api.updateProfile({
        name: profile.name,
        hero: profile.hero,
        who_am_i: profile.who_am_i,
        what_i_did: profile.what_i_did,
        school: profile.school,
        photo: profile.photo,
        email: profile.email,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        x_url: profile.instagram_url || profile.x_url || ''
      })

      await api.updateBio({
        subtitle: profile.hero,
        paragraph_1: profile.who_am_i,
        paragraph_2: profile.what_i_did,
        content: `${profile.who_am_i}\n\n${profile.what_i_did}\n\n${profile.school}`
      })

      showToast('Profile & Bio updated in Supabase.')
    } catch (err) {
      showToast(err.message || 'Failed to save profile', true)
    } finally {
      setSavingProfile(false)
    }
  }

  // ----------------------------------------------------
  // SECTION 2: EXPERIENCES
  // ----------------------------------------------------
  const [experiencesList, setExperiencesList] = useState([])
  const [expForm, setExpForm] = useState({
    company: '',
    role: '',
    job_type: 'Full-time',
    location: '',
    period: '',
    description: '',
    logo: '',
    initial: '',
    initial_bg: '#1b1c18',
    star: false,
    order_index: 0,
    published: true
  })
  const [editingExpId, setEditingExpId] = useState(null)

  const handleExpSubmit = async (e) => {
    e.preventDefault()
    if (!expForm.company.trim() || !expForm.role.trim()) {
      showToast('Company and Role are required.', true)
      return
    }
    try {
      const payload = {
        ...expForm,
        initial: expForm.initial || (expForm.company ? expForm.company[0].toUpperCase() : 'E'),
        order_index: Number(expForm.order_index) || 0
      }
      if (editingExpId) {
        const updated = await api.updateExperience(editingExpId, payload)
        setExperiencesList((prev) => prev.map((item) => (item.id === editingExpId ? updated : item)))
        showToast('Experience updated successfully.')
        setEditingExpId(null)
      } else {
        const created = await api.createExperience(payload)
        setExperiencesList((prev) => [...prev, created])
        showToast('New experience created.')
      }
      setExpForm({
        company: '',
        role: '',
        job_type: 'Full-time',
        location: '',
        period: '',
        description: '',
        logo: '',
        initial: '',
        initial_bg: '#1b1c18',
        star: false,
        order_index: 0,
        published: true
      })
    } catch (err) {
      showToast(err.message || 'Failed to save experience', true)
    }
  }

  const handleExpEdit = (exp) => {
    setEditingExpId(exp.id)
    setExpForm({
      company: exp.company || '',
      role: exp.role || '',
      job_type: exp.job_type || (Array.isArray(exp.badges) && typeof exp.badges[0] === 'string' ? exp.badges[0] : 'Full-time'),
      location: exp.location || '',
      period: exp.period || '',
      description: exp.description || '',
      logo: exp.logo || exp.image || (exp.initial_bg && (exp.initial_bg.startsWith('http') || exp.initial_bg.startsWith('/uploads')) ? exp.initial_bg : ''),
      initial: exp.initial || '',
      initial_bg: exp.initial_bg || '#1b1c18',
      star: Boolean(exp.star),
      order_index: exp.order_index ?? 0,
      published: exp.published !== false
    })
  }

  const handleExpDelete = async (id) => {
    if (!window.confirm('Delete this experience from Supabase?')) return
    try {
      await api.deleteExperience(id)
      setExperiencesList((prev) => prev.filter((exp) => exp.id !== id))
      showToast('Experience deleted.')
    } catch (err) {
      showToast(err.message || 'Failed to delete experience', true)
    }
  }

  // ----------------------------------------------------
  // SECTION 3: PROJECTS
  // ----------------------------------------------------
  const [projectsList, setProjectsList] = useState([])
  const [projForm, setProjForm] = useState({
    title: '',
    category: 'SOFTWARE',
    description: '',
    url: '',
    image: '',
    star: false,
    stars_count: '',
    published: true,
    tags: ''
  })
  const [editingProjId, setEditingProjId] = useState(null)

  const handleProjSubmit = async (e) => {
    e.preventDefault()
    if (!projForm.title.trim()) {
      showToast('Project title is required.', true)
      return
    }
    try {
      const payload = {
        title: projForm.title,
        category: projForm.category || 'SOFTWARE',
        description: projForm.description,
        url: projForm.url,
        image: projForm.image,
        star: projForm.star,
        stars_count: projForm.stars_count,
        published: projForm.published !== false,
        tags: projForm.tags
          ? projForm.tags.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      }
      if (editingProjId) {
        const updated = await api.updateProject(editingProjId, payload)
        setProjectsList((prev) => prev.map((p) => (p.id === editingProjId ? updated : p)))
        showToast('Project updated.')
        setEditingProjId(null)
      } else {
        const created = await api.createProject(payload)
        setProjectsList((prev) => [...prev, created])
        showToast('New project created.')
      }
      setProjForm({
        title: '',
        category: 'SOFTWARE',
        description: '',
        url: '',
        image: '',
        star: false,
        stars_count: '',
        published: true,
        tags: ''
      })
    } catch (err) {
      showToast(err.message || 'Failed to save project', true)
    }
  }

  const handleProjEdit = (proj) => {
    setEditingProjId(proj.id)
    setProjForm({
      title: proj.title || '',
      category: proj.category || 'SOFTWARE',
      description: proj.description || '',
      url: proj.url || '',
      image: proj.image || '',
      star: Boolean(proj.star),
      stars_count: proj.stars_count || '',
      published: proj.published !== false,
      tags: Array.isArray(proj.tags) ? proj.tags.join(', ') : (proj.tags || '')
    })
  }

  const handleProjDelete = async (id) => {
    if (!window.confirm('Delete this project from Supabase?')) return
    try {
      await api.deleteProject(id)
      setProjectsList((prev) => prev.filter((p) => p.id !== id))
      showToast('Project deleted.')
    } catch (err) {
      showToast(err.message || 'Failed to delete project', true)
    }
  }

  // ----------------------------------------------------
  // SECTION 4: MUSIC
  // ----------------------------------------------------
  const [musicAlbums, setMusicAlbums] = useState([])
  const [albumForm, setAlbumForm] = useState({
    title: '',
    artist: '',
    year: '2024',
    genre: '',
    tag: '',
    note: '',
    image: '',
    progress: 70,
    time: '02:40 / 03:50',
    initial: '',
    gradient: 'linear-gradient(135deg, #1f2937, #111827)',
    row: 1
  })
  const [editingAlbumId, setEditingAlbumId] = useState(null)

  const handleAlbumSubmit = async (e) => {
    e.preventDefault()
    if (!albumForm.title.trim() || !albumForm.artist.trim()) {
      showToast('Title and Artist are required.', true)
      return
    }
    try {
      const payload = {
        ...albumForm,
        progress: Number(albumForm.progress) || 50,
        row: Number(albumForm.row) || 1,
        initial: albumForm.initial || (albumForm.artist ? albumForm.artist.slice(0, 2).toUpperCase() : 'MU')
      }
      if (editingAlbumId) {
        const updated = await api.updateMusicAlbum(editingAlbumId, payload)
        setMusicAlbums((prev) => prev.map((a) => (a.id === editingAlbumId ? updated : a)))
        showToast('Album updated.')
        setEditingAlbumId(null)
      } else {
        const created = await api.createMusicAlbum(payload)
        setMusicAlbums((prev) => [...prev, created])
        showToast('Album added.')
      }
      setAlbumForm({
        title: '',
        artist: '',
        year: '2024',
        genre: '',
        tag: '',
        note: '',
        image: '',
        progress: 70,
        time: '02:40 / 03:50',
        initial: '',
        gradient: 'linear-gradient(135deg, #1f2937, #111827)',
        row: 1
      })
    } catch (err) {
      showToast(err.message || 'Failed to save album', true)
    }
  }

  const handleAlbumEdit = (a) => {
    setEditingAlbumId(a.id)
    setAlbumForm({
      title: a.title || '',
      artist: a.artist || '',
      year: a.year || '2024',
      genre: a.genre || '',
      tag: a.tag || '',
      note: a.note || '',
      image: a.image || a.cover || (a.gradient && (a.gradient.startsWith('http') || a.gradient.startsWith('/uploads')) ? a.gradient : ''),
      progress: a.progress || 50,
      time: a.time || '02:40 / 03:50',
      initial: a.initial || '',
      gradient: a.gradient || 'linear-gradient(135deg, #1f2937, #111827)',
      row: a.row || a.row_index || 1
    })
  }

  const handleAlbumDelete = async (id) => {
    if (!window.confirm('Delete this album?')) return
    try {
      await api.deleteMusicAlbum(id)
      setMusicAlbums((prev) => prev.filter((a) => a.id !== id))
      showToast('Album deleted.')
    } catch (err) {
      showToast(err.message || 'Failed to delete album', true)
    }
  }

  // ----------------------------------------------------
  // SECTION 5: TIGUAN
  // ----------------------------------------------------
  const [tiguan, setTiguan] = useState({
    title: '2009 Volkswagen Tiguan TSI 2.0',
    color: 'Deep Black Pearl',
    photos: [],
    mods: []
  })
  const [newTiguanPhotoUrl, setNewTiguanPhotoUrl] = useState('')
  const [newTiguanPhotoCaption, setNewTiguanPhotoCaption] = useState('')
  const [newModName, setNewModName] = useState('')
  const [newModDetail, setNewModDetail] = useState('')

  const handleTiguanSave = async () => {
    try {
      await api.updateTiguan(tiguan)
      showToast('Tiguan vehicle profile updated.')
    } catch (err) {
      showToast(err.message || 'Failed to save Tiguan profile', true)
    }
  }

  const handleAddTiguanPhoto = () => {
    if (!newTiguanPhotoUrl.trim()) return
    const nextPhotos = [
      ...(tiguan.photos || []),
      { id: Date.now(), url: newTiguanPhotoUrl.trim(), caption: newTiguanPhotoCaption.trim() }
    ]
    const updated = { ...tiguan, photos: nextPhotos }
    setTiguan(updated)
    setNewTiguanPhotoUrl('')
    setNewTiguanPhotoCaption('')
    api.updateTiguan(updated).then(() => showToast('Photo added to Tiguan.')).catch(() => {})
  }

  const handleRemoveTiguanPhoto = (id) => {
    const nextPhotos = (tiguan.photos || []).filter((p) => p.id !== id)
    const updated = { ...tiguan, photos: nextPhotos }
    setTiguan(updated)
    api.updateTiguan(updated).then(() => showToast('Photo removed.')).catch(() => {})
  }

  const handleAddMod = () => {
    if (!newModName.trim()) return
    const nextMods = [...(tiguan.mods || []), { name: newModName.trim(), detail: newModDetail.trim() }]
    const updated = { ...tiguan, mods: nextMods }
    setTiguan(updated)
    setNewModName('')
    setNewModDetail('')
    api.updateTiguan(updated).then(() => showToast('Mod added.')).catch(() => {})
  }

  const handleRemoveMod = (idx) => {
    const nextMods = (tiguan.mods || []).filter((_, i) => i !== idx)
    const updated = { ...tiguan, mods: nextMods }
    setTiguan(updated)
    api.updateTiguan(updated).then(() => showToast('Mod removed.')).catch(() => {})
  }

  // ----------------------------------------------------
  // SECTION 6: FRIENDS & FILM
  // ----------------------------------------------------
  const [friendsPhotos, setFriendsPhotos] = useState([])
  const [friendPhotoUrl, setFriendPhotoUrl] = useState('')
  const [friendPhotoTitle, setFriendPhotoTitle] = useState('')
  const [friendPhotoMeta, setFriendPhotoMeta] = useState('')

  const handleAddFriendPhoto = async (e) => {
    e.preventDefault()
    if (!friendPhotoUrl.trim()) {
      showToast('Photo URL is required.', true)
      return
    }
    try {
      const created = await api.createFriendsPhoto({
        url: friendPhotoUrl.trim(),
        title: friendPhotoTitle.trim() || 'Untitled film snapshot',
        meta: friendPhotoMeta.trim() || 'Film • 35mm',
        order_index: friendsPhotos.length
      })
      setFriendsPhotos((prev) => [...prev, created])
      setFriendPhotoUrl('')
      setFriendPhotoTitle('')
      setFriendPhotoMeta('')
      showToast('Photo added to Friends & Film gallery.')
    } catch (err) {
      showToast(err.message || 'Failed to add photo', true)
    }
  }

  const handleDeleteFriendPhoto = async (id) => {
    if (!window.confirm('Delete this photo?')) return
    try {
      await api.deleteFriendsPhoto(id)
      setFriendsPhotos((prev) => prev.filter((p) => p.id !== id))
      showToast('Photo deleted.')
    } catch (err) {
      showToast(err.message || 'Failed to delete photo', true)
    }
  }

  // ----------------------------------------------------
  // SECTION 7: CAT (MOCHI)
  // ----------------------------------------------------
  const [cat, setCat] = useState({
    name: 'Mochi',
    role: 'Chief QA & Keyboard Blocker',
    pats: 0,
    photos: []
  })
  const [newCatPhotoUrl, setNewCatPhotoUrl] = useState('')
  const [newCatPhotoCaption, setNewCatPhotoCaption] = useState('')

  const handleCatSave = async () => {
    try {
      await api.updateCat(cat)
      showToast('Cat profile updated.')
    } catch (err) {
      showToast(err.message || 'Failed to save cat profile', true)
    }
  }

  const handleAddCatPhoto = () => {
    if (!newCatPhotoUrl.trim()) return
    const nextPhotos = [
      ...(cat.photos || []),
      { id: Date.now(), url: newCatPhotoUrl.trim(), caption: newCatPhotoCaption.trim() }
    ]
    const updated = { ...cat, photos: nextPhotos }
    setCat(updated)
    setNewCatPhotoUrl('')
    setNewCatPhotoCaption('')
    api.updateCat(updated).then(() => showToast('Photo added to Cat.')).catch(() => {})
  }

  const handleRemoveCatPhoto = (id) => {
    const nextPhotos = (cat.photos || []).filter((p) => p.id !== id)
    const updated = { ...cat, photos: nextPhotos }
    setCat(updated)
    api.updateCat(updated).then(() => showToast('Photo removed.')).catch(() => {})
  }

  // ----------------------------------------------------
  // SECTION 8: SECURITY
  // ----------------------------------------------------
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingSecurity, setSavingSecurity] = useState(false)

  const handleAccountUpdate = async (e) => {
    e.preventDefault()
    if (newPassword && newPassword.length < 4) {
      showToast('Password must be at least 4 characters long.', true)
      return
    }
    if (newPassword && newPassword !== confirmPassword) {
      showToast('Passwords do not match.', true)
      return
    }
    setSavingSecurity(true)
    try {
      const res = await api.updateAccount({
        username: newUsername || undefined,
        password: newPassword || undefined
      })
      if (res.token) api.authSaveToken(res.token)
      if (res.username) setWho(res.username)
      setNewPassword('')
      setConfirmPassword('')
      showToast('Credentials updated in Supabase.')
    } catch (err) {
      showToast(err.message || 'Failed to update credentials', true)
    } finally {
      setSavingSecurity(false)
    }
  }

  // ----------------------------------------------------
  // INITIAL DATA LOADER
  // ----------------------------------------------------
  const loadAll = () => {
    Promise.all([
      api.profile().catch(() => null),
      api.bio().catch(() => null),
      api.experiences('all').catch(() => []),
      api.projects('all').catch(() => []),
      api.music().catch(() => ({ albums: [] })),
      api.tiguan().catch(() => ({})),
      api.friends().catch(() => ({ photos: [] })),
      api.cat().catch(() => ({}))
    ]).then(([prof, bioData, expList, projList, musicRes, tiguanRes, friendsRes, catRes]) => {
      if (prof) {
        setProfile((prev) => ({
          ...prev,
          name: prof.name ?? prev.name,
          hero: prof.hero ?? prev.hero,
          who_am_i: prof.who_am_i || prev.who_am_i,
          what_i_did: prof.what_i_did || prev.what_i_did,
          school: prof.school || prev.school,
          photo: prof.photo || prev.photo,
          email: prof.email || prev.email,
          linkedin_url: prof.linkedin_url || prev.linkedin_url,
          github_url: prof.github_url || prev.github_url,
          instagram_url: prof.instagram_url || prof.x_url || prev.instagram_url,
          spotify_url: prof.spotify_url || prev.spotify_url,
          motto: prof.motto || prev.motto
        }))
      }
      if (Array.isArray(expList)) setExperiencesList(expList)
      if (Array.isArray(projList)) setProjectsList(projList)
      if (musicRes?.albums) setMusicAlbums(musicRes.albums)
      if (tiguanRes && tiguanRes.title) setTiguan(tiguanRes)
      if (friendsRes?.photos) setFriendsPhotos(friendsRes.photos)
      if (catRes && catRes.name) setCat(catRes)
    })
  }

  const checkConnection = async () => {
    try {
      const status = await api.authStatus()
      setServerOnline(true)
      if (status.needsSetup) {
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
    } catch (e) {
      setServerOnline(false)
      setAuthView('login')
      setAuthErr(e.message || 'Could not reach API server (https://khairi.fun/api).')
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  // ----------------------------------------------------
  // AUTH HANDLERS
  // ----------------------------------------------------
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
      showToast('Admin initialized successfully.')
    } catch (ex) {
      setAuthErr(ex.message || 'Setup failed.')
    }
  }

  const handleResetLocal = async (e) => {
    e.preventDefault()
    setAuthErr('')
    if (passwordInput.length < 4) {
      setAuthErr('Password must be at least 4 characters.')
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
      showToast(`Admin updated & logged in as ${res.username}.`)
    } catch (ex) {
      setAuthErr(ex.message || 'Reset failed.')
    }
  }

  const handleLogout = () => {
    api.authLogout()
    setWho('')
    setAuthView('login')
    showToast('Logged out.')
  }

  // ----------------------------------------------------
  // RENDER: LOADING STATE (Skeleton Loading)
  // ----------------------------------------------------
  if (authView === 'loading') {
    return (
      <div className="max-w-[760px] mx-auto px-4 py-4">
        <Header currentPath="/admin" subtitle="content management console • connecting to database…" />

        {/* Status bar skeleton */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[#c8c6be]">
          <div className="skeleton w-44 h-5 rounded-sm"></div>
          <div className="skeleton w-28 h-5 rounded-sm"></div>
        </div>

        {/* Tab buttons skeleton */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {['whoami', 'experiences', 'projects', 'music', 'tiguan', 'friends', 'cat', 'security'].map((t) => (
            <div key={t} className="skeleton w-20 h-6 rounded-sm"></div>
          ))}
        </div>

        {/* Content Box Skeleton */}
        <div className="cmd-box">
          <div className="cmd-header">database // connecting...</div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="skeleton skeleton-text w-24"></div>
                <div className="skeleton h-8 w-full rounded-sm"></div>
              </div>
              <div className="space-y-1.5">
                <div className="skeleton skeleton-text w-32"></div>
                <div className="skeleton h-8 w-full rounded-sm"></div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="skeleton skeleton-text w-40"></div>
              <div className="skeleton h-16 w-full rounded-sm"></div>
            </div>

            <div className="space-y-1.5">
              <div className="skeleton skeleton-text w-48"></div>
              <div className="skeleton h-16 w-full rounded-sm"></div>
            </div>

            <div className="skeleton w-40 h-8 rounded-sm mt-3"></div>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // RENDER: LOGIN / SETUP SCREEN (Matching Home Page Aesthetic)
  // ----------------------------------------------------
  if (authView === 'setup' || authView === 'login') {
    return (
      <div className="max-w-[540px] mx-auto px-4 py-8">
        <Header currentPath="/admin" subtitle="admin control • authentication gate" />

        <div className="cmd-box mt-4">
          <div className="cmd-header">
            {authView === 'setup'
              ? 'setup_admin.exe'
              : authMode === 'reset'
                ? 'reset_credentials.exe'
                : 'admin_login.exe'}
          </div>

          {/* Connection Status & Default Credentials Pill */}
          <div className="mb-4 p-2.5 bg-white border border-[#c8c6be] text-xs font-mono rounded-sm">
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#e5e3dc] text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                SUPABASE: CONNECTED
              </span>
              <span className={`flex items-center gap-1.5 font-semibold ${serverOnline ? 'text-emerald-700' : 'text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${serverOnline ? 'bg-emerald-600' : 'bg-red-500'} inline-block`}></span>
                SERVER: {serverOnline ? 'ONLINE (khairi.fun)' : 'OFFLINE'}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-[11.5px]">
              <span>
                Default Login: <strong className="text-black">khairi</strong> / <strong className="text-black">admin123</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setUsernameInput('khairi')
                  setPasswordInput('admin123')
                  setAuthErr('')
                }}
                className="link-badge !text-[10px] !bg-[#1b1c18] !text-white !border-[#1b1c18] hover:!bg-[#333]"
              >
                [Quick-Fill Credentials]
              </button>
            </div>
          </div>

          {!serverOnline && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-300 text-red-800 text-xs font-mono rounded-sm">
              <strong className="block mb-1">⚠️ Server is offline</strong>
              Ensure backend server or Cloudflare Pages Functions are active at <code className="bg-black text-green-400 px-1 py-0.5 rounded">https://khairi.fun/api</code>.
              <button
                onClick={checkConnection}
                className="mt-2 block text-xs underline font-semibold text-red-700 hover:text-black"
              >
                ↻ Retry Connection
              </button>
            </div>
          )}

          {authErr && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-300 text-red-800 text-xs font-mono rounded-sm">
              [AUTH ERROR] {authErr}
            </div>
          )}

          <form onSubmit={authView === 'setup' ? handleSetup : authMode === 'reset' ? handleResetLocal : handleLogin} className="space-y-3">
            <div>
              <label className="admin-label">Username</label>
              <input
                type="text"
                className="admin-input"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g. khairi"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="admin-label">
                Password {authView === 'setup' && '(Min 4 chars)'}
              </label>
              <input
                type="password"
                className="admin-input"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="admin-btn-primary w-full justify-center !py-2 mt-2">
              {authView === 'setup'
                ? 'INITIALIZE ADMIN →'
                : authMode === 'reset'
                  ? 'UPDATE PASSWORD & SIGN IN →'
                  : 'AUTHENTICATE & ENTER →'}
            </button>
          </form>

          {authView !== 'setup' && (
            <div className="mt-4 pt-3 border-t border-[#e2e0d8] text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthErr('')
                  setAuthMode((prev) => (prev === 'login' ? 'reset' : 'login'))
                }}
                className="text-xs font-mono text-terminal-prompt underline hover:text-black"
              >
                {authMode === 'login'
                  ? 'Forgot password? Set / Reset locally in Supabase'
                  : '← Return to standard login'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // RENDER: MAIN ADMIN CONSOLE (Matching Home Page Aesthetic)
  // ----------------------------------------------------
  return (
    <div className="max-w-[760px] mx-auto px-4 py-4">
      {/* Hidden File Input for Image Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-3 py-2 border rounded shadow-md font-mono text-xs ${
            toast.isError
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-[#1b1c18] border-[#1b1c18] text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Top Header */}
      <Header currentPath="/admin" subtitle="content management console • supabase connected" />

      {/* System Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#c8c6be] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#f0eee8] border border-[#a8a69e] rounded text-[11px] text-[#2b2b28]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-ping"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block -ml-3"></span>
            <span>admin: {who}</span>
          </span>
          <span className="text-[11px] text-terminal-prompt hidden sm:inline">
            supabase://jnttmmhomgtpnkpymhfl
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            className="link-badge font-mono text-[11px] !py-0.5 !px-2"
          >
            ← View Live Site
          </a>
          <button
            onClick={handleLogout}
            className="link-badge font-mono text-[11px] !py-0.5 !px-2 !bg-[#f7f5ef] hover:!bg-[#e5e2d8]"
          >
            Log Out ✕
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Exactly matching Home Page sections!) */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5 font-mono text-xs">
        <button
          className={`tab-btn ${activeTab === 'whoami' ? 'active' : ''}`}
          onClick={() => setActiveTab('whoami')}
        >
          whoami
        </button>
        <button
          className={`tab-btn ${activeTab === 'experiences' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiences')}
        >
          experiences {experiencesList.length > 0 && `(${experiencesList.length})`}
        </button>
        <button
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          projects {projectsList.length > 0 && `(${projectsList.length})`}
        </button>
        <button
          className={`tab-btn ${activeTab === 'music' ? 'active' : ''}`}
          onClick={() => setActiveTab('music')}
        >
          music {musicAlbums.length > 0 && `(${musicAlbums.length})`}
        </button>
        <button
          className={`tab-btn ${activeTab === 'tiguan' ? 'active' : ''}`}
          onClick={() => setActiveTab('tiguan')}
        >
          tiguan
        </button>
        <button
          className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          friends {friendsPhotos.length > 0 && `(${friendsPhotos.length})`}
        </button>
        <button
          className={`tab-btn ${activeTab === 'cat' ? 'active' : ''}`}
          onClick={() => setActiveTab('cat')}
        >
          cat
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          security
        </button>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: WHOAMI (Profile & Bio)                        */}
      {/* ==================================================== */}
      {activeTab === 'whoami' && (
        <div className="cmd-box" id="section-admin-whoami">
          <div className="cmd-header">whoami // profile &amp; bio</div>
          <div className="text-xs text-on-surface-variant font-mono mb-4">
            Edit introductory bio paragraphs, portrait photo, and public social links.
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Full Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Khairi Nugroho"
                  required
                />
              </div>

              <div>
                <label className="admin-label">Headline / Subtitle</label>
                <input
                  type="text"
                  className="admin-input"
                  value={profile.hero}
                  onChange={(e) => setProfile({ ...profile, hero: e.target.value })}
                  placeholder="systems engineer • builder • bay area, ca"
                />
              </div>
            </div>

            <div>
              <label className="admin-label">Bio Paragraph 1 (Who am I)</label>
              <textarea
                className="admin-input"
                rows={2}
                value={profile.who_am_i}
                onChange={(e) => setProfile({ ...profile, who_am_i: e.target.value })}
              />
            </div>

            <div>
              <label className="admin-label">Bio Paragraph 2 (What I did / Current Focus)</label>
              <textarea
                className="admin-input"
                rows={2}
                value={profile.what_i_did}
                onChange={(e) => setProfile({ ...profile, what_i_did: e.target.value })}
              />
            </div>

            <div>
              <label className="admin-label">Bio Paragraph 3 (Hobbies &amp; Personal)</label>
              <textarea
                className="admin-input"
                rows={2}
                value={profile.school}
                onChange={(e) => setProfile({ ...profile, school: e.target.value })}
              />
            </div>

            <div>
              <label className="admin-label">Life Motto</label>
              <input
                type="text"
                className="admin-input"
                value={profile.motto}
                onChange={(e) => setProfile({ ...profile, motto: e.target.value })}
                placeholder="Precision is quiet; restraint speaks louder than ornamentation."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start">
              {profile.photo ? (
                <div className="shrink-0">
                  <div className="border border-[#75736c] p-1 bg-white shadow-sm inline-block">
                    <img
                      src={profile.photo}
                      alt="Portrait preview"
                      className="w-16 h-20 object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-terminal-prompt text-center mt-0.5">preview</div>
                </div>
              ) : null}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="admin-label">Portrait Photo URL</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={profile.photo}
                      onChange={(e) => setProfile({ ...profile, photo: e.target.value })}
                      placeholder="https://... or /uploads/img.jpg"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => triggerUpload((url) => setProfile((p) => ({ ...p, photo: url })))}
                      className="link-badge w-full justify-center !py-2 font-mono text-xs"
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading…' : '↑ Upload New Photo'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e5e3dc]">
              <div className="text-xs font-mono font-semibold text-terminal-prompt mb-3">
                &gt; social links &amp; contact
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Email</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="admin-label">LinkedIn URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={profile.linkedin_url}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="admin-label">GitHub URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={profile.github_url}
                    onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="admin-label">Instagram URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={profile.instagram_url}
                    onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving to Supabase…' : 'SAVE WHOAMI PROFILE →'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: EXPERIENCES                                   */}
      {/* ==================================================== */}
      {activeTab === 'experiences' && (
        <div className="space-y-6">
          <div className="cmd-box" id="section-admin-experience">
            <div className="cmd-header">
              {editingExpId ? `experience // edit #${editingExpId}` : 'experience // add new entry'}
            </div>
            <div className="text-xs text-on-surface-variant font-mono mb-3">
              Add or edit work history. When list is empty, the section is automatically hidden on the home page.
            </div>

            <form onSubmit={handleExpSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Company / Workplace *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={expForm.company}
                    onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    required
                  />
                </div>

                <div>
                  <label className="admin-label">Role / Job Title *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={expForm.role}
                    onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                    placeholder="e.g. Systems Engineer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="admin-label">Employment / Job Type</label>
                  <select
                    className="admin-input"
                    value={expForm.job_type || 'Full-time'}
                    onChange={(e) => setExpForm({ ...expForm, job_type: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                  </select>
                </div>

                <div>
                  <label className="admin-label">Location</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={expForm.location}
                    onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                    placeholder="e.g. Batam, Indonesia • Remote"
                  />
                </div>

                <div>
                  <label className="admin-label">Period / Duration</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={expForm.period}
                    onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                    placeholder="e.g. Jan 2024 — Present"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="admin-label">Company / Job Logo URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={expForm.logo}
                    onChange={(e) => setExpForm({ ...expForm, logo: e.target.value })}
                    placeholder="https://... or /uploads/logo.png"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => triggerUpload((url) => setExpForm((prev) => ({ ...prev, logo: url })))}
                    className="link-badge w-full justify-center !py-2 font-mono text-xs"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading…' : '↑ Upload Job Logo'}
                  </button>
                  {expForm.logo && (
                    <img
                      src={expForm.logo}
                      alt="Logo preview"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-sm object-contain border border-[#c8c6be] bg-white p-0.5 shrink-0"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="admin-label">Description / Responsibilities</label>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={expForm.description}
                  onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                  placeholder="Key accomplishments and architecture details..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expForm.star}
                    onChange={(e) => setExpForm({ ...expForm, star: e.target.checked })}
                  />
                  <span>Featured (Star ★)</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={expForm.published}
                    onChange={(e) => setExpForm({ ...expForm, published: e.target.checked })}
                  />
                  <span>Published on Home</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button type="submit" className="admin-btn-primary">
                  {editingExpId ? 'UPDATE EXPERIENCE →' : 'ADD EXPERIENCE →'}
                </button>
                {editingExpId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExpId(null)
                      setExpForm({
                        company: '',
                        role: '',
                        location: '',
                        period: '',
                        description: '',
                        initial: '',
                        initial_bg: '#1b1c18',
                        star: false,
                        order_index: 0,
                        published: true
                      })
                    }}
                    className="link-badge font-mono text-xs !py-1.5"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Experiences */}
          <div className="cmd-box">
            <div className="cmd-header">
              experiences.list ({experiencesList.length})
            </div>

            {experiencesList.length === 0 ? (
              <div className="text-xs font-mono text-terminal-prompt py-4 text-center">
                // No experiences in database. Section is currently hidden on home page.
              </div>
            ) : (
              <div className="space-y-2">
                {experiencesList.map((exp) => (
                  <div key={exp.id} className="item-card flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {exp.logo || (exp.initial_bg && (exp.initial_bg.startsWith('http') || exp.initial_bg.startsWith('/uploads'))) ? (
                        <img
                          src={exp.logo || exp.initial_bg}
                          alt={exp.company}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-sm object-contain bg-white border border-[#c8c6be] shrink-0 mt-0.5 p-0.5"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-sm text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5"
                          style={{ backgroundColor: exp.initial_bg || '#1b1c18' }}
                        >
                          {exp.initial || exp.company[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-xs text-on-surface">
                          {exp.company} {exp.star && <span className="text-amber-500">★</span>}
                        </div>
                        <div className="text-[11.5px] text-[#2a2b27] flex items-center gap-1.5 flex-wrap mt-0.5">
                          <span>{exp.role}</span>
                          <span className="text-[9.5px] font-mono px-1 py-0.2 bg-[#f0eee8] border border-[#a8a69e] rounded text-[#2b2b28] uppercase">
                            {exp.job_type || (Array.isArray(exp.badges) && typeof exp.badges[0] === 'string' ? exp.badges[0] : 'Full-time')}
                          </span>
                          <span className="text-on-surface-variant font-mono">• {exp.period}</span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">
                          {exp.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleExpEdit(exp)}
                        className="link-badge font-mono text-[10px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleExpDelete(exp.id)}
                        className="admin-btn-danger"
                      >
                        Delete ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: PROJECTS                                      */}
      {/* ==================================================== */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="cmd-box" id="section-admin-projects">
            <div className="cmd-header">
              {editingProjId ? `projects // edit #${editingProjId}` : 'projects // add new project'}
            </div>
            <div className="text-xs text-on-surface-variant font-mono mb-3">
              Showcase projects for visitors to explore. When list is empty, section is hidden on home page.
            </div>

            <form onSubmit={handleProjSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Project Title *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={projForm.title}
                    onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                    placeholder="e.g. Distributed Cache Engine"
                    required
                  />
                </div>

                <div>
                  <label className="admin-label">Project Link (URL)</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={projForm.url}
                    onChange={(e) => setProjForm({ ...projForm, url: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="admin-label">Description</label>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={projForm.description}
                  onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                  placeholder="Overview of the system, stack used, and key features..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="admin-label">Cover Image URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={projForm.image}
                    onChange={(e) => setProjForm({ ...projForm, image: e.target.value })}
                    placeholder="https://... or /uploads/img.png"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => triggerUpload((url) => setProjForm((p) => ({ ...p, image: url })))}
                    className="link-badge w-full justify-center !py-2 font-mono text-xs"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading…' : '↑ Upload Project Image'}
                  </button>
                  {projForm.image && (
                    <img
                      src={projForm.image}
                      alt="Project preview"
                      className="w-12 h-10 object-cover border border-[#c8c6be] rounded-sm shrink-0"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Tech Stack Tags (Comma separated)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={projForm.tags}
                    onChange={(e) => setProjForm({ ...projForm, tags: e.target.value })}
                    placeholder="TypeScript, Rust, Redis"
                  />
                </div>

                <div>
                  <label className="admin-label">Stars Count / Metric (Optional)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={projForm.stars_count}
                    onChange={(e) => setProjForm({ ...projForm, stars_count: e.target.value })}
                    placeholder="e.g. ★ 124 stars"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projForm.star}
                    onChange={(e) => setProjForm({ ...projForm, star: e.target.checked })}
                  />
                  <span>Featured (Gold Star ★)</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projForm.published}
                    onChange={(e) => setProjForm({ ...projForm, published: e.target.checked })}
                  />
                  <span>Published on Home</span>
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button type="submit" className="admin-btn-primary">
                  {editingProjId ? 'UPDATE PROJECT →' : 'ADD PROJECT →'}
                </button>
                {editingProjId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProjId(null)
                      setProjForm({
                        title: '',
                        category: 'SOFTWARE',
                        description: '',
                        url: '',
                        image: '',
                        star: false,
                        stars_count: '',
                        published: true,
                        tags: ''
                      })
                    }}
                    className="link-badge font-mono text-xs !py-1.5"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Projects */}
          <div className="cmd-box">
            <div className="cmd-header">projects.list ({projectsList.length})</div>

            {projectsList.length === 0 ? (
              <div className="text-xs font-mono text-terminal-prompt py-4 text-center">
                // No projects in database. Section is currently hidden on home page.
              </div>
            ) : (
              <div className="space-y-2">
                {projectsList.map((proj) => (
                  <div key={proj.id} className="item-card flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      {proj.image && (
                        <img
                          src={proj.image}
                          alt={proj.title}
                          className="w-12 h-10 object-cover border border-[#c8c6be] rounded-sm shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-xs text-on-surface">
                          {proj.title} {proj.star && <span className="text-amber-500">★</span>}
                        </div>
                        <div className="text-[11px] text-on-surface-variant line-clamp-1">
                          {proj.description}
                        </div>
                        {proj.url && (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-accent-link underline font-mono"
                          >
                            {proj.url}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleProjEdit(proj)}
                        className="link-badge font-mono text-[10px]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleProjDelete(proj.id)}
                        className="admin-btn-danger"
                      >
                        Delete ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: MUSIC                                         */}
      {/* ==================================================== */}
      {activeTab === 'music' && (
        <div className="space-y-6">
          <div className="cmd-box" id="section-admin-music">
            <div className="cmd-header">
              {editingAlbumId ? `music // edit album #${editingAlbumId}` : 'music // add vinyl album'}
            </div>
            <div className="text-xs text-on-surface-variant font-mono mb-3">
              Manage the 18-album analog listening rack displayed on <a href="/music" className="underline">/music</a>.
            </div>

            <form onSubmit={handleAlbumSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="admin-label">Album Title *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                    placeholder="e.g. Blonde"
                    required
                  />
                </div>

                <div>
                  <label className="admin-label">Artist *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={albumForm.artist}
                    onChange={(e) => setAlbumForm({ ...albumForm, artist: e.target.value })}
                    placeholder="e.g. Frank Ocean"
                    required
                  />
                </div>

                <div>
                  <label className="admin-label">Release Year</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={albumForm.year}
                    onChange={(e) => setAlbumForm({ ...albumForm, year: e.target.value })}
                    placeholder="2016"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="admin-label">Genre</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={albumForm.genre}
                    onChange={(e) => setAlbumForm({ ...albumForm, genre: e.target.value })}
                    placeholder="r&b / ambient"
                  />
                </div>

                <div>
                  <label className="admin-label">Listening Tag / Mood</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={albumForm.tag}
                    onChange={(e) => setAlbumForm({ ...albumForm, tag: e.target.value })}
                    placeholder="night drive"
                  />
                </div>

                <div>
                  <label className="admin-label">Display Row (1, 2, or 3)</label>
                  <select
                    className="admin-input"
                    value={albumForm.row}
                    onChange={(e) => setAlbumForm({ ...albumForm, row: Number(e.target.value) })}
                  >
                    <option value={1}>Row 1 (Upper Rack)</option>
                    <option value={2}>Row 2 (Middle Rack)</option>
                    <option value={3}>Row 3 (Lower Rack)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="admin-label">Album Artwork / Cover Image URL</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={albumForm.image}
                    onChange={(e) => setAlbumForm({ ...albumForm, image: e.target.value })}
                    placeholder="https://... or /uploads/album.jpg"
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => triggerUpload((url) => setAlbumForm((prev) => ({ ...prev, image: url })))}
                    className="link-badge w-full justify-center !py-2 font-mono text-xs"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading…' : '↑ Upload Album Cover'}
                  </button>
                  {albumForm.image && (
                    <img
                      src={albumForm.image}
                      alt="Cover preview"
                      className="w-8 h-8 rounded-[2px] object-cover border border-[#c8c6be] shrink-0"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="admin-label">Listening Note / Impressions</label>
                <textarea
                  className="admin-input"
                  rows={2}
                  value={albumForm.note}
                  onChange={(e) => setAlbumForm({ ...albumForm, note: e.target.value })}
                  placeholder="Warm Rhodes keys with masterclass dynamic headroom..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button type="submit" className="admin-btn-primary">
                  {editingAlbumId ? 'UPDATE ALBUM →' : 'ADD ALBUM →'}
                </button>
                {editingAlbumId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAlbumId(null)
                      setAlbumForm({
                        title: '',
                        artist: '',
                        year: '2024',
                        genre: '',
                        tag: '',
                        note: '',
                        progress: 70,
                        time: '02:40 / 03:50',
                        initial: '',
                        gradient: 'linear-gradient(135deg, #1f2937, #111827)',
                        row: 1
                      })
                    }}
                    className="link-badge font-mono text-xs !py-1.5"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Albums List */}
          <div className="cmd-box">
            <div className="cmd-header">music.albums ({musicAlbums.length})</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {musicAlbums.map((album) => (
                <div key={album.id} className="item-card flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    {album.image || (album.gradient && (album.gradient.startsWith('http') || album.gradient.startsWith('/uploads'))) ? (
                      <img
                        src={album.image || album.gradient}
                        alt={album.title}
                        className="w-9 h-9 rounded-[2px] object-cover border border-[#c8c6be] shrink-0"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-[2px] flex items-center justify-center font-mono font-bold text-white text-[10px] shadow-sm shrink-0"
                        style={{ background: album.gradient || 'linear-gradient(135deg, #1f2937, #111827)' }}
                      >
                        {album.initial || (album.title ? album.title.slice(0, 2).toUpperCase() : 'MU')}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-xs text-on-surface">
                        {album.title}
                      </div>
                      <div className="text-[11px] text-[#2b2b28]">
                        {album.artist} • <span className="text-on-surface-variant font-mono">{album.year}</span>
                      </div>
                      <div className="text-[10px] text-terminal-prompt font-mono">
                        {album.tag || album.genre} • Row {album.row || album.row_index || 1}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleAlbumEdit(album)}
                      className="link-badge font-mono text-[10px]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleAlbumDelete(album.id)}
                      className="admin-btn-danger"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: TIGUAN                                        */}
      {/* ==================================================== */}
      {activeTab === 'tiguan' && (
        <div className="space-y-6">
          <div className="cmd-box" id="section-admin-tiguan">
            <div className="cmd-header">2009 tiguan // vehicle configuration</div>
            <div className="text-xs text-on-surface-variant font-mono mb-4">
              Manage specs, modifications, and high-resolution chassis photos for <a href="/tiguan" className="underline">/tiguan</a>.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="admin-label">Vehicle Title</label>
                <input
                  type="text"
                  className="admin-input"
                  value={tiguan.title || ''}
                  onChange={(e) => setTiguan({ ...tiguan, title: e.target.value })}
                  placeholder="2009 Volkswagen Tiguan TSI 2.0"
                />
              </div>

              <div>
                <label className="admin-label">Factory Color</label>
                <input
                  type="text"
                  className="admin-input"
                  value={tiguan.color || ''}
                  onChange={(e) => setTiguan({ ...tiguan, color: e.target.value })}
                  placeholder="Deep Black Pearl"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleTiguanSave}
              className="admin-btn-primary mb-6"
            >
              SAVE VEHICLE SPECS →
            </button>

            {/* Photos Sub-section */}
            <div className="pt-4 border-t border-[#e2e0d8]">
              <div className="text-xs font-mono font-semibold text-terminal-prompt mb-3">
                &gt; tiguan photos ({tiguan.photos?.length || 0})
              </div>

              {newTiguanPhotoUrl && (
                <div className="flex items-center gap-2.5 p-2 bg-[#f0eee8] border border-[#c8c6be] rounded mb-2">
                  <img
                    src={newTiguanPhotoUrl}
                    alt="New photo preview"
                    className="w-16 h-12 object-cover border border-[#75736c] rounded-xs shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="text-[11px] font-mono text-terminal-prompt truncate">
                    Ready to add: <span className="text-on-surface font-semibold">{newTiguanPhotoUrl}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <input
                  type="text"
                  className="admin-input"
                  value={newTiguanPhotoUrl}
                  onChange={(e) => setNewTiguanPhotoUrl(e.target.value)}
                  placeholder="Photo URL (https://...)"
                />
                <input
                  type="text"
                  className="admin-input"
                  value={newTiguanPhotoCaption}
                  onChange={(e) => setNewTiguanPhotoCaption(e.target.value)}
                  placeholder="Caption (e.g. suspension install)"
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleAddTiguanPhoto}
                    className="admin-btn-primary flex-1 justify-center"
                  >
                    + Add Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerUpload((url) => setNewTiguanPhotoUrl(url))}
                    className="link-badge font-mono text-xs"
                    disabled={uploading}
                  >
                    ↑ Upload
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(tiguan.photos || []).map((photo) => (
                  <div key={photo.id} className="item-card relative">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Tiguan photo'}
                      className="w-full h-28 object-cover border border-[#c8c6be] rounded-sm mb-1.5"
                    />
                    <div className="text-[11px] font-mono text-terminal-prompt truncate">
                      {photo.caption || 'Untitled photo'}
                    </div>
                    <button
                      onClick={() => handleRemoveTiguanPhoto(photo.id)}
                      className="admin-btn-danger mt-1 w-full text-center"
                    >
                      Remove ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modifications Sub-section */}
            <div className="pt-4 border-t border-[#e2e0d8] mt-6">
              <div className="text-xs font-mono font-semibold text-terminal-prompt mb-3">
                &gt; performance modifications ({tiguan.mods?.length || 0})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <input
                  type="text"
                  className="admin-input"
                  value={newModName}
                  onChange={(e) => setNewModName(e.target.value)}
                  placeholder="Part name (e.g. Bilstein B14 Coilovers)"
                />
                <input
                  type="text"
                  className="admin-input"
                  value={newModDetail}
                  onChange={(e) => setNewModDetail(e.target.value)}
                  placeholder="Spec / Detail (-42mm stance)"
                />
                <button
                  type="button"
                  onClick={handleAddMod}
                  className="admin-btn-primary justify-center"
                >
                  + Add Mod
                </button>
              </div>

              <div className="space-y-1.5">
                {(tiguan.mods || []).map((mod, idx) => (
                  <div key={idx} className="item-card flex items-center justify-between py-1.5 px-3">
                    <span className="text-xs font-semibold">{mod.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-on-surface-variant">{mod.detail}</span>
                      <button
                        onClick={() => handleRemoveMod(idx)}
                        className="admin-btn-danger !py-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: FRIENDS & FILM                                */}
      {/* ==================================================== */}
      {activeTab === 'friends' && (
        <div className="space-y-6">
          <div className="cmd-box" id="section-admin-friends">
            <div className="cmd-header">friends &amp; film // add photograph</div>
            <div className="text-xs text-on-surface-variant font-mono mb-3">
              Upload and manage analog 35mm film memories showcased on <a href="/friends" className="underline">/friends</a>.
            </div>

            <form onSubmit={handleAddFriendPhoto} className="space-y-3">
              {friendPhotoUrl && (
                <div className="flex items-center gap-2.5 p-2 bg-[#f0eee8] border border-[#c8c6be] rounded mb-2">
                  <img
                    src={friendPhotoUrl}
                    alt="Film photo preview"
                    className="w-16 h-12 object-cover border border-[#75736c] rounded-xs shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="text-[11px] font-mono text-terminal-prompt truncate">
                    Ready to add: <span className="text-on-surface font-semibold">{friendPhotoUrl}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="admin-label">Photo URL *</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={friendPhotoUrl}
                    onChange={(e) => setFriendPhotoUrl(e.target.value)}
                    placeholder="https://... or /uploads/film.jpg"
                    required
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => triggerUpload((url) => setFriendPhotoUrl(url))}
                    className="link-badge w-full justify-center !py-2 font-mono text-xs"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading…' : '↑ Upload Film Photo'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Photo Title / Caption</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={friendPhotoTitle}
                    onChange={(e) => setFriendPhotoTitle(e.target.value)}
                    placeholder="e.g. Mt. Tam ridge sunset"
                  />
                </div>

                <div>
                  <label className="admin-label">Location &amp; Meta</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={friendPhotoMeta}
                    onChange={(e) => setFriendPhotoMeta(e.target.value)}
                    placeholder="e.g. CA • Oct 2023"
                  />
                </div>
              </div>

              <button type="submit" className="admin-btn-primary">
                + ADD TO FRIENDS GALLERY →
              </button>
            </form>
          </div>

          {/* Friends Photos Gallery */}
          <div className="cmd-box">
            <div className="cmd-header">friends.gallery ({friendsPhotos.length})</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {friendsPhotos.map((photo) => (
                <div key={photo.id} className="item-card">
                  <img
                    src={photo.url}
                    alt={photo.title || 'Friend photo'}
                    className="w-full h-32 object-cover border border-[#c8c6be] rounded-sm mb-1.5"
                  />
                  <div className="font-semibold text-xs text-on-surface truncate">
                    {photo.title || 'Untitled'}
                  </div>
                  <div className="text-[10px] font-mono text-terminal-prompt truncate mb-2">
                    {photo.meta || 'Film • 35mm'}
                  </div>
                  <button
                    onClick={() => handleDeleteFriendPhoto(photo.id)}
                    className="admin-btn-danger w-full text-center"
                  >
                    Delete ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 7: CAT (MOCHI)                                   */}
      {/* ==================================================== */}
      {activeTab === 'cat' && (
        <div className="space-y-6">
          <div className="cmd-box" id="section-admin-cat">
            <div className="cmd-header">mochi (cat) // chief qa &amp; keyboard blocker</div>
            <div className="text-xs text-on-surface-variant font-mono mb-4">
              Configure Mochi's profile, pat count, and daily surveillance photos on <a href="/cat" className="underline">/cat</a>.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="admin-label">Cat Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={cat.name || 'Mochi'}
                  onChange={(e) => setCat({ ...cat, name: e.target.value })}
                />
              </div>

              <div>
                <label className="admin-label">Role / Job Title</label>
                <input
                  type="text"
                  className="admin-input"
                  value={cat.role || 'Chief QA & Keyboard Blocker'}
                  onChange={(e) => setCat({ ...cat, role: e.target.value })}
                />
              </div>

              <div>
                <label className="admin-label">Head Pats Counter</label>
                <input
                  type="number"
                  className="admin-input"
                  value={cat.pats ?? 0}
                  onChange={(e) => setCat({ ...cat, pats: Number(e.target.value) || 0 })}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCatSave}
              className="admin-btn-primary mb-6"
            >
              SAVE CAT PROFILE →
            </button>

            {/* Photos Sub-section */}
            <div className="pt-4 border-t border-[#e2e0d8]">
              <div className="text-xs font-mono font-semibold text-terminal-prompt mb-3">
                &gt; mochi photos ({cat.photos?.length || 0})
              </div>

              {newCatPhotoUrl && (
                <div className="flex items-center gap-2.5 p-2 bg-[#f0eee8] border border-[#c8c6be] rounded mb-2">
                  <img
                    src={newCatPhotoUrl}
                    alt="Cat photo preview"
                    className="w-16 h-12 object-cover border border-[#75736c] rounded-xs shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="text-[11px] font-mono text-terminal-prompt truncate">
                    Ready to add: <span className="text-on-surface font-semibold">{newCatPhotoUrl}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <input
                  type="text"
                  className="admin-input"
                  value={newCatPhotoUrl}
                  onChange={(e) => setNewCatPhotoUrl(e.target.value)}
                  placeholder="Photo URL (https://...)"
                />
                <input
                  type="text"
                  className="admin-input"
                  value={newCatPhotoCaption}
                  onChange={(e) => setNewCatPhotoCaption(e.target.value)}
                  placeholder="Caption (e.g. napping on mechanical keyboard)"
                />
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleAddCatPhoto}
                    className="admin-btn-primary flex-1 justify-center"
                  >
                    + Add Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerUpload((url) => setNewCatPhotoUrl(url))}
                    className="link-badge font-mono text-xs"
                    disabled={uploading}
                  >
                    ↑ Upload
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(cat.photos || []).map((photo) => (
                  <div key={photo.id} className="item-card relative">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Cat photo'}
                      className="w-full h-32 object-cover border border-[#c8c6be] rounded-sm mb-1.5"
                    />
                    <div className="text-[11px] font-mono text-terminal-prompt truncate">
                      {photo.caption || 'Untitled snapshot'}
                    </div>
                    <button
                      onClick={() => handleRemoveCatPhoto(photo.id)}
                      className="admin-btn-danger mt-1 w-full text-center"
                    >
                      Remove ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 8: SECURITY                                      */}
      {/* ==================================================== */}
      {activeTab === 'security' && (
        <div className="cmd-box" id="section-admin-security">
          <div className="cmd-header">security // account &amp; database credentials</div>
          <div className="text-xs text-on-surface-variant font-mono mb-4">
            Manage your master console username and authentication password. Protected with bcrypt 10 rounds.
          </div>

          {/* Database Health Pill */}
          <div className="mb-4 p-3 bg-white border border-[#c8c6be] text-xs font-mono rounded-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-terminal-prompt">Database Engine:</span>
              <span className="text-emerald-700 font-semibold">Supabase (PostgreSQL)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-terminal-prompt">Current Operator:</span>
              <span className="font-semibold">{who}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-terminal-prompt">API Endpoint:</span>
              <span>{typeof window !== 'undefined' ? `${window.location.origin}/api` : 'https://khairi.fun/api'}</span>
            </div>
          </div>

          <form onSubmit={handleAccountUpdate} className="space-y-3 max-w-[420px]">
            <div>
              <label className="admin-label">Username</label>
              <input
                type="text"
                className="admin-input"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Admin username"
                required
              />
            </div>

            <div>
              <label className="admin-label">New Password (Min 4 chars, leave blank to keep current)</label>
              <input
                type="password"
                className="admin-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="admin-label">Confirm New Password</label>
              <input
                type="password"
                className="admin-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={savingSecurity}
              >
                {savingSecurity ? 'Updating Supabase…' : 'UPDATE CREDENTIALS →'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
