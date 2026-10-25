import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)
  const [cursorLabel, setCursorLabel] = useState('')
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springX = useSpring(cursorX, { stiffness: 800, damping: 40, mass: 0.25 })
  const springY = useSpring(cursorY, { stiffness: 800, damping: 40, mass: 0.25 })
  const ringX = useSpring(cursorX, { stiffness: 320, damping: 30, mass: 0.45 })
  const ringY = useSpring(cursorY, { stiffness: 320, damping: 30, mass: 0.45 })

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    const onMove = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      setVisible(true)
    }

    const onOver = (e) => {
      const target = e.target
      if (!target || !target.closest) {
        setHovered(false)
        setCursorLabel('')
        return
      }
      const labeled = target.closest('[data-cursor-label]')
      if (labeled) {
        setCursorLabel(labeled.getAttribute('data-cursor-label') || '')
      } else {
        setCursorLabel('')
      }
      if (
        target.closest(
          'a, button, [data-cursor-hover], [data-cursor-label], [draggable="true"], .k-sculpture-drag-wrap, .kjoy-case-strip-track'
        )
      ) {
        setHovered(true)
      } else {
        setHovered(false)
      }
    }

    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)
    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown, { passive: true })
    window.addEventListener('mouseup', onUp, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
    }
  }, [cursorX, cursorY])

  return (
    <>
      <motion.div
        className={`kjoy-cursor-ring ${hovered ? 'is-hovered' : ''}`}
        aria-hidden="true"
        style={{
          x: ringX,
          y: ringY,
          opacity: visible ? 1 : 0,
          scale: pressed ? 0.82 : hovered ? 1.45 : 1
        }}
      />
      <motion.div
        className={`kjoy-cursor-dot ${hovered ? 'is-hovered' : ''} ${pressed ? 'is-pressed' : ''} ${cursorLabel ? 'has-label' : ''}`}
        aria-hidden="true"
        style={{
          x: springX,
          y: springY,
          opacity: visible ? 1 : 0,
          scale: pressed ? 0.85 : hovered && !cursorLabel ? 1.85 : 1
        }}
      >
        {cursorLabel && <span className="kjoy-cursor-tag">{cursorLabel}</span>}
      </motion.div>
    </>
  )
}
