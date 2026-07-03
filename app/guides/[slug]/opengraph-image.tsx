import { ImageResponse } from 'next/og';
import { getGuideBySlug } from '@/lib/guides/content';
import { MUTANT_MARK_DATA_URI, BRAND } from '@/lib/brand-assets';

// Per-guide social card. Static params come from the page's
// generateStaticParams, so every slug gets a real branded image at build time
// for shares on X/LinkedIn/iMessage (and AI answer-engine citations).

export const alt = 'Money Guy Mutants Guides — Personal Finance, Explained';
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
  const guide = await getGuideBySlug(slug);

  const title = guide?.title ?? 'Personal Finance Guide';
  const date = guide ? formatDate(guide.date) : '';
  const label = guide?.category ?? 'GUIDE';
  const tags = guide?.tags.slice(0, 6) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: BRAND.navy,
          backgroundImage:
            'radial-gradient(ellipse 900px 520px at 85% -5%, rgba(78,201,245,0.30), transparent 60%), radial-gradient(ellipse 700px 500px at 8% 105%, rgba(143,217,206,0.16), transparent 60%)',
          padding: '64px 72px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MUTANT_MARK_DATA_URI} width={56} height={58} alt="" style={{ marginRight: '18px' }} />
            <span style={{ fontSize: '34px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
              Money Guy Mutants Guides
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(78,201,245,0.12)',
              border: `1px solid ${BRAND.sky}`,
              color: BRAND.sky,
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '2px',
            }}
          >
            {label.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: title.length > 70 ? '44px' : '54px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-1px',
              lineHeight: 1.15,
              maxWidth: '1000px',
            }}
          >
            {title}
          </div>
          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              {tags.map((t) => (
                <div
                  key={t}
                  style={{
                    display: 'flex',
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    color: '#ffffff',
                    fontSize: '20px',
                    fontWeight: 600,
                  }}
                >
                  #{t}
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
            color: 'rgba(255,255,255,0.75)',
            fontSize: '20px',
            fontWeight: 600,
          }}
        >
          <span>{date}</span>
          <span style={{ letterSpacing: '2px', fontWeight: 700, color: BRAND.sky }}>MONEYGUYMUTANTS.COM/GUIDES</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
