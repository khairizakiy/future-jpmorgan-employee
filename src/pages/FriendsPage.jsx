import { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import { api } from '../api.js'

export default function FriendsPage() {
  const [friendsData, setFriendsData] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_DATA__?.friends) {
      return window.__INITIAL_DATA__.friends
    }
    return null
  })
  const [loading, setLoading] = useState(!friendsData)

  useEffect(() => {
    document.title = 'Khairi Nugroho — Friends & Film'
    api.friends()
      .then((data) => {
        setFriendsData(data)
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
        <Header currentPath="/friends" subtitle="good people, roadtrips, and late diner coffee" />
        <div className="cmd-box">
          <div className="cmd-header">C:\users\friends &amp; film // loading database...</div>
          <div className="space-y-4">
            <div className="skeleton skeleton-text w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="item-card bg-white p-2">
                  <div className="skeleton w-full aspect-[4/3] rounded-[1px] mb-2"></div>
                  <div className="skeleton skeleton-text w-3/4 mb-1"></div>
                  <div className="skeleton skeleton-text w-1/2 mb-0"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const f = friendsData || {
    title: 'friends & film',
    subtitle: 'good people, roadtrips, and late diner coffee',
    photos: [
      {
        id: 1,
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrIuM3zgV6b7WEXtVVwMMHbbNHF6wqMrPaIMfkySRhY00kTFg-4ESoZiET6qqToCBy-IYY2yxk1cPws7w-sQjCqfEPr5ELi1XpdCZROwWUUhYcJEzd313A1hSo3-9rGFAqI_GHEYBYRbn3JC1QMITjLY9x15XQn4-IDUJOrp4OCvcRyt9ibTZzzDN6TPuhRBcNHndXTI7ioD0cx-SUmv_RmiffPZJ4ETV9XyOGGMpG88lsbn8edfA5',
        title: 'Mt. Tam ridge sunset',
        meta: 'CA • Oct 2023'
      },
      {
        id: 2,
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ5SsstgskUCwieqs-KROD89BTfhrYGhMtK1c01NgigN8f3SjZzLgPNDv80ZFC0yl_Vd1HMLv5y3c-R5v80Hb0n7v4UqKbLABw1warlY1simhV-exyv-yF9t1XYnMyOLkFTIfewDN9NgX-VunjwTatV8_k11ffgryO2RyvfYykmZaisz8hpxqx4QUGXH7_0YYcZAEEipX3Vh2qQlhRkfO4F9Z_Y_UlI3uJA4l1jqJ6B2eWfSTCxyaX',
        title: 'Midnight tonkotsu run',
        meta: 'LA • Dec 2023'
      },
      {
        id: 3,
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUszmq-hiGxGwPIFTS1IT2sq9qJdhK35PPW2tIyRYZzKXLpzH3_sp-_NJcrlu8491bojonT6A5vuZDEdBtKrcbnda2LaBDLntP1sRaP_jXUfLDr-Vm8_I4O004UWnpfmaqREAXdNjchkt98Ahbuzp54SYEeGSCLU0zKWijhWmfP2CzQUtbVlpBlCHIuBkU-qnWVzKITzH45wdUFSEffNajhlFxpxVLJ4lPyhu0fxqhuKmOiwvIcPJn',
        title: 'Analog highway 1 map',
        meta: 'Big Sur • Mar 2024'
      },
      {
        id: 4,
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbr2BWW6PmKA-1jkvBGqlbR_E5ZE9pagGfseYV7AaHAwIT0OkOHlRzGg1Qv9dB2blhUTm1-bpVdyZpRAfkj6H3EECxr8N8SDJXWCze8mRA4l5qipcFBYv8bGaF9CLgNGDLCaUTBsVCSkAQFIPHUtVBaSBEbaRgQpZTAiyFdOQGeMQzGGOj5PSa1wJNFp89RtREbpzze8eIr3YSBqHPfYl3OFZZu8lzciFOMu4lfyslHFcYmqqlXM8i',
        title: '65% brass plate solder',
        meta: 'SF Studio • May 2024'
      },
      {
        id: 5,
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWrim4uNyG9rSx1U-Nz5c7K4tC0M6UQEEfRso4UlUZPud9PZdeDvdpbpIDTl3tCtZgXu5gOVwK6OV37tfi7D7yUF-Y4TsLfQDmiVtubcQaTkOFOre-F0CSweITevNjqVO-ofcNNXVYrN7X50bbma0TVgPKtxI_Bxdpw1PhEqW-Nldp1O8dV-PQ9ZD5iketegAoIs46r9R22gAj8IO6vkvllToFUnE3VzVfDb_V4UnDgwkHlezdEZsa',
        title: 'Driftwood bonfire night',
        meta: 'Ocean Beach • Aug 2024'
      },
      {
        id: 6,
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUmEZBBNGRw8mRUlWhXfK96EVP7F57EHj9vJYUUJlHYYryBsEHRwTGJZ45vdAM3xPg0kEgzTPlzbvB7MyGPFHkKVKs7Q9t2-Ya7U8Ag6DZaOjZP30LEdsD4ZNdAbcbS59bvicPZTzhtTL7i1HHgmzAy7Y5GmUUhQCOW2VIcEZhb3L89-J7WUIlP17DAJsIs7jkdjHE_lIb_CayKYCJh-nY97sbFjUxl7r0rhXOtoL4TWqgma8hKdgu',
        title: 'Jazz Kissa vinyl LP listening',
        meta: 'Tokyo • Nov 2023'
      }
    ]
  }

  return (
    <div className="max-w-[760px] mx-auto">
      <Header currentPath="/friends" subtitle="35mm point & shoot • diner coffee • highway 1 roadtrips" />

      <div className="cmd-box" id="section-friends">
        <div className="cmd-header">{f.title || 'friends & film'}</div>
        <div className="text-xs text-on-surface-variant font-mono mb-3">
          {f.subtitle || 'good people, roadtrips, and late diner coffee'}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {f.photos?.map((item) => (
            <div
              key={item.id || item.title}
              className="border border-[#b8b6ad] bg-white p-1 rounded-sm hover:border-[#1b1c18] transition-all duration-200"
            >
              <img
                alt={item.title}
                className="w-full aspect-[4/3] object-cover hover:contrast-105 transition-all duration-200"
                src={item.url}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="p-1 text-[11px] text-on-surface leading-tight font-medium">
                {item.title}
              </div>
              <div className="px-1 pb-0.5 text-[9.5px] font-mono text-terminal-prompt">
                {item.meta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
