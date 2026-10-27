import { navigate } from '../router.js'

export default function Header({ currentPath = '/', subtitle, profile }) {
  const isHome = currentPath === '/'
  const displaySubtitle = subtitle || profile?.hero || profile?.headline || 'batam, id'

  const linkedinUrl = profile?.linkedin_url || 'https://linkedin.com/in/khairinugroho'
  const githubUrl = profile?.github_url || 'https://github.com/khairinugroho'
  const instagramUrl = profile?.instagram_url || profile?.x_url || 'https://instagram.com/khairinugroho'
  const spotifyUrl = profile?.spotify_url || 'https://open.spotify.com/user/j45vdoajmtkvdq33tunybf9o6?si=3163aa858f2341ab'
  const emailRecipient = profile?.email || 'khairizakiyn@gmail.com'
  const emailSubject = encodeURIComponent("Let's Connect")
  const emailBody = encodeURIComponent("Hey Nugroho! ...")
  const emailUrl = `mailto:${emailRecipient}?subject=${emailSubject}&body=${emailBody}`

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#c8c6be]">
      <div>
        <div className="flex items-center gap-2">
          {!isHome && (
            <button
              onClick={() => navigate('/')}
              className="font-mono text-xs text-terminal-prompt hover:text-black underline mr-1 flex items-center gap-1"
              title="Return to Home"
            >
              <span>←</span> <span>cd ..</span>
            </button>
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
            {isHome ? (
              profile?.name || 'Khairi Nugroho'
            ) : (
              <span
                onClick={() => navigate('/')}
                className="cursor-pointer hover:underline"
              >
                {profile?.name || 'Khairi Nugroho'}
              </span>
            )}
            {!isHome && <span className="font-mono font-normal text-sm text-terminal-prompt ml-2">/ {currentPath.replace('/', '')}</span>}
          </h1>
        </div>
        <p className="text-xs text-on-surface-variant font-mono mt-0.5">
          {displaySubtitle}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <a
          className="link-badge !bg-[#0077b5] !text-white !border-[#0077b5]"
          href={linkedinUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.88 0-1.6.72-1.6 1.6s.72 1.6 1.6 1.6 1.6-.72 1.6-1.6-.72-1.6-1.6-1.6Z" />
          </svg>
          <span>LinkedIn</span>
        </a>

        <a
          className="link-badge"
          href={githubUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 14.42 22 12A10 10 0 0 0 12 2Z" />
          </svg>
          <span>GitHub</span>
        </a>

        <a
          className="link-badge"
          href={instagramUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          <span>Instagram</span>
        </a>

        <a
          className="link-badge"
          href={spotifyUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <svg className="w-3 h-3 fill-current text-[#1db954]" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10A10 10 0 0 0 12 2zm4.586 14.424a.627.627 0 0 1-.861.208c-2.357-1.44-5.324-1.767-8.818-.968a.627.627 0 1 1-.28-1.223c3.824-.874 7.108-.5 9.75 1.122a.628.628 0 0 1 .209.861zm1.226-2.727a.784.784 0 0 1-1.08.258c-2.7-1.66-6.814-2.14-10.007-1.171a.785.785 0 1 1-.456-1.503c3.655-1.109 8.212-.572 11.285 1.32a.785.785 0 0 1 .258 1.096zm.106-2.836C14.685 8.93 9.35 8.75 6.275 9.684a.942.942 0 1 1-.55-1.802c3.542-1.077 9.444-.863 13.256 1.399a.942.942 0 1 1-.963 1.625z" />
          </svg>
          <span>Spotify</span>
        </a>

        <a className="link-badge" href={emailUrl} title="Send email via Gmail">
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          <span>Gmail</span>
        </a>
      </div>
    </header>
  )
}
