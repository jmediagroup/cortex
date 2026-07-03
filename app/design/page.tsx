import type { Metadata } from 'next';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const metadata: Metadata = {
  title: 'Design tokens · Money Guy Mutants',
  robots: { index: false, follow: false },
};

const emeraldScale = ['50', '100', '200', '400', '500', '600', '700'] as const;
const crimsonScale = ['50', '100', '200', '400', '500', '600'] as const;
const mistScale = ['50', '100', '200', '300', '400', '500', '600', '700', '800'] as const;
const obsidianScale = ['400', '500', '600', '700', '800', '900', '950'] as const;
const radii = [
  { name: 'xs', value: '6px' },
  { name: 'sm', value: '10px' },
  { name: 'md', value: '14px' },
  { name: 'lg', value: '20px' },
  { name: 'xl', value: '24px' },
  { name: '2xl', value: '32px' },
  { name: '3xl', value: '40px' },
  { name: 'full', value: '9999px' },
] as const;
const shadows = [
  { name: 'card', var: 'var(--shadow-card)' },
  { name: 'card-hover', var: 'var(--shadow-card-hover)' },
  { name: 'elevated', var: 'var(--shadow-elevated)' },
  { name: 'emerald glow', var: 'var(--emerald-glow)' },
  { name: 'crimson glow', var: 'var(--crimson-glow)' },
] as const;

function Swatch({ label, color, token }: { label: string; color: string; token: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        style={{
          height: 72,
          background: color,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
        <code
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-tertiary)',
          }}
        >
          {token}
        </code>
      </div>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="h2">{title}</h2>
      </header>
      {children}
    </section>
  );
}

export default function DesignTokensPage() {
  return (
    <main
      className="hero-gradient grid-bg"
      style={{
        minHeight: '100vh',
        padding: '64px 32px 128px',
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 64,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="eyebrow">DESIGN SYSTEM · PHASE 1</span>
          <h1 className="h-hero" style={{ margin: 0 }}>
            Tokens, type, <span className="gradient-text">and theme.</span>
          </h1>
          <p className="body" style={{ maxWidth: 560 }}>
            Internal preview of the Money Guy Mutants token system. Every surface, color,
            type scale, radius, and shadow rendered in the current theme.
            Toggle to verify light-mode parity.
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* Typography */}
      <Section eyebrow="TYPE" title="Scale">
        <div
          className="glass-card"
          style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
        >
          <div className="h-hero">Think clearly.</div>
          <div className="h-display balance-hero">$248,513.02</div>
          <h1 className="h1">Heading 1 — 28px bold</h1>
          <h2 className="h2">Heading 2 — 22px semi</h2>
          <h3 className="h3">Heading 3 — 18px semi</h3>
          <p className="body">
            Body — 16px regular. Interactive financial models that turn complexity into clarity,
            so you can see outcomes before you live them.
          </p>
          <p className="body-sm">Body small — 14px regular, secondary text.</p>
          <span className="eyebrow">EYEBROW — 11PX 600 TRACKED</span>
          <code className="mono">Mono 14 · tabular nums 1,234,567.89</code>
        </div>
      </Section>

      {/* Surfaces */}
      <Section eyebrow="SURFACES" title="Backgrounds, cards, glass">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
          }}
        >
          <Swatch label="canvas" color="var(--bg-canvas)" token="--bg-canvas" />
          <Swatch label="page" color="var(--bg-page)" token="--bg-page" />
          <Swatch label="section" color="var(--bg-section)" token="--bg-section" />
          <Swatch label="card" color="var(--bg-card)" token="--bg-card" />
          <Swatch label="card hover" color="var(--bg-card-hover)" token="--bg-card-hover" />
          <Swatch label="raised" color="var(--bg-raised)" token="--bg-raised" />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          <div
            className="glass-card"
            style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <span className="eyebrow">GLASS</span>
            <p className="body-sm" style={{ margin: 0 }}>
              bg-glass + 20px blur + inset hairline
            </p>
          </div>
          <div
            className="glass-card glass-card--strong"
            style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <span className="eyebrow">GLASS STRONG</span>
            <p className="body-sm" style={{ margin: 0 }}>
              bg-glass-strong, higher opacity
            </p>
          </div>
        </div>
      </Section>

      {/* Emerald */}
      <Section eyebrow="COLOR · EMERALD" title="Electric Emerald — positive / save">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 16,
          }}
        >
          {emeraldScale.map((step) => (
            <Swatch
              key={step}
              label={`emerald-${step}`}
              color={`var(--emerald-${step})`}
              token={`--emerald-${step}`}
            />
          ))}
        </div>
      </Section>

      {/* Crimson */}
      <Section eyebrow="COLOR · CRIMSON" title="Crimson Pulse — negative / debt">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 16,
          }}
        >
          {crimsonScale.map((step) => (
            <Swatch
              key={step}
              label={`crimson-${step}`}
              color={`var(--crimson-${step})`}
              token={`--crimson-${step}`}
            />
          ))}
        </div>
      </Section>

      {/* Mist & Obsidian */}
      <Section eyebrow="COLOR · NEUTRALS" title="Silver Mist + Obsidian">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 12,
          }}
        >
          {mistScale.map((step) => (
            <Swatch
              key={step}
              label={`mist-${step}`}
              color={`var(--mist-${step})`}
              token={`--mist-${step}`}
            />
          ))}
          {obsidianScale.map((step) => (
            <Swatch
              key={step}
              label={`obsidian-${step}`}
              color={`var(--obsidian-${step})`}
              token={`--obsidian-${step}`}
            />
          ))}
        </div>
      </Section>

      {/* Semantic */}
      <Section eyebrow="COLOR · SEMANTIC" title="Positive, negative, warning, info">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
          }}
        >
          <Swatch label="positive" color="var(--color-positive)" token="--color-positive" />
          <Swatch label="negative" color="var(--color-negative)" token="--color-negative" />
          <Swatch label="warning" color="var(--color-warning)" token="--color-warning" />
          <Swatch label="info" color="var(--color-info)" token="--color-info" />
        </div>
      </Section>

      {/* Radii */}
      <Section eyebrow="RADII" title="Corner scale">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 16,
          }}
        >
          {radii.map((r) => (
            <div key={r.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  height: 88,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: `var(--radius-${r.name})`,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {r.name}
                </span>
                <code
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {r.value}
                </code>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Shadows */}
      <Section eyebrow="SHADOWS" title="Depth + glow">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 24,
            padding: 24,
            background: 'var(--bg-page)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          {shadows.map((s) => (
            <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  height: 88,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: s.var,
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Buttons (canonical markup from comp-buttons.html) */}
      <Section eyebrow="COMPONENTS" title="Buttons">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button
            type="button"
            style={{
              background: 'var(--emerald-500)',
              color: 'var(--text-inverse)',
              border: 0,
              padding: '13px 24px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 14,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 0 0 1px var(--cta-glow-ring), 0 0 32px var(--cta-glow-soft)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Save $250 →
          </button>
          <button
            type="button"
            style={{
              background: 'var(--crimson-500)',
              color: '#fff',
              border: 0,
              padding: '13px 24px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 14,
              boxShadow: 'var(--crimson-glow)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Pay Debt
          </button>
          <button
            type="button"
            style={{
              background: 'var(--bg-glass)',
              color: 'var(--text-primary)',
              border: '1px solid var(--glass-border-strong)',
              padding: '13px 24px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: 14,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            style={{
              background: 'transparent',
              color: 'var(--emerald-500)',
              border: '1px solid var(--emerald-border)',
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Ghost Emerald
          </button>
        </div>
      </Section>

      {/* Smart Amount input (canonical markup from comp-input.html) */}
      <Section eyebrow="COMPONENTS" title="Inputs + Smart Amount">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          <div>
            <label
              htmlFor="d-email"
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--mist-400)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              Email
            </label>
            <input
              id="d-email"
              defaultValue="aria@cortex.vip"
              style={{
                width: '100%',
                padding: '13px 14px',
                border: '1px solid var(--border-default)',
                borderRadius: 12,
                fontSize: 14,
                fontFamily: 'inherit',
                color: 'var(--text-primary)',
                background: 'var(--bg-glass)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="d-transfer"
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--emerald-500)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              Transfer to savings
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--emerald-500)',
                  fontSize: 18,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                }}
              >
                $
              </span>
              <input
                id="d-transfer"
                defaultValue="2,500.00"
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 30px',
                  border: '1px solid var(--emerald-border)',
                  borderRadius: 12,
                  fontSize: 18,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  background: 'var(--emerald-wash)',
                  outline: 'none',
                  boxShadow:
                    '0 0 0 4px var(--emerald-50), 0 0 24px var(--emerald-100)',
                }}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Deltas */}
      <Section eyebrow="STATUS CHIPS" title="Positive + negative deltas">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span className="delta-up mono">↑ $4,218 · 1.72%</span>
          <span className="delta-down mono">↓ $312 · 0.44%</span>
        </div>
      </Section>

      <footer style={{ marginTop: 32, color: 'var(--text-tertiary)', fontSize: 12 }}>
        Not indexed · Internal preview. Delete before go-live in Phase 5.
      </footer>
    </main>
  );
}
