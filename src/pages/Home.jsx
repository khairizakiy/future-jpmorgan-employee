import { useCallback, useEffect, useRef, useState } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import CustomCursor from '../components/CustomCursor.jsx'
import StickyHeader from '../components/StickyHeader.jsx'
import HeroSection from '../components/HeroSection.jsx'
import WorkSection from '../components/WorkSection.jsx'
import AboutSection from '../components/AboutSection.jsx'
import ContactSection from '../components/ContactSection.jsx'

function PortfolioShell() {
  const [activeSection, setActiveSection] = useState('')
  const [isOnWhite, setIsOnWhite] = useState(true)
  const lenisRef = useRef(null)
  const isNavigatingRef = useRef(false)
  const navLockTimeoutRef = useRef(null)

  const evaluateScroll = useCallback(() => {
    const workEl = document.getElementById('work')
    const aboutEl = document.getElementById('aboutme')
    const contactEl = document.getElementById('contact')
    const vh = window.innerHeight || 900

    if (aboutEl) {
      const aboutTop = aboutEl.getBoundingClientRect().top
      setIsOnWhite(aboutTop > 48)
    }

    // Do not override activeSection during programmatic click scrolling
    if (isNavigatingRef.current) return

    if (contactEl && contactEl.getBoundingClientRect().top <= vh * 0.55) {
      setActiveSection('contact')
    } else if (aboutEl && aboutEl.getBoundingClientRect().top <= vh * 0.55) {
      setActiveSection('aboutme')
    } else if (workEl && workEl.getBoundingClientRect().top <= vh * 0.55) {
      setActiveSection('work')
    } else {
      // In Hero / top of page: no active square on any section
      setActiveSection('')
    }
  }, [])

  useLenis((lenis) => {
    lenisRef.current = lenis
    window.lenis = lenis
    evaluateScroll()
  })

  useEffect(() => {
    evaluateScroll()
    window.addEventListener('scroll', evaluateScroll, { passive: true })
    window.addEventListener('resize', evaluateScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', evaluateScroll)
      window.removeEventListener('resize', evaluateScroll)
      if (navLockTimeoutRef.current) clearTimeout(navLockTimeoutRef.current)
    }
  }, [evaluateScroll])

  const handleNavigate = useCallback((targetId) => {
    const lenis = lenisRef.current || window.lenis
    if (navLockTimeoutRef.current) {
      clearTimeout(navLockTimeoutRef.current)
    }

    if (targetId === 'hero') {
      setActiveSection('')
      isNavigatingRef.current = true
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(0, {
          duration: 0.6,
          onComplete: () => {
            isNavigatingRef.current = false
          }
        })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        navLockTimeoutRef.current = setTimeout(() => {
          isNavigatingRef.current = false
        }, 600)
      }
      return
    }

    // Set target section immediately so nav box glides directly without intermediate bouncing
    setActiveSection(targetId)
    isNavigatingRef.current = true

    const targetEl = document.getElementById(targetId)
    if (!targetEl) {
      isNavigatingRef.current = false
      return
    }

    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(targetEl, {
        offset: 0,
        duration: 0.6,
        onComplete: () => {
          isNavigatingRef.current = false
        }
      })
      navLockTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false
      }, 650)
    } else {
      targetEl.scrollIntoView({ behavior: 'smooth' })
      navLockTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false
      }, 600)
    }
  }, [])

  return (
    <div id="main" className="kjoy-root">
      <CustomCursor />
      <StickyHeader
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isOnWhite={isOnWhite}
      />
      <main className="kjoy-main">
        <HeroSection onScrollDown={handleNavigate} />
        <WorkSection onNavigate={handleNavigate} />
        <AboutSection />
        <ContactSection onBackToTop={handleNavigate} />
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true
      }}
    >
      <PortfolioShell />
    </ReactLenis>
  )
}
