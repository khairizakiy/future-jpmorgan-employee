import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../api.js'

function formatExternalUrl(raw) {
  if (!raw || typeof raw !== 'string') return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''

  // Full protocol (http, https, ftp) or special schemes (mailto, tel, callto)
  if (/^(https?:|\/\/|mailto:|tel:|callto:)/i.test(trimmed)) {
    return trimmed
  }

  // Data or local file protocol
  if (trimmed.startsWith('data:') || trimmed.startsWith('file:')) {
    return trimmed
  }

  // Paths starting with uploads/ or /
  if (trimmed.startsWith('uploads/')) {
    return `/${trimmed}`
  }
  if (trimmed.startsWith('/') || trimmed.startsWith('./')) {
    return trimmed
  }

  // If it's a standalone file with an extension (e.g. "certificate.pdf", "microecon.png", "doc.docx")
  if (/\.(pdf|png|jpe?g|webp|svg|gif|docx?|txt)$/i.test(trimmed) && !trimmed.includes('/')) {
    return `/uploads/${trimmed}`
  }

  // Otherwise it's an external web URL without scheme (e.g. "wikipedia.com", "coursera.org/...")
  return `https://${trimmed}`
}

const ABOUT_LANGUAGES = [
  'ABOUT',
  'TENTANG',
  'SOBRE',
  'À PROPOS',
  'ÜBER MICH',
  'CHI SONO',
  'OVER MIJ',
  'HAKKIMDA',
  'OM MIG',
  'O MNIE',
  'TUNGKOL',
  'KUHUSU',
  'GIỚI THIỆU',
  'ОБО МНЕ',
  'ΣΧΕΤΙΚΑ',
  'DESPRE',
  'O MNĚ',
  'RÓLAM',
  'TIETOJA',
  'PAR MANI',
  'APIE MANE',
  'MINUST',
  'UM MIG',
  'PRI MI',
  'NGOKWAM',
  'NIPA MI',
  'GAME DA',
  'MŌKU',
  'プロフィール',
  '프로필 소개',
  '关于我们',
  'نبذة عني',
  'मेरे बारे में',
  'เกี่ยวกับ'
]

export default function AboutSection() {
  const [langIndex, setLangIndex] = useState(0)
  const [charCount, setCharCount] = useState(ABOUT_LANGUAGES[0].length)
  const [isDeleting, setIsDeleting] = useState(false)
  const [photo, setPhoto] = useState('/uploads/khairinugroho.jpeg')
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const [bioSubtitle, setBioSubtitle] = useState('1 YEAR IN WEB DEVELOPMENT')
  const [bioParagraphs, setBioParagraphs] = useState([
    "I'm Khairi Nugroho, a vocational high school student driven by precision, discipline, and execution. Passionate about Formula 1 strategy, macroeconomics, finance, and market trading.",
    "Currently available as a dependable everyday operator and virtual employee—handling Microsoft Excel data, Word documentation, research summarizing, and Personal Assistant operations."
  ])
  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [awards, setAwards] = useState([])
  const [awardsLoading, setAwardsLoading] = useState(true)
  const [expandedServiceId, setExpandedServiceId] = useState(null)
  const [expandedAwardId, setExpandedAwardId] = useState(null)

  const toggleService = (id) => {
    setExpandedServiceId((prev) => (prev === id ? null : id))
  }

  const toggleAward = (id) => {
    setExpandedAwardId((prev) => (prev === id ? null : id))
  }

  useEffect(() => {
    api
      .profile()
      .then((p) => {
        if (p?.photo) setPhoto(p.photo)
      })
      .catch(() => {})

    api
      .bio()
      .then((b) => {
        if (b) {
          if (b.subtitle) setBioSubtitle(b.subtitle)
          if (b.paragraph_1 || b.paragraph_2) {
            setBioParagraphs([b.paragraph_1, b.paragraph_2].filter(Boolean))
          } else if (Array.isArray(b.paragraphs) && b.paragraphs.length > 0) {
            setBioParagraphs(b.paragraphs)
          } else if (b.content) {
            setBioParagraphs(b.content.split(/\r?\n\r?\n/).map((p) => p.trim()).filter(Boolean))
          }
        }
      })
      .catch(() => {})

    api
      .services()
      .then((items) => {
        if (Array.isArray(items)) {
          setServices(items)
        }
      })
      .catch(() => {})
      .finally(() => {
        setServicesLoading(false)
      })

    api
      .awards()
      .then((items) => {
        if (Array.isArray(items)) {
          setAwards(items)
        }
      })
      .catch(() => {})
      .finally(() => {
        setAwardsLoading(false)
      })
  }, [])

  const currentWord = ABOUT_LANGUAGES[langIndex] || 'ABOUT'
  const chars = Array.from(currentWord)

  useEffect(() => {
    const fullLen = chars.length
    let delay = isDeleting ? 65 : 105

    if (!isDeleting && charCount === fullLen) {
      delay = 950
    } else if (isDeleting && charCount === 0) {
      delay = 180
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (charCount < fullLen) {
          setCharCount((c) => c + 1)
        } else {
          setIsDeleting(true)
        }
      } else {
        if (charCount > 0) {
          setCharCount((c) => c - 1)
        } else {
          setIsDeleting(false)
          setLangIndex((i) => (i + 1) % ABOUT_LANGUAGES.length)
        }
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [charCount, isDeleting, chars.length])

  const visibleText = chars.slice(0, charCount).join('')
  const computedTextLength =
    charCount > 0 && chars.length > 0 ? Math.round((1000 * charCount) / chars.length) : undefined

  return (
    <section id="aboutme" className="kjoy-about" data-od-id="about-section">
      {/* Giant Edge-to-Edge Header: ABOUT animated typewriter across world languages */}
      <div className="kjoy-about-giant-wrap">
        <svg
          className="kjoy-about-svg"
          viewBox="0 0 1000 406"
          preserveAspectRatio="none"
          role="heading"
          aria-level="2"
          aria-label={currentWord}
        >
          {charCount > 0 && (
            <text
              x="0"
              y="330"
              textAnchor="start"
              textLength={computedTextLength}
              lengthAdjust="spacingAndGlyphs"
              className="kjoy-about-svg-text"
            >
              {visibleText}
            </text>
          )}
        </svg>
      </div>

      {/* Divider 1 (1px horizontal line) */}
      <div className="kjoy-line-burgundy" data-divider="1" />

      {/* Row 1 — BIO (12-Column Grid, padding: 40px 0) */}
      <div className="kjoy-about-grid kjoy-about-row-bio">
        <div className="kjoy-col-1-2 kjoy-about-label">BIO</div>
        <div className="kjoy-col-3-6 kjoy-about-subtitle">{bioSubtitle}</div>
        <div className="kjoy-col-7-12 kjoy-bio-paragraphs body-sans">
          {bioParagraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </div>

      {/* Portrait of KHAIRI NUGROHO (Picture + Text) */}
      <div className="kjoy-about-portrait-container">
        <div className="kjoy-portrait-card">
          <div className="kjoy-portrait-name-top">
            KHAIRI
          </div>
          <div className="kjoy-portrait-frame">
            {!photoLoaded && (
              <div className="kjoy-skeleton kjoy-skeleton-dark kjoy-portrait-skeleton" aria-label="Loading picture">
                <span className="mono-micro" style={{ opacity: 0.45, letterSpacing: '0.2em' }}>
                  LOADING PICTURE...
                </span>
              </div>
            )}
            <img
              src={photo || '/uploads/khairinugroho.jpeg'}
              alt="Khairi Nugroho"
              className="kjoy-portrait-img"
              style={{
                opacity: photoLoaded ? 1 : 0,
                transition: 'opacity 0.4s ease-in-out'
              }}
              onLoad={() => setPhotoLoaded(true)}
              loading="lazy"
            />
          </div>
          <div className="kjoy-portrait-name-bottom">
            NUGROHO
          </div>
        </div>
      </div>

      {/* Divider 3 (1px horizontal line) */}
      <div className="kjoy-line-burgundy" data-divider="3" />

      {/* Row 2 — SERVICES (12-Column Grid, padding: 40px 0) */}
      {(servicesLoading || services.length > 0) && (
        <>
          <div className="kjoy-about-grid kjoy-about-row-services">
            <div className="kjoy-col-1-6 kjoy-about-label">SERVICES</div>
            <div className="kjoy-col-7-12 kjoy-services-stack">
              {servicesLoading ? (
                <div className="kjoy-skeleton-stack" aria-label="Loading services from database">
                  {[1, 2, 3].map((n, idx) => (
                    <div
                      key={`srv-skel-${n}`}
                      className={`kjoy-skeleton-row ${idx > 0 ? 'has-sub-divider' : ''}`}
                    >
                      <div
                        className="kjoy-skeleton kjoy-skeleton-dark kjoy-skeleton-bar"
                        style={{ width: idx === 0 ? '58%' : idx === 1 ? '72%' : '48%' }}
                      />
                      <div
                        className="kjoy-skeleton kjoy-skeleton-dark kjoy-skeleton-icon"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                services.map((item, index) => {
                  const id = item.id || `srv-${index}`
                  const title = typeof item === 'string' ? item : (item.title || item.name || '')
                  const description = typeof item === 'object' && item.description ? item.description : ''
                  const link = typeof item === 'object' && item.link ? item.link : null
                  const isExpanded = expandedServiceId === id

                  return (
                    <div
                      key={id}
                      className={`kjoy-about-expandable-item ${index > 0 ? 'has-sub-divider' : ''} ${isExpanded ? 'is-expanded' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleService(id)}
                        className="kjoy-about-item-btn"
                        aria-expanded={isExpanded}
                      >
                        <span className="kjoy-service-left">
                          <span>{title}</span>
                        </span>
                        <span className="kjoy-service-arrow" aria-hidden="true">
                          {isExpanded ? '↑' : '↗'}
                        </span>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="kjoy-about-item-desc-wrap">
                              <p className="kjoy-about-item-desc body-sans">
                                {description || 'Focused execution, dependable operations, and quantitative workflow delivery.'}
                              </p>
                              {link && (
                                <div style={{ marginTop: '4px' }}>
                                  <a
                                    href={formatExternalUrl(link)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="kjoy-case-study-textlink"
                                    style={{ fontSize: '13px', color: 'var(--bg-white)', borderColor: 'rgba(250, 248, 245, 0.4)' }}
                                  >
                                    <span>Visit Link ↗</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              )}
            </div>
          </div>
          <div className="kjoy-line-burgundy" data-divider="services-div" />
        </>
      )}

      {/* Row 3 — AWARDS & COURSES (12-Column Grid, padding: 40px 0) */}
      {(awardsLoading || awards.length > 0) && (
        <>
          <div className="kjoy-about-grid kjoy-about-row-services">
            <div className="kjoy-col-1-6 kjoy-about-label">AWARDS &amp; COURSES</div>
            <div className="kjoy-col-7-12 kjoy-services-stack">
              {awardsLoading ? (
                <div className="kjoy-skeleton-stack" aria-label="Loading awards from database">
                  {[1, 2].map((n, idx) => (
                    <div
                      key={`awd-skel-${n}`}
                      className={`kjoy-skeleton-row ${idx > 0 ? 'has-sub-divider' : ''}`}
                    >
                      <div
                        className="kjoy-skeleton kjoy-skeleton-dark kjoy-skeleton-bar"
                        style={{ width: idx === 0 ? '66%' : '52%' }}
                      />
                      <div
                        className="kjoy-skeleton kjoy-skeleton-dark kjoy-skeleton-icon"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                awards.map((item, index) => {
                  const id = item.id || `awd-${index}`
                  const title = typeof item === 'string' ? item : (item.title || item.name || '')
                  const description = typeof item === 'object' && item.description ? item.description : ''
                  const link = typeof item === 'object' && item.link ? item.link : null
                  const isExpanded = expandedAwardId === id

                  return (
                    <div
                      key={id}
                      className={`kjoy-about-expandable-item ${index > 0 ? 'has-sub-divider' : ''} ${isExpanded ? 'is-expanded' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleAward(id)}
                        className="kjoy-about-item-btn"
                        aria-expanded={isExpanded}
                      >
                        <span className="kjoy-service-left">
                          <span>{title}</span>
                        </span>
                        <span className="kjoy-service-arrow" aria-hidden="true">
                          {isExpanded ? '↑' : '↗'}
                        </span>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="kjoy-about-item-desc-wrap">
                              <p className="kjoy-about-item-desc body-sans">
                                {description || 'Fundamental analysis, economic framework modeling, and core market discipline.'}
                              </p>
                              {link && (
                                <div style={{ marginTop: '4px' }}>
                                  <a
                                    href={formatExternalUrl(link)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="kjoy-case-study-textlink"
                                    style={{ fontSize: '13px', color: 'var(--bg-white)', borderColor: 'rgba(250, 248, 245, 0.4)' }}
                                  >
                                    <span>View Credential ↗</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              )}
            </div>
          </div>
          <div className="kjoy-line-burgundy" data-divider="awards-div" />
        </>
      )}

      {/* Final Divider */}
      <div className="kjoy-line-burgundy" data-divider="final" />
    </section>
  )
}
