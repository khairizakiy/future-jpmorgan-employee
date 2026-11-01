import { useEffect, useState } from 'react'

export function navigate(to) {
  if (to === window.location.pathname) return
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function useRouter() {
  const [pathname, setPathname] = useState(
    () => window.location.pathname.replace(/\/+$/, '') || '/'
  )

  useEffect(() => {
    const onPop = () => {
      setPathname(window.location.pathname.replace(/\/+$/, '') || '/')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return { pathname, navigate }
}
