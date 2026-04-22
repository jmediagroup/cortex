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
          backgroundColor: '#05070A',
          backgroundImage:
            'radial-gradient(ellipse 900px 500px at 50% -10%, rgba(0,240,160,0.22), transparent 60%), radial-gradient(ellipse 600px 500px at 90% 90%, rgba(90,200,250,0.12), transparent 60%)',
        }}
      >
        {/* subtle grid mask */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)',
          }}
        />

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
              backgroundColor: '#0A0E14',
              border: '1px solid rgba(0,240,160,0.28)',
              marginRight: '24px',
              boxShadow: '0 0 24px rgba(0,240,160,0.25)',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00F0A0"
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
              color: '#F5F5F7',
              letterSpacing: '-2px',
            }}
          >
            Cortex
          </span>
        </div>

        <div
          style={{
            fontSize: '36px',
            fontWeight: 600,
            color: '#AEAEB2',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Tools for thinking clearly about life&apos;s biggest decisions.
        </div>

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
                backgroundColor: 'rgba(0,240,160,0.10)',
                border: '1px solid rgba(0,240,160,0.28)',
                color: '#00F0A0',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '20px',
            fontWeight: 700,
            color: '#8E8E93',
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
