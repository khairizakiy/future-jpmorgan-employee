import { useEffect, useState } from 'react'

export default function StickyHeader({ activeSection, onNavigate, isOnWhite }) {
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const pct = Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100))
      setScrollPct(pct)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = [
    { id: 'work', label: 'WORK ↘' },
    { id: 'aboutme', label: 'ABOUT' },
    { id: 'contact', label: 'REACH OUT' }
  ]

  return (
    <header
      className={`kjoy-sticky-header ${isOnWhite ? 'header-on-white' : 'header-on-dark'}`}
      role="banner"
      data-od-id="sticky-header"
    >
      <div
        className="kjoy-scroll-progress-line"
        style={{ transform: `scaleX(${scrollPct / 100})` }}
        aria-hidden="true"
      />
      <div className="kjoy-brand-group">
        <a
          href="#hero"
          className="kjoy-brand-link"
          onClick={(e) => {
            e.preventDefault()
            onNavigate('hero')
          }}
        >
          KHAIRI NUGROHO
        </a>
      </div>

      <nav className="kjoy-center-nav" aria-label="Primary navigation">
        <div className="kjoy-nav-links">
          {navItems.map((item) => {
            const isActive = activeSection === item.id
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`kjoy-nav-link ${isActive ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate(item.id)
                }}
              >
                {isActive && (
                  <span className="kjoy-nav-active-dot" aria-hidden="true" />
                )}
                <span>{item.label}</span>
              </a>
            )
          })}
        </div>
      </nav>

      <div className="kjoy-header-right">
        <span className="kjoy-header-location">BATAM, ID</span>
      </div>
    </header>
  )
}
