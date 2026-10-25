import Home from './pages/Home.jsx'
import Admin from './pages/Admin.jsx'

const path = window.location.pathname.replace(/\/+$/, '') || '/'

export default function App() {
  if (path === '/admin' || path.startsWith('/admin/')) return <Admin />
  return <Home />
}
