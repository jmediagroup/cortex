import { MarketingIcon, type MarketingIconName } from './Icons';

type Beat = {
  stance: string;
  pivot: string;
  icon: MarketingIconName;
};

const BEATS: Beat[] = [
  {
    stance: 'Most advice is static.',
    pivot: 'Money Guy Mutants is interactive, scenario-based, and personal.',
    icon: 'pulse',
  },
  {
    stance: 'Most tools give answers.',
    pivot: 'Money Guy Mutants gives context.',
    icon: 'compass',
  },
  {
    stance: 'Most platforms optimize for engagement.',
    pivot: 'Money Guy Mutants optimizes for clarity.',
    icon: 'orbit',
  },
];

export function MarketingPhilosophy() {
  return (
    <section
      id="thinking"
      style={{
        position: 'relative',
        padding: '120px 24px',
        background: 'var(--bg-section)',
        borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)',
        scrollMarginTop: 64,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="mgm-eyebrow" style={{ marginBottom: 16 }}>
          HOW WE THINK
        </div>
        <h2
          style={{
            fontSize: 'clamp(32px,4.5vw,52px)',
            fontWeight: 700,
            color: 'var(--navy)',
            letterSpacing: '-0.025em',
            margin: '0 0 64px',
            lineHeight: 1.1,
            maxWidth: 780,
          }}
        >
          The goal isn&apos;t prediction.
          <br />
          <span style={{ color: 'var(--gray-500)' }}>The goal is </span>
          <span style={{ color: 'var(--navy)' }}>better judgment.</span>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: 20,
          }}
        >
          {BEATS.map((b) => (
            <div
              key={b.pivot}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)',
                padding: 28,
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-circle)',
                  background: 'var(--mint)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--navy)',
                  marginBottom: 24,
                }}
              >
                <MarketingIcon name={b.icon} size={18} />
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  textDecoration: 'line-through',
                  textDecorationColor: 'var(--crimson-500)',
                  marginBottom: 12,
                  fontWeight: 400,
                }}
              >
                {b.stance}
              </div>
              <div
                style={{
                  fontSize: 17,
                  color: 'var(--navy)',
                  fontWeight: 600,
                  lineHeight: 1.45,
                  letterSpacing: '-0.01em',
                }}
              >
                {b.pivot}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
