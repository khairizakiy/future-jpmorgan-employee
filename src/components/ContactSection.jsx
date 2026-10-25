import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import MetallicKSculpture from './MetallicKSculpture.jsx'
import { api } from '../api.js'

function ensureAbsoluteUrl(url, fallback = '') {
  const target = (url || fallback || '').trim()
  if (!target) return ''
  if (/^https?:\/\//i.test(target)) return target
  return `https://${target}`
}

export default function ContactSection({ onBackToTop }) {
  const [copied, setCopied] = useState(false)
  const [emailAddress, setEmailAddress] = useState('khairizakiyn@gmail.com')
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/zkiyngrh')
  const [githubUrl, setGithubUrl] = useState('https://github.com/khairizakiy')
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/khairinugroho')

  useEffect(() => {
    api
      .profile()
      .then((p) => {
        if (p?.email) setEmailAddress(p.email)
        if (p?.github_url) setGithubUrl(p.github_url)
        if (p?.linkedin_url) setLinkedinUrl(p.linkedin_url)
        if (p?.instagram_url || p?.x_url) setInstagramUrl(p.instagram_url || p.x_url)
      })
      .catch(() => {})
  }, [])

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    emailAddress || 'khairizakiyn@gmail.com'
  )}&su=${encodeURIComponent("Let's Connect")}&body=${encodeURIComponent('Hey Khairi!')}`

  // Subtle 3D business card tilt on hover
  const cardMouseX = useMotionValue(0)
  const cardMouseY = useMotionValue(0)
  const smoothCardX = useSpring(cardMouseX, { stiffness: 180, damping: 24, mass: 0.6 })
  const smoothCardY = useSpring(cardMouseY, { stiffness: 180, damping: 24, mass: 0.6 })
  const cardRotateY = useTransform(smoothCardX, [-0.5, 0.5], [-4.5, 4.5])
  const cardRotateX = useTransform(smoothCardY, [-0.5, 0.5], [4.5, -4.5])

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    cardMouseX.set(nx)
    cardMouseY.set(ny)
  }

  const handleCardMouseLeave = () => {
    cardMouseX.set(0)
    cardMouseY.set(0)
  }

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(emailAddress)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <section id="contact" className="kjoy-contact" data-od-id="contact-section">
      {/* Top Section Kicker Row */}
      <div className="kjoy-contact-top">
        <div className="kjoy-contact-kicker-row">
          <div className="kjoy-availability-badge">
            <span>
              IF YOU HAVE A PROJECT IN MIND,<br />
              A QUESTION TO ASK, STORY TO SHARE,<br />
              AND EXCITING OPPORTUNITY TO WORK TOGETHER,<br />
              LET&apos;S CONNECT AND CHAT!
            </span>
          </div>
        </div>
      </div>

      <div className="kjoy-bizcard-stage">
        <motion.div
          className="kjoy-bizcard kjoy-swiss-card"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{
            rotateX: cardRotateX,
            rotateY: cardRotateY,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Top 3px Burgundy Accent Strip (Signature Card Edge) */}
          <div className="kjoy-bizcard-top-bar" aria-hidden="true" />

          {/* Card Header: Left K Logo | Right Address & Telemetry Block */}
          <div className="kjoy-bizcard-header">
            <div className="kjoy-bizcard-brand">
              <div className="kjoy-bizcard-k-logo" aria-label="K Logo">
                <span className="kjoy-bizcard-monogram" aria-hidden="true">
                  K
                </span>
                <span className="mono-micro kjoy-bizcard-logo-tag">
                  ATELIER
                </span>
              </div>
            </div>

            <div className="kjoy-bizcard-meta mono-micro">
              <span>BATAM, INDONESIA • WIB</span>
              <span>F1 • MACRO • FINANCE • TRADING</span>
            </div>
          </div>

          <div className="kjoy-line-black" />

          {/* Card Body: Straight to Name in the Middle + Slogan | Right 3D Metallic "K" */}
          <div className="kjoy-bizcard-body">
            <div className="kjoy-bizcard-identity">
              <h2 className="kjoy-bizcard-name">KHAIRI NUGROHO</h2>
              <div className="kjoy-bizcard-tagline-row">
                <span className="kjoy-bizcard-zuck-quote mono-micro">
                  &ldquo;Connect with the Best&rdquo;
                </span>
              </div>
            </div>

            <div className="kjoy-bizcard-sculpture-slot" data-cursor-label="DRAG 3D">
              <MetallicKSculpture variant="contact" />
            </div>
          </div>

          <div className="kjoy-line-black" />

          {/* Card Action Pill Row (Straight to Email, Swiss Square Box) */}
          <div className="kjoy-bizcard-actions kjoy-bizcard-actions-single">
            <div className="kjoy-bizcard-action-col kjoy-bizcard-action-col-full">
              <span className="mono-micro kjoy-bizcard-field-label">EMAIL DIRECT</span>
              <div className="kjoy-cta-pill-outline kjoy-cta-square-outline">
                <a
                  href={gmailComposeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kjoy-email-link mono-micro"
                  title="Direct to Gmail Compose"
                >
                  <span className="kjoy-email-icon" aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L1 7" />
                    </svg>
                  </span>
                  <span className="kjoy-email-address">
                    {emailAddress.toUpperCase()}
                  </span>
                </a>
                <button
                  type="button"
                  className={`kjoy-copy-btn mono-micro ${copied ? 'copied' : ''}`}
                  onClick={handleCopyEmail}
                  aria-label={`Copy email address ${emailAddress}`}
                  title={copied ? 'Copied!' : `Copy ${emailAddress}`}
                >
                  {copied ? (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>COPIED ✓</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="kjoy-line-black" />

          {/* Card Bottom Network Bar */}
          <div className="kjoy-bizcard-footer kjoy-bizcard-footer-clean">
            <div className="kjoy-social-links">
              <a
                href={ensureAbsoluteUrl(linkedinUrl, 'https://linkedin.com/in/khairinugroho')}
                target="_blank"
                rel="noreferrer"
                className="mono-micro kjoy-social-link"
              >
                LINKEDIN ↗
              </a>
              <a
                href={ensureAbsoluteUrl(instagramUrl, 'https://instagram.com/zkiyngrh')}
                target="_blank"
                rel="noreferrer"
                className="mono-micro kjoy-social-link"
              >
                INSTAGRAM ↗
              </a>
              <a
                href={ensureAbsoluteUrl(githubUrl, 'https://github.com/khairizakiy')}
                target="_blank"
                rel="noreferrer"
                className="mono-micro kjoy-social-link"
              >
                GITHUB ↗
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Sub-Footer */}
      <div className="kjoy-contact-bottom-bar">
        <div className="kjoy-line-black" />
        <footer className="kjoy-sub-footer mono-micro">
          <span>KHAIRI NUGROHO 2026©</span>
          <button
            type="button"
            className="kjoy-back-top mono-micro"
            onClick={() => onBackToTop && onBackToTop('hero')}
          >
            BACK TO TOP ↑
          </button>
        </footer>
      </div>
    </section>
  )
}
