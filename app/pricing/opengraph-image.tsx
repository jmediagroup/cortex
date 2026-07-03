import { ImageResponse } from 'next/og';
import { MUTANT_MARK_DATA_URI, BRAND } from '@/lib/brand-assets';

export const runtime = 'edge';

export const alt = 'Money Guy Mutants Pricing - Simple, Honest Pricing';
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
          backgroundColor: BRAND.navy,
          backgroundImage:
            'radial-gradient(ellipse 900px 520px at 85% -5%, rgba(78,201,245,0.30), transparent 60%), radial-gradient(ellipse 700px 500px at 8% 105%, rgba(143,217,206,0.16), transparent 60%)',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '36px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MUTANT_MARK_DATA_URI} width={70} height={72} alt="" style={{ marginRight: '20px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '40px', fontWeight: 800, color: '#ffffff', letterSpacing: '1px', lineHeight: 1 }}>MONEYGUY</span>
            <span style={{ fontSize: '19px', fontWeight: 400, color: '#ffffff', letterSpacing: '13px', marginTop: '5px' }}>MUTANTS</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: '56px', fontWeight: 800, color: '#ffffff', textAlign: 'center', letterSpacing: '-1px', marginBottom: '18px' }}>
          Simple, Honest Pricing
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '28px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: '50px' }}>
          Start free, upgrade when the math matters
        </div>

        {/* Price cards */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>Free</span>
            <span style={{ fontSize: '40px', fontWeight: 800, color: '#ffffff' }}>$0</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 40px',
              borderRadius: '12px',
              backgroundColor: BRAND.sky,
              border: `2px solid ${BRAND.sky}`,
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 700, color: BRAND.navyDeep, marginBottom: '8px' }}>Finance Pro</span>
            <span style={{ fontSize: '40px', fontWeight: 800, color: BRAND.navyDeep }}>$9/mo</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '24px 40px',
              borderRadius: '12px',
              backgroundColor: BRAND.navyDeep,
              border: `2px solid ${BRAND.sky}`,
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 600, color: BRAND.sky, marginBottom: '8px' }}>Elite</span>
            <span style={{ fontSize: '40px', fontWeight: 800, color: '#ffffff' }}>$29/mo</span>
          </div>
        </div>

        {/* URL */}
        <div style={{ position: 'absolute', bottom: '40px', fontSize: '20px', fontWeight: 700, color: BRAND.sky, letterSpacing: '2px' }}>
          MONEYGUYMUTANTS.COM/PRICING
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
