import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Gambling Spend Redirect Calculator - See Your Money\'s True Potential';
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
          backgroundColor: '#0f172a',
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          padding: '60px',
        }}
      >
        {/* Decorative accent circle */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            opacity: 0.2,
          }}
        />

        {/* Top bar with Cortex branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#4f46e5',
              marginRight: '16px',
            }}
          >
            <svg
              width="28"
              height="28"
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
              fontSize: '28px',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '-0.5px',
            }}
          >
            Cortex
          </span>
        </div>

        {/* Main content area */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
          }}
        >
          {/* Left side: Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '160px',
              height: '160px',
              borderRadius: '40px',
              backgroundColor: '#10b981',
              marginRight: '50px',
              boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.4)',
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <circle cx="8" cy="8" r="1.5" fill="white" />
              <circle cx="16" cy="8" r="1.5" fill="white" />
              <circle cx="8" cy="16" r="1.5" fill="white" />
              <circle cx="16" cy="16" r="1.5" fill="white" />
              <circle cx="12" cy="12" r="1.5" fill="white" />
            </svg>
          </div>

          {/* Right side: Text */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            <h1
              style={{
                fontSize: '52px',
                fontWeight: 900,
                color: 'white',
                letterSpacing: '-2px',
                lineHeight: 1.1,
                marginBottom: '20px',
              }}
            >
              Gambling Spend Redirect Calculator
            </h1>
            <p
              style={{
                fontSize: '24px',
                fontWeight: 500,
                color: '#94a3b8',
                lineHeight: 1.5,
                maxWidth: '600px',
              }}
            >
              See what your money could become if invested instead. Visualize the wealth gap between betting and building.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '100px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
              }}
            />
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#10b981',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              Free Tool
            </span>
          </div>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#64748b',
              letterSpacing: '2px',
            }}
          >
            CORTEX.VIP
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
