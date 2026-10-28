import { useState, useEffect, useMemo } from 'react'
import Header from '../components/Header.jsx'
import { navigate } from '../router.js'
import { api } from '../api.js'

function ExperienceLogo({ exp, className = 'w-8 h-8' }) {
  const [hasError, setHasError] = useState(false)
  const logoUrl = exp.logo || exp.image || (exp.initial_bg && (exp.initial_bg.startsWith('http') || exp.initial_bg.startsWith('/uploads')) ? exp.initial_bg : null)

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={exp.company}
        referrerPolicy="no-referrer"
        className={`${className} rounded-sm object-contain bg-white border border-[#c8c6be] shrink-0 mt-0.5 p-0.5`}
        onError={() => setHasError(true)}
      />
    )
  }

  return (
    <div
      className={`${className} rounded-sm text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5`}
      style={{ backgroundColor: (exp.initial_bg && !exp.initial_bg.startsWith('http') && !exp.initial_bg.startsWith('/uploads')) ? exp.initial_bg : '#1b1c18' }}
    >
      {exp.initial || (exp.company ? exp.company[0].toUpperCase() : 'E')}
    </div>
  )
}

export default function Home() {
  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_DATA__) {
      return window.__INITIAL_DATA__
    }
    return null
  })
  const [loading, setLoading] = useState(!data)

  useEffect(() => {
    document.title = 'Khairi Nugroho'
    // Always fetch fresh data on mount so admin updates reflect immediately
    api.portfolioFull()
      .then((res) => {
        setData(res)
        if (typeof window !== 'undefined') {
          window.__INITIAL_DATA__ = res
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  // Skeleton Loading when database is initializing
  if (loading) {
    return (
      <div className="max-w-[760px] mx-auto">
        <Header currentPath="/" subtitle="quantitative researcher • batam, id" />

        {/* whoami Skeleton */}
        <div className="cmd-box">
          <div className="cmd-header">whoami // loading database...</div>
          <div className="flex flex-col-reverse md:flex-row gap-5 items-start">
            <div className="flex-1 space-y-2.5 w-full">
              <div className="skeleton skeleton-text w-full"></div>
              <div className="skeleton skeleton-text w-11/12"></div>
              <div className="skeleton skeleton-text w-4/5"></div>
              <div className="skeleton skeleton-text w-full mt-3"></div>
              <div className="skeleton skeleton-text w-3/4"></div>
              <div className="skeleton skeleton-text w-4/6 mt-2"></div>
              <div className="pt-2 flex flex-wrap gap-2">
                <div className="skeleton w-28 h-6 rounded-sm"></div>
                <div className="skeleton w-44 h-6 rounded-sm"></div>
              </div>
            </div>

            <div className="w-full sm:w-44 md:w-48 shrink-0">
              <div className="border border-[#75736c] p-1 bg-white">
                <div className="skeleton w-full aspect-[4/5] rounded-[1px]"></div>
              </div>
              <div className="skeleton h-3 w-20 mx-auto mt-1 rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Experience Skeleton */}
        <div className="cmd-box">
          <div className="cmd-header">experience // loading database...</div>
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="item-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    <div className="skeleton w-8 h-8 rounded-sm shrink-0"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton skeleton-text w-32"></div>
                      <div className="skeleton skeleton-text w-24"></div>
                    </div>
                  </div>
                  <div className="skeleton w-20 h-4 rounded-sm shrink-0"></div>
                </div>
                <div className="skeleton skeleton-text w-full mt-2"></div>
                <div className="skeleton skeleton-text w-4/5"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Skeleton */}
        <div className="cmd-box">
          <div className="cmd-header">projects // loading database...</div>
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="item-card">
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="skeleton w-full sm:w-28 sm:h-20 rounded-sm shrink-0"></div>
                  <div className="flex-1 w-full space-y-1.5">
                    <div className="skeleton skeleton-text w-40"></div>
                    <div className="skeleton skeleton-text w-full"></div>
                    <div className="skeleton skeleton-text w-3/4"></div>
                    <div className="skeleton w-24 h-5 mt-2 rounded-sm"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dedicated Pages Skeleton */}
        <div className="cmd-box">
          <div className="cmd-header">motto // loading database...</div>
          <div className="space-y-2.5">
            <div className="skeleton skeleton-text w-1/4"></div>
            <div className="skeleton skeleton-text w-3/4 h-5"></div>
            <div className="pt-2">
              <div className="skeleton skeleton-text w-36 mb-1.5"></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-7 rounded-[2px]"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const profile = data?.profile || {
    name: 'Khairi Nugroho',
    hero: 'batam, id',
    headline: 'batam, id',
    photo: 'https://jnttmmhomgtpnkpymhfl.supabase.co/storage/v1/object/public/uploads/khairinugroho.jpeg',
    photo_label: 'khairinugroho.jpeg',
    linkedin_url: 'https://linkedin.com/in/khairinugroho',
    github_url: 'https://github.com/khairinugroho',
    instagram_url: 'https://instagram.com/khairinugroho',
    spotify_url: 'https://open.spotify.com/user/j45vdoajmtkvdq33tunybf9o6?si=3163aa858f2341ab',
    email: 'khairinugroho@gmail.com',
    motto: 'Precision is quiet; restraint speaks louder than ornamentation.'
  }

  const currentHero = profile.hero || profile.headline || 'batam, id'

  const customBio = [profile.who_am_i, profile.what_i_did, profile.school].filter(Boolean)
  const bioParagraphs = customBio.length > 0
    ? customBio
    : (Array.isArray(data?.bio?.paragraphs) && data.bio.paragraphs.length > 0)
      ? data.bio.paragraphs
      : (data?.bio?.content
        ? data.bio.content.split('\n\n').map((s) => s.trim()).filter(Boolean)
        : [data?.bio?.paragraph_1, data?.bio?.paragraph_2].filter(Boolean))

  const experiences = Array.isArray(data?.experiences) ? data.experiences : []
  const projects = Array.isArray(data?.projects) ? data.projects : []

  const defaultSkills = [
    'Quantitative Research & Macro Strategy',
    'Financial Modeling & Quant Trading',
    'Advanced Microsoft Excel & Data Operations',
    'TypeScript, React, Node.js & Systems Architecture'
  ]

  const rawSkills = data?.skills || profile?.skills || defaultSkills
  const skillsList = useMemo(() => {
    let source = rawSkills
    if (typeof source === 'string') {
      try {
        const parsed = JSON.parse(source)
        if (Array.isArray(parsed)) source = parsed
      } catch {
        if (source.includes('\n')) {
          source = source.split('\n')
        } else if (source.includes(';')) {
          source = source.split(';')
        }
      }
    }
    if (Array.isArray(source)) {
      return source
        .map((item) => {
          if (!item) return ''
          if (typeof item === 'object') return item.name || item.title || item.label || ''
          return String(item)
        })
        .map((s) => s.trim().replace(/^[•\-\*]\s*/, ''))
        .filter(Boolean)
    }
    if (typeof source === 'string' && source.trim()) {
      return [source.trim().replace(/^[•\-\*]\s*/, '')]
    }
    return defaultSkills
  }, [data?.skills, profile?.skills])

  return (
    <div className="max-w-[760px] mx-auto">
      {/* Top Header bar */}
      <Header currentPath="/" subtitle={currentHero} profile={profile} />

      {/* whoami */}
      <div className="cmd-box" id="whoami">
        <div className="cmd-header">C:\users\whoami</div>
        <div className="flex flex-col-reverse md:flex-row gap-5 items-start">
          <div className="flex-1 space-y-2.5 text-on-surface">
            {bioParagraphs.map((p, idx) => (
              <p
                key={idx}
                className={idx === 0 ? '' : 'text-on-surface-variant'}
              >
                {p}
              </p>
            ))}

            {/* skills point */}
            {skillsList.length > 0 && (
              <div className="pt-1 pb-0.5 space-y-1 text-xs font-mono text-on-surface-variant">
                {skillsList.map((skill, idx) => (
                  <div key={idx} className="flex items-baseline gap-2">
                    <span className="text-terminal-prompt font-bold select-none">•</span>
                    <span>
                      {idx === 0 && !skill.toLowerCase().startsWith('skill') ? (
                        <span className="text-on-surface font-semibold">skills: </span>
                      ) : null}
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs text-terminal-prompt font-mono">
              <a
                className="link-badge font-mono text-[11px] font-medium !bg-[#1b1c18] !text-white !border-[#1b1c18] hover:!bg-[#2a2b27]"
                download="khairinugroho_resume.pdf"
                href={profile.resume_url && profile.resume_url !== '#' ? profile.resume_url : '#'}
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
                <span>resume.pdf ↓</span>
              </a>
              <span>
                feel free to ping me on{' '}
                <a
                  className="text-on-surface underline hover:text-black font-semibold"
                  href={profile.linkedin_url || 'https://linkedin.com/khairinugroho'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>{' '}
                or{' '}
                <a
                  className="text-on-surface underline hover:text-black font-semibold"
                  href={profile.github_url || 'https://github.com/khairizakiy'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </span>
            </div>
          </div>

          <div className="w-full sm:w-44 md:w-48 shrink-0">
            <div className="border border-[#75736c] p-1 bg-white">
              <img
                alt={profile.name}
                className="w-full aspect-[4/5] object-cover grayscale-[15%] hover:grayscale-0 transition-all duration-300"
                src={profile.photo || '/khairinugroho.jpeg'}
                onError={(e) => {
                  e.currentTarget.src = '/khairinugroho.jpeg'
                }}
              />
            </div>
            <div className="text-[10px] font-mono text-center text-terminal-prompt mt-1">
              {profile.photo_label || 'khairinugroho.jpeg'}
            </div>
          </div>
        </div>
      </div>

      {/* experience (conditionally rendered only if entries exist) */}
      {experiences.length > 0 && (
        <div className="cmd-box" id="experience">
          <div className="cmd-header">C:\users\experience</div>
          <div className="text-xs text-on-surface-variant font-mono mb-3">
            the more professional-looking part of this
          </div>
          <div className="space-y-2.5">
            {experiences.map((exp) => (
              <div key={exp.id} className="item-card relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <ExperienceLogo exp={exp} />
                    <div>
                      <div className="font-semibold text-[13.5px] text-on-surface">
                        {exp.company}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-[#2a2b27] font-medium">{exp.role}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#f0eee8] border border-[#a8a69e] rounded text-[#2b2b28] uppercase">
                          {exp.job_type || (Array.isArray(exp.badges) && typeof exp.badges[0] === 'string' ? exp.badges[0] : 'Full-time')}
                        </span>
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        {exp.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs font-mono text-on-surface-variant shrink-0">
                    {exp.period}
                    {exp.star && (
                      <div className="text-star-gold text-xs leading-none mt-1">★</div>
                    )}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                    {exp.description}
                  </p>
                )}
                {exp.badges && exp.badges.filter(b => typeof b === 'object' && b && b.label).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-[#ebe8e0]">
                    {exp.badges.filter(b => typeof b === 'object' && b && b.label).map((badge, bIdx) => (
                      <a
                        key={bIdx}
                        className="link-badge font-mono text-[10px]"
                        href={badge.url || '#'}
                      >
                        {badge.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* projects (conditionally rendered only if entries exist) */}
      {projects.length > 0 && (
        <div className="cmd-box" id="projects">
          <div className="cmd-header">C:\users\projects</div>
          <div className="text-xs text-on-surface-variant font-mono mb-3">
            a few things I want people to actually click on
          </div>
          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div key={proj.id} className="item-card">
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  {proj.image && (
                    <img
                      alt={proj.title}
                      className="w-full sm:w-28 sm:h-20 object-cover border border-[#c8c6be] rounded-sm shrink-0"
                      src={proj.image}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="f```ont-bold text-[13.5px] text-on-surface">
                        {proj.title}
                      </span>
                      {proj.star ? (
                        <span className="text-star-gold text-xs leading-none">★</span>
                      ) : proj.stars_count ? (
                        <span className="text-xs font-mono text-terminal-prompt">
                          {proj.stars_count}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {proj.links && proj.links.length > 0 ? (
                        proj.links.map((lnk, lIdx) => (
                          <a
                            key={lIdx}
                            className="link-badge"
                            href={lnk.url || '#'}
                            target={lnk.url?.startsWith('http') ? '_blank' : undefined}
                            rel={lnk.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {lnk.label}
                          </a>
                        ))
                      ) : (
                        <a className="link-badge" href={proj.url || '#'}>
                          View Project
                        </a>
                      )}
                      {proj.tags && proj.tags.length > 0 && (
                        <span className="text-[10px] font-mono text-terminal-prompt ml-1">
                          {proj.tags.join(' • ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* motto & page links */}
      <div className="cmd-box">
        <div className="cmd-header">C:\users\motto</div>
        <div className="space-y-2.5">
          <p className="text-xs text-on-surface-variant font-mono">My life motto</p>
          <blockquote className="text-[14px] italic text-on-surface border-l-2 border-[#75736c] pl-3 py-0.5">
            “{profile.motto || 'if you like music you like house, you just dont realize it yet'}”
          </blockquote>
          <div className="pt-2">
            <div className="text-[11px] font-mono text-terminal-prompt mb-1.5 flex items-center justify-between">
              <span>&gt; explore dedicated pages:</span>
              <span className="text-[10px] text-on-surface-variant">click to view →</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                className="tab-btn hover:bg-[#1b1c18] hover:text-white transition-all"
                onClick={() => navigate('/music')}
              >
                Music ↗
              </button>
              <button
                className="tab-btn hover:bg-[#1b1c18] hover:text-white transition-all"
                onClick={() => navigate('/tiguan')}
              >
                My Tiguan ↗
              </button>
              <button
                className="tab-btn hover:bg-[#1b1c18] hover:text-white transition-all"
                onClick={() => navigate('/friends')}
              >
                Friends ↗
              </button>
              <button
                className="tab-btn hover:bg-[#1b1c18] hover:text-white transition-all"
                onClick={() => navigate('/cat')}
              >
                My Cat ↗
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* links */}
      <div className="cmd-box" id="links">
        <div className="cmd-header">C:\users\links</div>
        <div className="text-xs text-on-surface mb-2 font-mono text-terminal-prompt">links!</div>
        <ul className="space-y-1 text-xs pl-2 font-mono">
          <li className="flex items-center gap-2">
            <span className="text-terminal-prompt">•</span>
            <a
              className="text-accent-link underline hover:text-[#005582]"
              href={`mailto:${profile.email || 'khairizakiyn@gmail.com'}?subject=${encodeURIComponent("Let's Connect")}&body=${encodeURIComponent("Hey Nugroho! ...")}`}
            >
              Gmail
            </a>
            <span className="text-on-surface-variant font-sans text-[11px]">
              ({profile.email || 'khairizakiyn@gmail.com'})
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-terminal-prompt">•</span>
            <a
              className="text-accent-link underline hover:text-[#005582]"
              href={profile.github_url || 'https://github.com/khairizakiy'}
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            <span className="text-on-surface-variant font-sans text-[11px]">
              (open source &amp; experiments)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-terminal-prompt">•</span>
            <a
              className="text-accent-link underline hover:text-[#005582]"
              href={profile.linkedin_url || 'https://linkedin.com/khairinugroho'}
              rel="noopener noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
            <span className="text-on-surface-variant font-sans text-[11px]">
              (professional network)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-terminal-prompt">•</span>
            <a
              className="text-accent-link underline hover:text-[#005582]"
              href={profile.instagram_url || 'https://instagram.com/zkiyngrh'}
              rel="noopener noreferrer"
              target="_blank"
            >
              Instagram
            </a>
            <span className="text-on-surface-variant font-sans text-[11px]">
              (cars, film grain, and life)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-terminal-prompt">•</span>
            <a
              className="text-accent-link underline hover:text-[#005582]"
              href={profile.spotify_url || 'https://open.spotify.com/user/j45vdoajmtkvdq33tunybf9o6?si=3163aa858f2341ab'}
              rel="noopener noreferrer"
              target="_blank"
            >
              Spotify
            </a>
            <span className="text-on-surface-variant font-sans text-[11px]">
              (public playlists)
            </span>
          </li>
        </ul>
      </div>

    </div>
  )
}
