import { ImageResponse } from 'next/og';
import { MUTANT_MARK_DATA_URI, BRAND } from '@/lib/brand-assets';

export const runtime = 'edge';

export const alt = 'Index Fund Growth Visualizer - ETF Returns Simulator';
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
          backgroundColor: BRAND.navy,
          backgroundImage:
            'radial-gradient(ellipse 900px 520px at 85% -5%, rgba(78,201,245,0.30), transparent 60%), radial-gradient(ellipse 700px 500px at 8% 105%, rgba(143,217,206,0.16), transparent 60%)',
          padding: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MUTANT_MARK_DATA_URI} width={58} height={60} alt="" style={{ marginRight: '18px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '30px', fontWeight: 800, color: '#ffffff', letterSpacing: '1px', lineHeight: 1 }}>MONEYGUY</span>
            <span style={{ fontSize: '15px', fontWeight: 400, color: '#ffffff', letterSpacing: '11px', marginTop: '4px' }}>MUTANTS</span>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              backgroundColor: BRAND.mint,
              marginRight: '50px',
            }}
          >
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke={BRAND.navy} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h1 style={{ fontSize: '52px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '20px' }}>
              Index Fund Growth Visualizer
            </h1>
            <p style={{ fontSize: '24px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, maxWidth: '600px' }}>
              Simulate historical returns and volatility for popular ETFs like VOO, VTI, VT, and QQQM.
            </p>
          </div>
        </div>

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
            <span style={{ fontSize: '16px', fontWeight: 700, color: BRAND.mint, textTransform: 'uppercase', letterSpacing: '1px' }}>Free Tool</span>
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: BRAND.sky, letterSpacing: '2px' }}>MONEYGUYMUTANTS.COM</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
