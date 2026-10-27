import { useRouter } from './router.js'
import Home from './pages/Home.jsx'
import MusicPage from './pages/MusicPage.jsx'
import TiguanPage from './pages/TiguanPage.jsx'
import FriendsPage from './pages/FriendsPage.jsx'
import CatPage from './pages/CatPage.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  const { pathname } = useRouter()

  if (pathname === '/kontolgaming123' || pathname.startsWith('/kontolgaming123/')) {
    return <Admin />
  }

  if (pathname === '/kontolgaming123' || pathname.startsWith('/kontolgaming123/')) {
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/kontolgaming123')
    }
    return <Admin />
  }

  if (pathname === '/music') {
    return <MusicPage />
  }

  if (pathname === '/tiguan') {
    return <TiguanPage />
  }

  if (pathname === '/friends') {
    return <FriendsPage />
  }

  if (pathname === '/cat') {
    return <CatPage />
  }

  return <Home />
}
