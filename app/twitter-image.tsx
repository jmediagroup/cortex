import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Cortex - Tools for Long-Term Thinking';
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
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            opacity: 0.1,
          }}
        />

        {/* Logo and brand */}
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
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              backgroundColor: '#4f46e5',
              marginRight: '24px',
            }}
          >
            <svg
              width="48"
              height="48"
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
              <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77" />
              <path d="M18 18a4 4 0 0 0 2-7.464" />
              <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517" />
              <path d="M6 18a4 4 0 0 1-2-7.464" />
              <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-2px',
            }}
          >
            Cortex
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 600,
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Tools for thinking clearly about life's biggest decisions.
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '48px',
          }}
        >
          {['Financial Calculators', 'Budget Planning', 'Retirement Tools'].map((feature) => (
            <div
              key={feature}
              style={{
                padding: '12px 24px',
                borderRadius: '100px',
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                border: '1px solid rgba(79, 70, 229, 0.4)',
                color: '#a5b4fc',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {feature}
            </div>
          ))}
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
          CORTEX.VIP
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
