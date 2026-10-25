import { useMemo } from 'react'

export default function InlineCaseStudy({ project, onClose }) {
  if (!project) return null

  const clientText = project.client || ''
  const briefText = project.brief || project.description || ''
  const engagementText = project.engagement || project.category || ''
  const motionGraphicMedia = project.documentation || project.image || ''
  const isVideo = Boolean(
    motionGraphicMedia &&
      (motionGraphicMedia.endsWith('.mp4') ||
        motionGraphicMedia.endsWith('.webm') ||
        motionGraphicMedia.includes('video'))
  )
  const challengeText = project.challenge || ''
  const approachText = project.approach || ''
  const quoteText = project.quote || ''
  const outcomeText = project.outcome || ''
  const websiteUrl = project.url || ''

  // Picture Documentation: up to 8 images from database
  const pictureDocs = useMemo(() => {
    if (Array.isArray(project.picture_docs) && project.picture_docs.length > 0) {
      return project.picture_docs
    }
    if (typeof project.picture_docs === 'string' && project.picture_docs.trim()) {
      return project.picture_docs
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    return []
  }, [project.picture_docs])

  return (
    <div className="kjoy-inline-case-study-inner" data-od-id="inline-case-study">
      {/* 1. CLIENT (If present in database) */}
      {clientText && (
        <>
          <div className="kjoy-work-line" />
          <div className="kjoy-inline-flex-row">
            <div className="kjoy-inline-flex-label mono-micro">
              <span>CLIENT</span>
            </div>
            <div className="kjoy-inline-flex-desc body-sans">
              <p style={{ fontWeight: 600, letterSpacing: '0.02em', color: '#080707' }}>
                {clientText}
              </p>
            </div>
          </div>
        </>
      )}

      {/* 2. ENGAGEMENT (Scope of work / role) */}
      {engagementText && (
        <>
          <div className="kjoy-work-line" />
          <div className="kjoy-inline-flex-row">
            <div className="kjoy-inline-flex-label mono-micro">
              <span>ENGAGEMENT</span>
            </div>
            <div className="kjoy-inline-flex-desc body-sans">
              <p>{engagementText}</p>
            </div>
          </div>
        </>
      )}

      {/* 3. BRIEF (Core objective & project goal) */}
      {briefText && (
        <>
          <div className="kjoy-work-line" />
          <div className="kjoy-inline-flex-row">
            <div className="kjoy-inline-flex-label mono-micro">
              <span>BRIEF</span>
            </div>
            <div className="kjoy-inline-flex-desc body-sans">
              <p>{briefText}</p>
            </div>
          </div>
        </>
      )}

      {/* 4. MONITOR PICTURE / MOTION GRAPHIC (1920x1080 full on the monitor) */}
      {motionGraphicMedia && (
        <>
          <div className="kjoy-work-line" />
          <section className="kjoy-inline-monitor-section">
            <div className="kjoy-inline-monitor-frame">
              {/* Monitor Bezel Top Bar */}
              <div className="kjoy-monitor-top-bezel">
                <div className="kjoy-monitor-dots">
                  <span className="kjoy-dot-red" />
                  <span className="kjoy-dot-yellow" />
                  <span className="kjoy-dot-green" />
                </div>
                <span className="kjoy-monitor-title mono-micro">
                  {websiteUrl || `${(project.title || 'project').toLowerCase().replace(/\s+/g, '')}.internal.sys`}
                </span>
                <span className="kjoy-monitor-status mono-micro">1920 × 1080 HD</span>
              </div>

              {/* Monitor Screen Media */}
              <div className="kjoy-monitor-screen">
                {isVideo ? (
                  <video
                    src={motionGraphicMedia}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="kjoy-monitor-media"
                  />
                ) : (
                  <img
                    src={motionGraphicMedia}
                    alt={`${project.title} showcase screen 1920x1080`}
                    className="kjoy-monitor-media"
                    loading="lazy"
                  />
                )}
              </div>

              {/* Monitor Chin */}
              <div className="kjoy-monitor-chin">
                <span className="mono-micro" style={{ opacity: 0.55 }}>
                  HARDWARE EMULATION // 1920 × 1080
                </span>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 5. THE CHALLENGE (Obstacles & constraints) */}
      {challengeText && (
        <>
          <div className="kjoy-work-line" />
          <div className="kjoy-inline-flex-row">
            <div className="kjoy-inline-flex-label mono-micro">
              <span>THE CHALLENGE</span>
            </div>
            <div className="kjoy-inline-flex-desc body-sans">
              {challengeText.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 6. THE APPROACH (Strategy & methodology) */}
      {approachText && (
        <>
          <div className="kjoy-work-line" />
          <div className="kjoy-inline-flex-row">
            <div className="kjoy-inline-flex-label mono-micro">
              <span>THE APPROACH</span>
            </div>
            <div className="kjoy-inline-flex-desc body-sans">
              {approachText.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 7. DIRECTIVE QUOTE (Client feedback / testimonial) */}
      {quoteText && (
        <>
          <div className="kjoy-work-line" />
          <div className="kjoy-inline-flex-row kjoy-inline-quote-row" style={{ padding: '24px 0' }}>
            <div className="kjoy-inline-flex-label mono-micro">
              <span style={{ color: '#7A0E22', fontWeight: 700 }}>DIRECTIVE QUOTE</span>
            </div>
            <div className="kjoy-inline-flex-desc body-sans">
              <blockquote
                style={{
                  margin: 0,
                  fontStyle: 'italic',
                  fontSize: 'clamp(15px, 1.35vw, 18px)',
                  lineHeight: 1.6,
                  color: '#080707',
                  borderLeft: '2px solid #7A0E22',
                  paddingLeft: '18px'
                }}
              >
                &ldquo;{quoteText}&rdquo;
              </blockquote>
              {clientText && (
                <span
                  className="mono-micro"
                  style={{
                    display: 'inline-block',
                    marginTop: '10px',
                    color: '#7A0E22',
                    fontWeight: 600,
                    letterSpacing: '0.08em'
                  }}
                >
                  — {clientText}
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* 8. PICTURE DOCUMENTATION (Database-driven gallery) */}
      {pictureDocs.length > 0 && (
        <>
          <div className="kjoy-work-line" />
          <section className="kjoy-inline-gallery-section">
            <div className="kjoy-inline-eight-grid">
              {pictureDocs.slice(0, 8).map((imgUrl, gIdx) => (
                <div key={gIdx} className="kjoy-inline-grid-item">
                  <div className="kjoy-inline-grid-thumb-wrap">
                    <img
                      src={imgUrl}
                      alt={`Documentation frame ${gIdx + 1}`}
                      className="kjoy-inline-grid-thumb"
                      loading="lazy"
                    />
                    <div className="kjoy-inline-grid-overlay" />
                    <span className="kjoy-inline-grid-badge mono-micro">
                      {String(gIdx + 1).padStart(2, '0')}/08
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* 9. THE OUTCOME (Results & impact + website link) */}
      {outcomeText && (
        <>
          <div className="kjoy-work-line" />
          <div className="kjoy-inline-flex-row">
            <div className="kjoy-inline-flex-label mono-micro">
              <span>THE OUTCOME</span>
            </div>
            <div className="kjoy-inline-flex-desc body-sans">
              {outcomeText.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>{paragraph}</p>
              ))}
              {websiteUrl && (
                <div style={{ paddingTop: '14px' }}>
                  <a
                    href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="kjoy-inline-visit-btn mono-micro"
                    title={`Visit ${websiteUrl}`}
                  >
                    <span>VISIT WEBSITE</span>
                    <span className="kjoy-visit-arrow" aria-hidden="true">↗</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 10. Bottom Action Nav */}
      <div className="kjoy-work-line" />
      <div className="kjoy-inline-bottom-nav">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="kjoy-inline-bottom-btn mono-micro"
          >
            ↑ COLLAPSE CASE STUDY
          </button>
        )}
        {websiteUrl && (
          <a
            href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="kjoy-inline-bottom-btn mono-micro"
          >
            OPEN LIVE SITE ↗
          </a>
        )}
      </div>
    </div>
  )
}
