import { ImageResponse } from 'next/og';
import { getOutlookBySlug } from '@/lib/outlook/content';

// Per-post social card for outlook posts. Static params come from the page's
// generateStaticParams, so every slug gets a real branded image at build time
// for shares on X/LinkedIn/iMessage (and AI answer-engine citations).

export const alt = 'Cortex Research — Investment Outlook';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const outlook = await getOutlookBySlug(slug);

  const title = outlook?.title ?? 'Investment Outlook';
  const date = outlook ? formatDate(outlook.date) : '';
  const label = outlook?.type === 'weekly' ? 'WEEKLY OUTLOOK' : 'DAILY OUTLOOK';
  const tickers = outlook?.tickers.slice(0, 6) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#05070A',
          backgroundImage:
            'radial-gradient(ellipse 900px 500px at 50% -10%, rgba(0,240,160,0.22), transparent 60%), radial-gradient(ellipse 600px 500px at 90% 90%, rgba(90,200,250,0.12), transparent 60%)',
          padding: '64px 72px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: '#0A0E14',
                border: '1px solid rgba(0,240,160,0.28)',
                marginRight: '18px',
                boxShadow: '0 0 24px rgba(0,240,160,0.25)',
              }}
            >
              <svg
                width="32"
                height="32"
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
                fontSize: '34px',
                fontWeight: 900,
                color: '#F5F5F7',
                letterSpacing: '-1px',
              }}
            >
              Cortex Research
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: '100px',
              backgroundColor: 'rgba(0,240,160,0.10)',
              border: '1px solid rgba(0,240,160,0.28)',
              color: '#00F0A0',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '2px',
            }}
          >
            {label}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: title.length > 70 ? '44px' : '54px',
              fontWeight: 800,
              color: '#F5F5F7',
              letterSpacing: '-1.5px',
              lineHeight: 1.15,
              maxWidth: '1000px',
            }}
          >
            {title}
          </div>
          {tickers.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              {tickers.map((t) => (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    padding: '8px 18px',
                    borderRadius: '100px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#AEAEB2',
                    fontSize: '20px',
                    fontWeight: 600,
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#8E8E93',
            fontSize: '20px',
            fontWeight: 600,
          }}
        >
          <span>{date}</span>
          <span style={{ letterSpacing: '2px', fontWeight: 700 }}>CORTEX.VIP/THINKING</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
