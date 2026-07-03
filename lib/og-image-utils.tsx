import { ImageResponse } from 'next/og';
import { MUTANT_MARK_DATA_URI, BRAND } from './brand-assets';

export const ogImageSize = {
  width: 1200,
  height: 630,
};

interface AppOgImageProps {
  title: string;
  description: string;
  icon: 'calculator' | 'trending-up' | 'wallet' | 'car' | 'landmark' | 'trending-down' | 'map-pin' | 'compass' | 'scale' | 'bar-chart' | 'dices';
  accentColor?: string;
}

const iconPaths: Record<string, string> = {
  'calculator': 'M3 3h18v18H3V3zm3 4v2h4V7H6zm0 4v2h4v-2H6zm0 4v2h4v-2H6zm6-8v2h4V7h-4zm0 4v2h4v-2h-4zm0 4v6h4v-6h-4z',
  'trending-up': 'M23 6l-9.5 9.5-5-5L1 18M23 6h-6m6 0v6',
  'wallet': 'M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4z',
  'car': 'M5 11l1.5-4.5h11L19 11M3 17h2m14 0h2M6.5 17a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM5 11h14v6H5v-6z',
  'landmark': 'M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M4 11h16M12 2l8 6H4l8-6z',
  'trending-down': 'M23 18l-9.5-9.5-5 5L1 6M23 18h-6m6 0v-6',
  'map-pin': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  'compass': 'M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10zm3.5-13.5l-5 2-2 5 5-2 2-5z',
  'scale': 'M12 3v18M8 8L4 8M20 8l-4 0M1 14l6-6M23 14l-6-6M6 18l12 0M6 14a4 4 0 0 1-4-4M18 14a4 4 0 0 0 4-4',
  'bar-chart': 'M12 20V10M18 20V4M6 20v-4',
  'dices': 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-4 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-4 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
};

/**
 * Money Guy Mutants per-tool social card (1200×630): navy field, sky glow,
 * mint icon plate with navy line-icon, mascot + wordmark, white title/subtitle,
 * and the sky domain footer. Matches lib/brand-og-card.tsx.
 */
export function createAppOgImage({ title, description, icon, accentColor = BRAND.mint }: AppOgImageProps) {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BRAND.navy,
          backgroundImage:
            'radial-gradient(ellipse 900px 520px at 85% -5%, rgba(78,201,245,0.30), transparent 60%), radial-gradient(ellipse 700px 500px at 8% 105%, rgba(143,217,206,0.16), transparent 60%)',
          padding: '60px',
        }}
      >
        {/* Top bar: mascot + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MUTANT_MARK_DATA_URI} width={58} height={60} alt="" style={{ marginRight: '18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '30px', fontWeight: 800, color: '#ffffff', letterSpacing: '1px', lineHeight: 1 }}>
              MONEYGUY
            </span>
            <span style={{ fontSize: '15px', fontWeight: 400, color: '#ffffff', letterSpacing: '11px', marginTop: '4px' }}>
              MUTANTS
            </span>
          </div>
        </div>

        {/* Main content area */}
        <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
          {/* Left side: mint icon plate, navy line-icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              backgroundColor: accentColor,
              marginRight: '50px',
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke={BRAND.navy}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={iconPaths[icon] || iconPaths['calculator']} />
            </svg>
          </div>

          {/* Right side: text */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-1px',
                lineHeight: 1.1,
                marginBottom: '20px',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: '24px',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.5,
                maxWidth: '600px',
              }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(143,217,206,0.16)',
              border: '1px solid rgba(143,217,206,0.45)',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: BRAND.mint }} />
            <span style={{ fontSize: '16px', fontWeight: 700, color: BRAND.mint, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Free Tool
            </span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: BRAND.sky, letterSpacing: '2px' }}>
            MONEYGUYMUTANTS.COM
          </span>
        </div>
      </div>
    ),
    {
      ...ogImageSize,
    }
  );
}
