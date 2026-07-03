import { MUTANT_MARK_DATA_URI, BRAND } from './brand-assets';

/**
 * Shared Money Guy Mutants social card (1200×630) for the root OG + Twitter
 * image routes: navy field, sky glow, mascot + stacked wordmark, tagline,
 * and the domain. Per-surface OG cards (tools, articles, guides) are reskinned
 * in their own phases.
 */
export function BrandOgCard() {
  return (
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
          'radial-gradient(ellipse 900px 520px at 85% -5%, rgba(78,201,245,0.30), transparent 60%), radial-gradient(ellipse 700px 500px at 8% 105%, rgba(143,217,206,0.18), transparent 60%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 36 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MUTANT_MARK_DATA_URI} width={132} height={136} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 92, fontWeight: 800, color: '#ffffff', letterSpacing: 2, lineHeight: 1 }}>
            MONEYGUY
          </span>
          <span style={{ fontSize: 40, fontWeight: 400, color: '#ffffff', letterSpacing: 34, marginTop: 8 }}>
            MUTANTS
          </span>
        </div>
      </div>

      <div style={{ fontSize: 34, fontWeight: 600, color: 'rgba(255,255,255,0.85)', textAlign: 'center', maxWidth: 860, lineHeight: 1.35 }}>
        Financial calculators, guides, and tools to help you build wealth.
      </div>

      <div style={{ position: 'absolute', bottom: 40, fontSize: 20, fontWeight: 700, color: BRAND.sky, letterSpacing: 3 }}>
        MONEYGUYMUTANTS.COM
      </div>
    </div>
  );
}
