import React, { Component } from 'react'
import { useRouter } from './router.js'
import Home from './pages/Home.jsx'
import MusicPage from './pages/MusicPage.jsx'
import TiguanPage from './pages/TiguanPage.jsx'
import FriendsPage from './pages/FriendsPage.jsx'
import CatPage from './pages/CatPage.jsx'
import Admin from './pages/Admin.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App render error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-[760px] mx-auto p-4 font-mono text-xs">
          <div className="cmd-box">
            <div className="cmd-header">system // notice</div>
            <p className="text-[#b91c1c] font-semibold mb-2">A temporary rendering issue occurred.</p>
            <p className="text-on-surface-variant mb-4">{this.state.error?.message || 'Please reload.'}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="link-badge"
            >
              ↻ Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const { pathname } = useRouter()

  const renderContent = () => {
    if (pathname === '/kontolgaming123' || pathname.startsWith('/kontolgaming123/')) {
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

  return <ErrorBoundary>{renderContent()}</ErrorBoundary>
}
