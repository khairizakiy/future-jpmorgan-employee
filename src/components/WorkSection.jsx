import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MetallicKSculpture from './MetallicKSculpture.jsx'
import InlineCaseStudy from './InlineCaseStudy.jsx'
import { api } from '../api.js'

export default function WorkSection({ onNavigate }) {
  const [expandedId, setExpandedId] = useState(null)
  const [dbProjects, setDbProjects] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    api
      .projects('published')
      .then((items) => {
        if (Array.isArray(items)) {
          setDbProjects(items)
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoaded(true)
      })
  }, [])

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const displayedStudies = dbProjects.map((p, idx) => ({
    id: `project-${p.id}`,
    dbId: p.id,
    raw: p,
    numStr: String(idx + 1).padStart(2, '0'),
    title: p.title,
    category: (p.category || 'PROJECT').toUpperCase(),
    year: new Date(p.created_at || Date.now()).getFullYear().toString(),
    description: p.description || 'Verified project and operations documentation.',
    tags: [
      (p.category || 'PROJECT').toUpperCase(),
      `${Math.min(100, Math.max(20, (p.progress || 3) * 20))}% COMPLETE`,
      p.url ? 'LIVE' : 'ARCHIVE'
    ].filter(Boolean),
    url: p.url,
    image: p.image,
    slots: p.image
      ? [{ label: '[SLOT 01 // 01]', img: p.image, meta: 'PROJECT SHOWCASE' }]
      : [
          { label: '[SLOT 01 // 04]', img: '/uploads/placeholder.svg', meta: 'SYSTEM LOG' },
          { label: '[SLOT 02 // 04]', img: '/uploads/placeholder.svg', meta: 'SPECIFICATION' },
          { label: '[SLOT 03 // 04]', img: '/uploads/placeholder.svg', meta: 'METRICS' },
          { label: '[SLOT 04 // 04]', img: '/uploads/placeholder.svg', meta: 'ARCHITECTURE' }
        ]
  }))

  const todayDD = String(new Date().getDate()).padStart(2, '0')

  return (
    <section id="work" className="kjoy-work-pinned" data-od-id="work-section">
      {/* 1px hairline divider above Featured Work */}
      <div className="kjoy-work-line" style={{ marginBottom: '20px' }} />

      {/* Top Header Row */}
      <div className="kjoy-work-pin-header">
        <div className="kjoy-work-pin-header-left">
          <span>FEATURED WORK</span>
        </div>
        <div className="kjoy-work-pin-header-right mono-micro">
          <span>{todayDD} - Today</span>
        </div>
      </div>

      {/* 1px hairline divider in black */}
      <div className="kjoy-work-line" />

      {/* Vertical list of projects: each card can stretch downwards naturally */}
      <div className="kjoy-work-list">
        {!isLoaded ? (
          <div className="kjoy-work-skeleton-stack" aria-label="Loading projects from database">
            {[1, 2].map((n) => (
              <article key={`work-skeleton-${n}`} className="kjoy-work-card kjoy-work-skeleton-card">
                {/* 1. Card Top Row Skeleton */}
                <div
                  className="kjoy-pinned-card-top"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'clamp(14px, 1.8vh, 20px) 0'
                  }}
                >
                  <div
                    className="kjoy-skeleton kjoy-skeleton-light"
                    style={{ width: n === 1 ? '45%' : '38%', height: '32px' }}
                  />
                  <div
                    className="kjoy-skeleton kjoy-skeleton-light"
                    style={{ width: '84px', height: '16px' }}
                  />
                </div>

                {/* 1px hairline divider */}
                <div className="kjoy-work-line" />

                {/* 2. Middle Frame Area Skeleton: 16/9 Frame */}
                <div
                  className="kjoy-pinned-frames-row"
                  style={{ gridTemplateColumns: '1fr', width: '100%', padding: 'clamp(16px, 2vh, 24px) 0' }}
                >
                  <div
                    className="kjoy-pinned-frame kjoy-skeleton kjoy-skeleton-light"
                    style={{
                      width: '100%',
                      aspectRatio: '16 / 9',
                      maxHeight: 'clamp(380px, 52vh, 580px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="mono-micro" style={{ opacity: 0.35, letterSpacing: '0.2em' }}>
                      SYNCHRONIZING WITH DATABASE...
                    </span>
                  </div>
                </div>

                {/* 1px hairline divider */}
                <div className="kjoy-work-line" />

                {/* 3. Bottom Row Skeleton */}
                <div
                  className="kjoy-pinned-card-bottom"
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px 0' }}
                >
                  <div
                    className="kjoy-skeleton kjoy-skeleton-light"
                    style={{ width: '75%', height: '16px' }}
                  />
                  <div
                    className="kjoy-skeleton kjoy-skeleton-light"
                    style={{ width: '48%', height: '16px' }}
                  />
                  <div
                    className="kjoy-skeleton kjoy-skeleton-light"
                    style={{ width: '150px', height: '24px', marginTop: '6px' }}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          displayedStudies.map((study) => {
          const isExpanded = expandedId === study.id
          return (
            <article key={study.id} id={study.id} className="kjoy-work-card">
              {/* 1. Card Top Row */}
              <div className="kjoy-pinned-card-top">
                <div
                  className="kjoy-card-title-group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(study.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <h2 className="kjoy-case-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <span>{study.title}</span>
                      <span style={{ fontSize: '18px', opacity: 0.7 }}>
                        {isExpanded ? '↑' : '↗'}
                      </span>
                    </h2>
                  </button>

                  {/* Dynamic Database Category / Label Badge & Client */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      className="mono-micro"
                      style={{
                        padding: '4px 10px',
                        border: '1px solid #7A0E22',
                        color: '#7A0E22',
                        letterSpacing: '0.12em',
                        fontSize: '10px',
                        fontWeight: 600,
                        background: 'rgba(122, 14, 34, 0.05)'
                      }}
                    >
                      [{study.category}]
                    </span>
                    {study.raw?.client && (
                      <span
                        className="mono-micro"
                        style={{
                          padding: '4px 8px',
                          border: '1px solid rgba(8, 7, 7, 0.2)',
                          color: '#080707',
                          fontSize: '10px',
                          opacity: 0.75
                        }}
                      >
                        {study.raw.client}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 1px hairline divider */}
              <div className="kjoy-work-line" />

              {/* 2. Card Middle Area: Picture Showcase (Width 100% Height 100%, Unclickable, Clean, No Overlays) */}
              <div
                className="kjoy-pinned-frames-row"
                style={{ gridTemplateColumns: '1fr', width: '100%', padding: 'clamp(16px, 2vh, 24px) 0' }}
              >
                <div
                  className="kjoy-pinned-frame"
                  style={{
                    width: '100%',
                    height: '100%',
                    cursor: 'default',
                    pointerEvents: 'none'
                  }}
                >
                  <img
                    src={study.image || (study.slots && study.slots[0]?.img) || '/uploads/placeholder.svg'}
                    alt={study.title}
                    className="kjoy-pinned-frame-bg"
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: 1
                    }}
                  />
                </div>
              </div>

              {/* 1px hairline divider */}
              <div className="kjoy-work-line" />

              {/* 3. Card Bottom Row */}
              <div className="kjoy-pinned-card-bottom">
                <p className="kjoy-case-desc body-sans">{study.description}</p>

                <button
                  type="button"
                  onClick={() => toggleExpand(study.id)}
                  className="kjoy-case-study-textlink"
                >
                  <span>{isExpanded ? 'Collapse Case Study' : 'Read Full Case Study'}</span>
                </button>
              </div>

              {/* 4. IN-PAGE EXPANSION (Stretches the card downwards into natural page flow) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    className="kjoy-inline-case-study"
                  >
                    <InlineCaseStudy
                      project={study.raw || study}
                      onClose={() => setExpandedId(null)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
          )
        }))}
      </div>

      {/* If no projects exist: Monumental Hero-style COMING SOON centerpiece card */}
      {isLoaded && displayedStudies.length === 0 && (
        <article className="kjoy-work-card kjoy-work-coming-soon-card">
          <div className="kjoy-pinned-card-top">
            <div className="kjoy-card-title-group">
              <h2 className="kjoy-case-title"></h2>
            </div>
          </div>

          {/* Hero-style Centerpiece Stage: Monumental Watermark + Interactive 3D Metallic Sculpture */}
          <div className="kjoy-hero-center kjoy-work-coming-soon-stage">
            <div className="kjoy-hero-watermark" aria-hidden="true">
              <span style={{ fontSize: 'clamp(64px, 11vw, 150px)', letterSpacing: '0.04em', color: 'rgba(8, 7, 7, 0.05)', whiteSpace: 'nowrap' }}>
                COMING SOON
              </span>
            </div>
            <div className="kjoy-hero-sculpture-stage" data-cursor-label="DRAG 3D">
              <MetallicKSculpture variant="hero" />
            </div>
          </div>

          <div className="kjoy-pinned-card-bottom">
            <p className="kjoy-case-desc body-sans">
              Currently developing new projects and operations tools.
            </p>
            <div className="kjoy-case-cta-wrap">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('contact')}
                className="kjoy-case-study-textlink"
              >
                <span>Reach Out ↗</span>
              </button>
            </div>
          </div>
        </article>
      )}

      {/* 1px horizontal line */}
      <div className="kjoy-work-line" />

      {/* Bottom Pinned Telemetry & Scrubber Rail */}
      <div className="kjoy-work-pin-footer mono-micro">
        <div className="kjoy-footer-left">
        </div>

        <div className="kjoy-footer-rail-wrap">
          <div className="kjoy-footer-rail">
          </div>
        </div>

        <div className="kjoy-footer-right">
          <span>2026©</span>
        </div>
      </div>
    </section>
  )
}
