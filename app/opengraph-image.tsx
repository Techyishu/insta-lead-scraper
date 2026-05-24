import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'LeadMapper — Find Local Business Leads Instantly'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '100px',
            padding: '6px 16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#1D4ED8',
            }}
          />
          <span style={{ color: '#1D4ED8', fontSize: '18px', fontWeight: 600 }}>
            leadmapper.pro
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '68px',
            fontWeight: 800,
            color: '#111827',
            lineHeight: 1.05,
            letterSpacing: '-2px',
            marginBottom: '24px',
          }}
        >
          Find local business
          <br />
          leads{' '}
          <span style={{ color: '#1D4ED8' }}>that convert.</span>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: '24px',
            color: '#6B7280',
            lineHeight: 1.5,
            maxWidth: '720px',
            marginBottom: '48px',
          }}
        >
          Search by keyword + location. Export verified leads — names, phones,
          websites & ratings — to CSV in under 30 seconds.
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '48px' }}>
          {[
            { value: '10M+', label: 'Leads Generated' },
            { value: '50+', label: 'Countries' },
            { value: '< 30s', label: 'Search Time' },
          ].map((stat) => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#111827' }}>
                {stat.value}
              </span>
              <span style={{ fontSize: '16px', color: '#9CA3AF' }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
