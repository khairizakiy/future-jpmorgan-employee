import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import { api } from '../api.js'

export default function TiguanPage() {
  const [tiguan, setTiguan] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_DATA__?.tiguan) {
      return window.__INITIAL_DATA__.tiguan
    }
    return null
  })
  const [loading, setLoading] = useState(!tiguan)

  useEffect(() => {
    document.title = 'Khairi Nugroho — 2009 Tiguan'
    api.tiguan()
      .then((data) => {
        setTiguan(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="max-w-[760px] mx-auto">
        <Header currentPath="/tiguan" subtitle="MQB platform • EA888 2.0 TSI" />
        <div className="cmd-box">
          <div className="cmd-header">2009 tiguan // loading database...</div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="skeleton skeleton-text w-1/3"></div>
              <div className="skeleton skeleton-text w-1/4"></div>
            </div>

            {/* Photos Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-[#75736c] p-1 bg-white">
                  <div className="skeleton w-full aspect-[4/3] rounded-[1px]"></div>
                  <div className="skeleton h-3 w-2/3 mx-auto mt-1"></div>
                </div>
              ))}
            </div>

            {/* Mods Skeleton */}
            <div className="pt-2">
              <div className="skeleton skeleton-text w-40 mb-2"></div>
              <div className="space-y-1.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="item-card flex items-center justify-between">
                    <div className="skeleton skeleton-text w-32 mb-0"></div>
                    <div className="skeleton skeleton-text w-24 mb-0"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const t = tiguan || {
    title: '2009 Volkswagen Tiguan TSI 2.0',
    color: 'Deep Black Pearl',
    photos: [
      {
        id: 1,
        url: '',
        caption: ''
      },
      {
        id: 2,
        url: '',
        caption: ''
      },
      {
        id: 3,
        url: '',
        caption: ''
      }
    ],
    mods: [
      { name: '', detail: '' }
    ]
  }

  return (
    <div className="max-w-[760px] mx-auto">
      <Header currentPath="/tiguan" subtitle="MQB platform • EA888 2.0 TSI" />

      <div className="cmd-box" id="section-tiguan">
        <div className="cmd-header">C:\users\2009 tiguan</div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 text-xs text-on-surface-variant font-mono gap-1">
          <span>{t.title}</span>
          <span className="text-terminal-prompt">{t.color}</span>
        </div>

        {/* 3-Column Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
          {t.photos?.map((photo) => (
            <div key={photo.id || photo.caption} className="border border-[#b8b6ad] bg-white p-1 rounded-sm">
              <img
                alt={photo.caption}
                className="w-full aspect-[4/3] object-cover rounded-xs hover:contrast-105 transition-all duration-200"
                src={photo.url}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="text-[10px] font-mono text-center text-terminal-prompt mt-1">
                {photo.caption}
              </div>
            </div>
          ))}
        </div>

        {/* Modifications Ledger */}
        <div className="item-card !mb-0 text-xs">
          <div className="font-mono text-terminal-prompt mb-1.5 text-[11px]">
            &gt; modification ledger:
          </div>
          <ul className="list-disc list-inside space-y-1 text-on-surface-variant font-mono text-[11px]">
            {t.mods?.map((mod, idx) => (
              <li key={idx}>
                <span className="text-on-surface font-sans font-medium">{mod.name}:</span>{' '}
                <span>{mod.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
