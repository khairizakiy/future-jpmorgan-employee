import MetallicKSculpture from './MetallicKSculpture.jsx'

export default function HeroSection({ onScrollDown }) {
  return (
    <section id="hero" className="kjoy-hero" data-od-id="hero-section">
      {/* Subtle repeating geometric dot grid pattern in the background */}
      <svg className="kjoy-hero-dots" aria-hidden="true">
        <defs>
          <pattern
            id="kjoy-dot-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.1" fill="#080707" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kjoy-dot-grid)" />
      </svg>

      {/* Centerpiece Stage: Vast open negative space + Solitary Interactive 3D Metallic "K" */}
      <div className="kjoy-hero-center">
        {/* Subtle, monumental neo-brutalist watermark in the background */}
        <div className="kjoy-hero-watermark" aria-hidden="true">
          <span>KHAIRI</span>
        </div>

        {/* 3D Metallic "K" with drag physics & sheen */}
        <div className="kjoy-hero-sculpture-stage" data-cursor-label="DRAG 3D">
          <MetallicKSculpture variant="hero" />
        </div>
      </div>

      {/* Minimal Bottom Center Action: Leaves visitor with intrigue to scroll into project & bio */}
      <div className="kjoy-hero-bottom-minimal">
        <div className="kjoy-hero-bottom-action">
          <button
            type="button"
            className="kjoy-hero-scroll-btn"
            onClick={() => onScrollDown && onScrollDown('work')}
          >
            <span>SCROLL TO DISCOVER</span>
            <span className="kjoy-hero-scroll-arrow">↓</span>
          </button>
        </div>
      </div>
    </section>
  )
}
