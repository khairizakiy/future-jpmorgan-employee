import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import { api } from '../api.js'

export default function CatPage() {
  const [catData, setCatData] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_DATA__?.cat) {
      return window.__INITIAL_DATA__.cat
    }
    return null
  })
  const [loading, setLoading] = useState(!catData)
  const [purrText, setPurrText] = useState('// status: napping peacefully at 432 Hz')
  const [patCount, setPatCount] = useState(0)
  const [isPurringGreen, setIsPurringGreen] = useState(false)

  useEffect(() => {
    document.title = 'Khairi Nugroho — Loli (Cat)'
    api.cat().then((data) => {
      setCatData(data)
      if (data?.pats) setPatCount(data.pats)
      setLoading(false)
    }).catch((err) => {
      console.error(err)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="max-w-[760px] mx-auto">
        <Header currentPath="/cat" subtitle="chief QA engineer • purr runtime" />
        <div className="cmd-box">
          <div className="cmd-header">loli.exe // loading database...</div>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#c8c6be]">
              <div className="space-y-1">
                <div className="skeleton skeleton-text w-28"></div>
                <div className="skeleton skeleton-text w-44"></div>
              </div>
              <div className="skeleton w-28 h-8 rounded-sm"></div>
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
          </div>
        </div>
      </div>
    )
  }

  const c = catData || {
    name: 'Loli',
    role: 'Chief QA & Keyboard Blocker',
    pats: 0,
    photos: [
      {
        id: 1,
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArsTkuXlhq6PVfZoT711uDwRiwgLxF3JvAzFqk004oeCTpBeswGqFmOrED3CihTLYj-7tVpjtYJ_YmoZTzRMhi8qKuyrLHseLOzNJjOGUmbFL6vyDYsZF2jbkILih8eVnIgmapbGymwEcE70ckBbfNGb04kei45CZv-IJJ5yCraXcUZ3LAdcryDHFa1afO_pN4-kua_-J31Ejck3qhh7lhf_JeAKLQqil5OJNxBTNLSfpLJuXCC0wp',
        caption: 'production deploy blocked'
      },
      {
        id: 2,
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN1hkCBbTCSn9EIzqRjkUHGD2aWy-r4zP7Mq2o_YBTAstJ3-eQLdPkATXCevCD32Ns7C0u_FS5Dl3PwQXl_cpkhnA00M3oCzsYwpqDyEvQYmMchME_lGNrcarKbK8DCU9Tl9iohibV301Ph0NzlUabtnFsc1t8TCyeK0Ztyr209_r7VSdm_tCLaXNrZUkoR5TzU8rOnFak8hyHCGDRJMzTiR0BkZx6OMKv4nrAJIxFN2JvdYZrVJeL',
        caption: 'box structural inspection'
      },
      {
        id: 3,
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCmjPOWGYJWqlsKJ3RqpOLhN5LEe9CNhzouA61dMScj3Cx4RNN7TjjZJUm9xjnRj_cGOz0sGQiXYmMQxdWJNJB9qo3ZlaJRLeXd0kvjKRud4va6GPQJ8QtqM0VZRVCEEcQCDhJlqWWlG5i1A68sYr9K1gmDgjm1-6DLOqNOF3Q-bYf0cjutQRE5KiXF0v-gnx2ySgGTlifFUf6RftC_Ga_Wi-D9FZQ1lnFPqIvISR8csYFeRKw2BA2',
        caption: 'perimeter bird surveillance'
      }
    ],
    purr_messages: [
      '// status: purring softly at 432 Hz',
      '// status: kneading the ergonomic keyboard',
      '// status: happy blink received ^_^',
      '// status: headbutting terminal cursor'
    ]
  }

  const handlePat = async () => {
    try {
      const res = await api.patCat()
      if (res) {
        setPatCount(res.pats)
        setPurrText(res.status_message)
      }
    } catch {
      const nextCount = patCount + 1
      setPatCount(nextCount)
      const msgs = c.purr_messages || [
        '// status: purring softly at 432 Hz',
        '// status: kneading the ergonomic keyboard',
        '// status: happy blink received ^_^',
        '// status: headbutting terminal cursor'
      ]
      const msg = msgs[(nextCount - 1) % msgs.length]
      setPurrText(`${msg} (total pats: ${nextCount})`)
    }

    setIsPurringGreen(true)
    setTimeout(() => setIsPurringGreen(false), 1200)
  }

  return (
    <div className="max-w-[760px] mx-auto">
      <Header currentPath="/cat" subtitle="office companion • keyboard blocker • low-frequency resonance" />

      <div className="cmd-box" id="section-cat">
        <div className="cmd-header">C:\users\loli (cat)</div>
        <div className="flex items-center justify-between mb-3 text-xs text-on-surface-variant font-mono">
          <span>{c.name} ({c.role})</span>
          <button
            className="link-badge text-[10px] active:scale-95 transition-transform"
            onClick={handlePat}
          >
            pats :3 {patCount > 0 && <span className="text-emerald-700 font-bold ml-1">({patCount})</span>}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2.5">
          {c.photos?.map((photo) => (
            <div
              key={photo.id || photo.caption}
              className="border border-[#b8b6ad] bg-white p-1 rounded-sm hover:border-[#1b1c18] transition-all duration-200"
            >
              <img
                alt={photo.caption}
                className="w-full aspect-[4/3] object-cover"
                src={photo.url}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="p-1 text-[11px] text-center text-on-surface">
                {photo.caption}
              </div>
            </div>
          ))}
        </div>

        <div
          className={`text-[11px] font-mono text-center h-4 transition-colors duration-300 ${
            isPurringGreen ? 'text-emerald-600 font-semibold' : 'text-terminal-prompt'
          }`}
          id="purr-msg"
        >
          {purrText}
        </div>
      </div>
    </div>
  )
}
