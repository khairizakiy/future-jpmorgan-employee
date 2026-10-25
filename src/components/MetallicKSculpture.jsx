import { useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * Interactive 3D Metallic Sculpture of the letter "K"
 * - variant="hero": Floating silver/chrome & burgundy-rimmed 3D metallic sculpture
 *   in the dead center of #hero, reacting smoothly to cursor X/Y via useSpring.
 * - variant="contact": Dark glossy 3D metallic "K" sculpture tilted at -13deg,
 *   wrapped in <motion.div drag dragSnapToOrigin> with a slow floating loop.
 */
export default function MetallicKSculpture({ variant = 'hero' }) {
  const isContact = variant === 'contact'

  // Normalized mouse coordinates (-0.5 to 0.5)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 120, damping: 20, mass: 0.8 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  const rotateY = useTransform(smoothX, [-0.5, 0.5], isContact ? [-18, 18] : [-28, 28])
  const rotateX = useTransform(smoothY, [-0.5, 0.5], isContact ? [16, -16] : [24, -24])
  const translateX = useTransform(smoothX, [-0.5, 0.5], isContact ? [-14, 14] : [-26, 26])
  const translateY = useTransform(smoothY, [-0.5, 0.5], isContact ? [-10, 10] : [-20, 20])
  const lightX = useTransform(smoothX, [-0.5, 0.5], [60, 240])
  const lightY = useTransform(smoothY, [-0.5, 0.5], [40, 220])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      mouseX.set(nx)
      mouseY.set(ny)
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  // Extruded depth layers for genuine 3D thickness when rotated
  const depthLayers = [-24, -20, -16, -12, -8, -4, 0]

  // Bold sculptural "K" polygon path (inflated neo-brutalist heavy bevel geometry)
  const kPath =
    'M 52 28 L 116 28 C 122 28 126 32 126 38 L 126 122 L 196 34 C 200 29 205 28 212 28 L 268 28 C 276 28 280 35 274 42 L 184 146 L 280 268 C 285 275 281 282 272 282 L 210 282 C 203 282 198 279 194 273 L 126 182 L 126 272 C 126 278 122 282 116 282 L 52 282 C 46 282 42 278 42 272 L 42 38 C 42 32 46 28 52 28 Z'

  const gradPrefix = isContact ? 'k-dark' : 'k-hero'

  return (
    <motion.div
      className={`k-sculpture-drag-wrap ${isContact ? 'k-sculpture-contact' : 'k-sculpture-hero'}`}
      drag
      dragSnapToOrigin
      dragElastic={0.28}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96, cursor: 'grabbing' }}
      data-cursor-hover
      style={{
        x: translateX,
        y: translateY,
        rotate: isContact ? -13 : 0
      }}
    >
      <motion.div
        className="k-sculpture-float"
        animate={{
          y: isContact ? [0, -14, 0] : [0, -10, 0],
          rotateZ: isContact ? [0, 2.2, 0, -1.8, 0] : [0, 1.5, 0, -1.5, 0]
        }}
        transition={{
          duration: isContact ? 6.2 : 5.4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <motion.div
          className="k-sculpture-3d-stage"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Extruded 3D side/back bevel layers */}
          {depthLayers.map((z, idx) => (
            <svg
              key={z}
              viewBox="0 0 320 310"
              className="k-sculpture-layer"
              style={{
                transform: `translateZ(${z}px)`,
                opacity: idx === depthLayers.length - 1 ? 1 : 0.92
              }}
              aria-hidden="true"
            >
              <path
                d={kPath}
                fill={
                  isContact
                    ? idx < 3
                      ? '#12080B'
                      : '#241016'
                    : idx < 3
                      ? '#1E1A1B'
                      : '#3B1520'
                }
                stroke={isContact ? '#3A1520' : '#7A0E22'}
                strokeWidth={idx === 0 ? '4' : '2'}
                strokeLinejoin="round"
              />
            </svg>
          ))}

          {/* Main Front Glossy 3D Metallic Face */}
          <svg
            viewBox="0 0 320 310"
            className="k-sculpture-front"
            style={{ transform: 'translateZ(6px)' }}
            role="img"
            aria-label="3D metallic K sculpture"
          >
            <defs>
              {/* Primary Liquid Chrome / Obsidian Metallic Gradient */}
              <linearGradient id={`${gradPrefix}-metal`} x1="0%" y1="0%" x2="100%" y2="100%">
                {isContact ? (
                  <>
                    <stop offset="0%" stopColor="#524D50" />
                    <stop offset="18%" stopColor="#1B1819" />
                    <stop offset="38%" stopColor="#8E878A" />
                    <stop offset="52%" stopColor="#080707" />
                    <stop offset="72%" stopColor="#7A0E22" />
                    <stop offset="88%" stopColor="#2A2527" />
                    <stop offset="100%" stopColor="#D8D2D4" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="16%" stopColor="#B8B2B4" />
                    <stop offset="34%" stopColor="#231E20" />
                    <stop offset="50%" stopColor="#F5F2F3" />
                    <stop offset="68%" stopColor="#7A0E22" />
                    <stop offset="84%" stopColor="#181415" />
                    <stop offset="100%" stopColor="#FAF8F5" />
                  </>
                )}
              </linearGradient>

              {/* Inner bevel studio reflection */}
              <linearGradient id={`${gradPrefix}-bevel`} x1="15%" y1="5%" x2="85%" y2="95%">
                {isContact ? (
                  <>
                    <stop offset="0%" stopColor="#FAF8F5" stopOpacity="0.55" />
                    <stop offset="30%" stopColor="#1B1718" stopOpacity="0.9" />
                    <stop offset="62%" stopColor="#7A0E22" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#080707" stopOpacity="0.95" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="28%" stopColor="#3B3537" stopOpacity="0.55" />
                    <stop offset="58%" stopColor="#FAF8F5" stopOpacity="0.9" />
                    <stop offset="82%" stopColor="#7A0E22" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#141112" stopOpacity="0.85" />
                  </>
                )}
              </linearGradient>

              {/* Specular studio rim highlight */}
              <radialGradient id={`${gradPrefix}-rim`} cx="32%" cy="24%" r="68%">
                <stop offset="0%" stopColor="#FAF8F5" stopOpacity={isContact ? '0.6' : '0.9'} />
                <stop offset="35%" stopColor="#7A0E22" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#080707" stopOpacity="0" />
              </radialGradient>

              {/* 3D Specular Lighting Filter for liquid-metal curvature */}
              <filter id={`${gradPrefix}-spec`} x="-15%" y="-15%" width="130%" height="130%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
                <feSpecularLighting
                  in="blur"
                  surfaceScale="7"
                  specularConstant="1.15"
                  specularExponent="38"
                  lightingColor="#FAF8F5"
                  result="specOut"
                >
                  <fePointLight x="95" y="65" z="160" />
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specMask" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="specMask" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer metallic body */}
            <path
              d={kPath}
              fill={`url(#${gradPrefix}-metal)`}
              stroke={isContact ? 'rgba(250, 248, 245, 0.35)' : '#080707'}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Inner sculpted bevel ridge */}
            <path
              d={kPath}
              fill={`url(#${gradPrefix}-bevel)`}
              transform="translate(10, 9) scale(0.935)"
              opacity="0.88"
            />

            {/* Studio light reflection crest */}
            <path
              d={kPath}
              fill={`url(#${gradPrefix}-rim)`}
              transform="translate(16, 14) scale(0.89)"
            />

            {/* Fine precision chrome specular edge lines */}
            <path
              d="M 56 38 L 112 38 M 56 38 L 56 268 M 206 38 L 260 38 M 132 150 L 208 268"
              stroke="#FAF8F5"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity={isContact ? '0.42' : '0.75'}
            />
          </svg>
        </motion.div>

        {/* Ambient floating floor shadow */}
        <div className={`k-sculpture-shadow ${isContact ? 'k-shadow-dark' : 'k-shadow-light'}`} />
      </motion.div>
    </motion.div>
  )
}
