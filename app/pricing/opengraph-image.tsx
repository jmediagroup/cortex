import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Cortex Pricing - Simple, Honest Pricing';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            opacity: 0.15,
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#4f46e5',
              marginRight: '20px',
            }}
          >
            <svg
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 18V5" />
              <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4" />
              <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-1px',
            }}
          >
            Cortex
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 900,
            color: 'white',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          Simple, Honest Pricing
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 500,
            color: '#94a3b8',
            textAlign: 'center',
            marginBottom: '50px',
          }}
        >
          Start free, upgrade when the math matters
        </div>

        {/* Price cards */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 40px',
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Free</span>
            <span style={{ fontSize: '40px', fontWeight: 900, color: 'white' }}>$0</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 40px',
              borderRadius: '24px',
              backgroundColor: '#4f46e5',
              border: '2px solid #6366f1',
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#c7d2fe', marginBottom: '8px' }}>Finance Pro</span>
            <span style={{ fontSize: '40px', fontWeight: 900, color: 'white' }}>$9/mo</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 40px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              border: '2px solid #8b5cf6',
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#ddd6fe', marginBottom: '8px' }}>Elite</span>
            <span style={{ fontSize: '40px', fontWeight: 900, color: 'white' }}>$29/mo</span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '20px',
            fontWeight: 700,
            color: '#64748b',
            letterSpacing: '2px',
          }}
        >
          CORTEX.VIP/PRICING
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
