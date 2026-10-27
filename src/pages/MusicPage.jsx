import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import { api } from '../api.js'

function AlbumCover({ album, className = 'w-10 h-10', textClass = 'text-[11px]' }) {
  const [imgFailed, setImgFailed] = useState(false)
  const imgUrl = album?.image || album?.cover || (album?.gradient && (album.gradient.startsWith('http') || album.gradient.startsWith('/uploads')) ? album.gradient : null)
  if (imgUrl && !imgFailed) {
    return (
      <img
        src={imgUrl}
        alt={album?.title || 'Album cover'}
        className={`${className} rounded-[2px] object-cover border border-[#75736c] shadow-sm shrink-0`}
        onError={() => setImgFailed(true)}
      />
    )
  }
  return (
    <div
      className={`${className} rounded-[2px] border border-[#75736c] flex items-center justify-center font-mono font-bold text-white ${textClass} shrink-0 shadow-sm`}
      style={{ background: album?.gradient || 'linear-gradient(135deg, #1f2937, #111827)' }}
    >
      {album?.initial || (album?.title ? album.title.slice(0, 2).toUpperCase() : 'MU')}
    </div>
  )
}

export default function MusicPage() {
  const [musicData, setMusicData] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_DATA__?.music) {
      return window.__INITIAL_DATA__.music
    }
    return null
  })
  const [loading, setLoading] = useState(!musicData)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState('1.0') // '0.5' | '1.0' | '1.5'
  const [activeMood, setActiveMood] = useState('lock-in')
  const [selectedAlbum, setSelectedAlbum] = useState(null)

  useEffect(() => {
    document.title = 'Khairi Nugroho — Music'
    api.music().then((data) => {
      if (data) {
        setMusicData(data)
        if (data.albums && data.albums.length > 0) {
          setSelectedAlbum(data.albums[0])
        }
      }
      setLoading(false)
    }).catch((err) => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="max-w-[760px] mx-auto">
        <Header currentPath="/music" subtitle="analog vinyl crates • modular synths • midnight listening" />
        <div className="cmd-box">
          <div className="cmd-header">music // loading database...</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#c8c6be]">
              <div className="skeleton w-32 h-6 rounded-sm"></div>
              <div className="skeleton w-24 h-6 rounded-sm"></div>
            </div>

            {/* Player Card Skeleton */}
            <div className="item-card bg-white p-3">
              <div className="flex items-center gap-3">
                <div className="skeleton w-12 h-12 rounded-[2px] shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton skeleton-text w-32"></div>
                  <div className="skeleton skeleton-text w-56"></div>
                </div>
              </div>
              <div className="skeleton w-full h-1.5 rounded-full mt-3"></div>
            </div>

            {/* Marquee Racks Skeleton */}
            <div className="space-y-2 pt-2">
              <div className="flex gap-2 overflow-hidden py-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="item-card flex items-center gap-2 p-1.5 w-44 shrink-0">
                    <div className="skeleton w-10 h-10 rounded-[2px] shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <div className="skeleton skeleton-text w-20"></div>
                      <div className="skeleton skeleton-text w-14"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 overflow-hidden py-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="item-card flex items-center gap-2 p-1.5 w-44 shrink-0">
                    <div className="skeleton w-10 h-10 rounded-[2px] shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <div className="skeleton skeleton-text w-20"></div>
                      <div className="skeleton skeleton-text w-14"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const albums = musicData?.albums || []
  const row1 = albums.filter((a) => (a.row || a.row_index) === 1 || (!a.row && !a.row_index))
  const row2 = albums.filter((a) => (a.row || a.row_index) === 2)
  const row3 = albums.filter((a) => (a.row || a.row_index) === 3)

  // Fallbacks if rows are distributed or uneven
  const r1 = row1.length > 0 ? row1 : albums.slice(0, 6)
  const r2 = row2.length > 0 ? row2 : albums.slice(6, 12)
  const r3 = row3.length > 0 ? row3 : albums.slice(12, 18)

  const active = selectedAlbum || albums[0] || {
    title: 'Blonde',
    artist: 'Frank Ocean',
    year: '2016',
    genre: 'r&b / avant-garde',
    tag: 'night drive',
    progress: 71,
    time: '02:47 / 03:54',
    initial: 'FO',
    gradient: 'linear-gradient(135deg, #1f2937, #111827)',
    note: 'Endless late night drives down I-280. Warm Rhodes keys with masterclass dynamic headroom.'
  }

  const speedClass = speed === '0.5' ? 'speed-05x' : speed === '1.5' ? 'speed-15x' : 'speed-10x'

  return (
    <div className="max-w-[760px] mx-auto">
      <Header currentPath="/music" subtitle="analog vinyl crates • modular synths • midnight listening" />

      <div className="cmd-box" id="section-music">
        <div className="cmd-header">C:\users\music</div>

        {/* Header & Controls Bar */}
        <div className="flex flex-col gap-2 pb-3 mb-3 border-b border-[#c8c6be]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#f0eee8] border border-[#a8a69e] rounded font-mono text-[11px] text-[#2b2b28]">
                {isPlaying ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-ping"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block -ml-3"></span>
                    <span>playing • {speed}x</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block"></span>
                    <span>paused</span>
                  </>
                )}
              </span>
              <span className="font-mono text-[11px] text-terminal-prompt hidden sm:inline">music.exe • random/music</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] font-mono text-terminal-prompt flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
                live supabase stream
              </div>
              <span className="text-[10px] font-mono text-[#8a8880] border border-[#d2cfc7] px-1.5 py-0.5 rounded bg-white">
                corners: 2px
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="link-badge font-mono text-[11px] !py-0.5 !px-2"
              >
                <span>{isPlaying ? '⏸' : '▶'}</span>
                <span>{isPlaying ? 'pause marquee' : 'resume marquee'}</span>
              </button>
              <div className="flex items-center border border-[#b2b0a8] rounded bg-white p-0.5 gap-0.5">
                <button
                  onClick={() => setSpeed('0.5')}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    speed === '0.5' ? 'bg-[#1b1c18] text-white' : 'hover:bg-[#f0eee8] text-on-surface-variant'
                  }`}
                >
                  0.5x
                </button>
                <button
                  onClick={() => setSpeed('1.0')}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    speed === '1.0' ? 'bg-[#1b1c18] text-white' : 'hover:bg-[#f0eee8] text-on-surface-variant'
                  }`}
                >
                  1.0x
                </button>
                <button
                  onClick={() => setSpeed('1.5')}
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    speed === '1.5' ? 'bg-[#1b1c18] text-white' : 'hover:bg-[#f0eee8] text-on-surface-variant'
                  }`}
                >
                  1.5x
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-terminal-prompt text-[11px]">
              <span className="hidden md:inline">tap covers: details / now playing</span>
              <span className="text-[#b8b6ad]">•</span>
              <span className="text-on-surface font-semibold">{albums.length || 22} albums loaded</span>
            </div>
          </div>
        </div>

        {/* Retro Player & Now Inspect Card */}
        <div id="retro-player-card" className="item-card border-[#9c9a91] bg-white p-3 mb-3.5 transition-all duration-200">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <AlbumCover album={active} className="w-12 h-12" textClass="text-xs" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-300 px-1 rounded">
                    now inspect
                  </span>
                  <span id="np-year" className="text-[11px] font-mono text-terminal-prompt">
                    {active.year}
                  </span>
                  <span id="np-genre" className="text-[10px] font-mono text-[#585955] border-l border-[#d8d6cf] pl-1.5">
                    {active.genre}
                  </span>
                </div>
                <div className="font-bold text-[13.5px] text-on-surface truncate">
                  <span id="np-title">{active.title}</span> <span className="font-normal text-on-surface-variant">—</span>{' '}
                  <span id="np-artist" className="font-medium text-on-surface-variant">{active.artist}</span>
                </div>
              </div>
            </div>
            <div className="text-right sm:shrink-0 w-full sm:w-auto">
              <div className="text-[11px] font-mono text-terminal-prompt flex sm:justify-end items-center gap-2">
                <span id="np-time">{active.time || '02:47 / 03:54'}</span>
                <span className="text-xs text-star-gold">★ loop heavy</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-[#f0eee8] h-1.5 rounded-full overflow-hidden mt-2.5 border border-[#dcdad4]">
            <div
              id="np-progress"
              className="bg-[#1b1c18] h-full transition-all duration-300"
              style={{ width: `${active.progress || 60}%` }}
            ></div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#f0eee8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-xs text-on-surface-variant font-mono">
            <div className="text-[11.5px] font-mono">
              <span className="text-terminal-prompt">&gt; rotation note: </span>
              <span id="np-note" className="text-on-surface font-sans">{active.note}</span>
            </div>
            <div className="shrink-0 flex items-center gap-1.5">
              <span id="np-tag" className="text-[10px] bg-[#f5f3ed] border border-[#d2cfc7] text-[#333] px-1.5 py-0.5 rounded font-mono">
                {active.tag || 'focus'}
              </span>
              <a
                href="https://spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link-badge !text-[10px] !py-0 !px-1.5"
              >
                listen ↗
              </a>
            </div>
          </div>
        </div>

        {/* 3-Row Infinite Marquee */}
        <div
          id="marquee-super-wrapper"
          className={`${speedClass} ${!isPlaying ? 'marquee-paused' : ''} space-y-2 border border-[#b8b6ad] bg-[#f7f5ef] p-2 rounded-sm overflow-hidden select-none mb-3`}
        >
          {/* Row 1: Leftward */}
          <div className="overflow-hidden">
            <div className="marquee-track-left gap-2 py-0.5">
              <div className="flex gap-2 shrink-0">
                {r1.map((album) => {
                  const isSel = (active.id && active.id === album.id) || active.title === album.title
                  return (
                    <div
                      key={`r1-a-${album.id || album.title}`}
                      onClick={() => setSelectedAlbum(album)}
                      className={`album-card ${isSel ? 'active-selected' : ''} flex items-center gap-2.5 p-1.5 pr-3 bg-white border border-[#b8b6ad] rounded-[2px] cursor-pointer`}
                    >
                      <AlbumCover album={album} className="w-10 h-10" />
                      <div className="text-left font-mono">
                        <div className="text-[11.5px] font-bold text-on-surface leading-tight">{album.title}</div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          {album.artist} • {album.year}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex gap-2 shrink-0">
                {r1.map((album) => {
                  const isSel = (active.id && active.id === album.id) || active.title === album.title
                  return (
                    <div
                      key={`r1-b-${album.id || album.title}`}
                      onClick={() => setSelectedAlbum(album)}
                      className={`album-card ${isSel ? 'active-selected' : ''} flex items-center gap-2.5 p-1.5 pr-3 bg-white border border-[#b8b6ad] rounded-[2px] cursor-pointer`}
                    >
                      <AlbumCover album={album} className="w-10 h-10" />
                      <div className="text-left font-mono">
                        <div className="text-[11.5px] font-bold text-on-surface leading-tight">{album.title}</div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          {album.artist} • {album.year}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Rightward */}
          <div className="overflow-hidden">
            <div className="marquee-track-right gap-2 py-0.5">
              <div className="flex gap-2 shrink-0">
                {r2.map((album) => {
                  const isSel = (active.id && active.id === album.id) || active.title === album.title
                  return (
                    <div
                      key={`r2-a-${album.id || album.title}`}
                      onClick={() => setSelectedAlbum(album)}
                      className={`album-card ${isSel ? 'active-selected' : ''} flex items-center gap-2.5 p-1.5 pr-3 bg-white border border-[#b8b6ad] rounded-[2px] cursor-pointer`}
                    >
                      <AlbumCover album={album} className="w-10 h-10" />
                      <div className="text-left font-mono">
                        <div className="text-[11.5px] font-bold text-on-surface leading-tight">{album.title}</div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          {album.artist} • {album.year}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex gap-2 shrink-0">
                {r2.map((album) => {
                  const isSel = (active.id && active.id === album.id) || active.title === album.title
                  return (
                    <div
                      key={`r2-b-${album.id || album.title}`}
                      onClick={() => setSelectedAlbum(album)}
                      className={`album-card ${isSel ? 'active-selected' : ''} flex items-center gap-2.5 p-1.5 pr-3 bg-white border border-[#b8b6ad] rounded-[2px] cursor-pointer`}
                    >
                      <AlbumCover album={album} className="w-10 h-10" />
                      <div className="text-left font-mono">
                        <div className="text-[11.5px] font-bold text-on-surface leading-tight">{album.title}</div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          {album.artist} • {album.year}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Row 3: Leftward */}
          <div className="overflow-hidden">
            <div className="marquee-track-left gap-2 py-0.5">
              <div className="flex gap-2 shrink-0">
                {r3.map((album) => {
                  const isSel = (active.id && active.id === album.id) || active.title === album.title
                  return (
                    <div
                      key={`r3-a-${album.id || album.title}`}
                      onClick={() => setSelectedAlbum(album)}
                      className={`album-card ${isSel ? 'active-selected' : ''} flex items-center gap-2.5 p-1.5 pr-3 bg-white border border-[#b8b6ad] rounded-[2px] cursor-pointer`}
                    >
                      <AlbumCover album={album} className="w-10 h-10" />
                      <div className="text-left font-mono">
                        <div className="text-[11.5px] font-bold text-on-surface leading-tight">{album.title}</div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          {album.artist} • {album.year}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Duplicate for seamless loop */}
              <div className="flex gap-2 shrink-0">
                {r3.map((album) => {
                  const isSel = (active.id && active.id === album.id) || active.title === album.title
                  return (
                    <div
                      key={`r3-b-${album.id || album.title}`}
                      onClick={() => setSelectedAlbum(album)}
                      className={`album-card ${isSel ? 'active-selected' : ''} flex items-center gap-2.5 p-1.5 pr-3 bg-white border border-[#b8b6ad] rounded-[2px] cursor-pointer`}
                    >
                      <AlbumCover album={album} className="w-10 h-10" />
                      <div className="text-left font-mono">
                        <div className="text-[11.5px] font-bold text-on-surface leading-tight">{album.title}</div>
                        <div className="text-[10px] text-on-surface-variant truncate">
                          {album.artist} • {album.year}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Artists by Mood */}
        <div className="item-card !mb-0">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#e2e0d8]">
            <span className="text-xs font-semibold text-on-surface">Artists by Mood</span>
            <div className="flex flex-wrap gap-1" id="mood-tabs">
              <button
                className={`tab-btn text-[10px] py-0.5 px-2 ${activeMood === 'lock-in' ? 'active' : ''}`}
                onClick={() => setActiveMood('lock-in')}
              >
                Lock In
              </button>
              <button
                className={`tab-btn text-[10px] py-0.5 px-2 ${activeMood === 'study' ? 'active' : ''}`}
                onClick={() => setActiveMood('study')}
              >
                Study
              </button>
              <button
                className={`tab-btn text-[10px] py-0.5 px-2 ${activeMood === 'game' ? 'active' : ''}`}
                onClick={() => setActiveMood('game')}
              >
                Game
              </button>
              <button
                className={`tab-btn text-[10px] py-0.5 px-2 ${activeMood === 'drive' ? 'active' : ''}`}
                onClick={() => setActiveMood('drive')}
              >
                Night Drive
              </button>
            </div>
          </div>

          {activeMood === 'lock-in' && (
            <div className="text-xs space-y-1">
              <div className="font-mono text-terminal-prompt">
                &gt; Headliners: <b>Aphex Twin</b>, <b>Floating Points</b>
              </div>
              <div className="text-on-surface-variant">
                Polyrhythms and high-tempo modular synthesis for deep flow states. Also listening to: Four Tet, Jon Hopkins, Bicep, Overmono.
              </div>
            </div>
          )}

          {activeMood === 'study' && (
            <div className="text-xs space-y-1">
              <div className="font-mono text-terminal-prompt">
                &gt; Headliners: <b>Nils Frahm</b>, <b>Brian Eno</b>
              </div>
              <div className="text-on-surface-variant">
                Tactile felt piano, tape echoes, spatial acoustics. Also listening to: Harold Budd, Max Richter, Hania Rani.
              </div>
            </div>
          )}

          {activeMood === 'game' && (
            <div className="text-xs space-y-1">
              <div className="font-mono text-terminal-prompt">
                &gt; Headliners: <b>Disasterpeace</b>, <b>Mick Gordon</b>
              </div>
              <div className="text-on-surface-variant">
                Chiptune architecture and sub-octave drive. Also listening to: Lena Raine, Darren Korb, HEALTH.
              </div>
            </div>
          )}

          {activeMood === 'drive' && (
            <div className="text-xs space-y-1">
              <div className="font-mono text-terminal-prompt">
                &gt; Headliners: <b>Deftones</b>, <b>Kavinsky</b>
              </div>
              <div className="text-on-surface-variant">
                Low-end punch through the Tiguan’s subwoofer on coastal 101. Also listening to: Gunship, The Midnight, Chromatics.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
