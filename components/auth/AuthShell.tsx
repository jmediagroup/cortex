import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Wordmark } from '@/components/brand/Wordmark';

type Props = {
  children: React.ReactNode;
  /** Optional extra content rendered below the security badge. */
  footer?: React.ReactNode;
};

/**
 * Auth shell — Money Guy Mutants split-screen: a navy duotone brand panel
 * on the left, a clean white form panel on the right. The brand panel
 * collapses on small screens, where a compact wordmark sits above the form.
 * Light-only (no theme toggle, no aurora/grid/glass).
 */
export function AuthShell({ children, footer }: Props) {
  return (
    <div className="mgm-auth">
      <style dangerouslySetInnerHTML={{ __html: authShellCss }} />

      {/* Left — navy duotone brand panel */}
      <aside className="mgm-auth__panel">
        <span className="mgm-auth__stripe" aria-hidden="true" />
        <span className="mgm-auth__tint" aria-hidden="true" />
        <div className="mgm-auth__panel-brand">
          <Link href="/" aria-label="Money Guy Mutants home" className="mgm-auth__brandlink">
            <Wordmark tone="white" size="lg" />
          </Link>
        </div>
        <div className="mgm-auth__panel-content">
          <h2 className="mgm-auth__headline">Build wealth on purpose.</h2>
          <p className="mgm-auth__quote">
            No jargon, no gatekeeping — just the math, the plan, and a crew of
            Mutants who&apos;ve got your back.
          </p>
          <p className="mgm-auth__attrib">— The Money Guy Mutants</p>
          <div className="mgm-auth__stats">
            <div>
              <div className="mgm-auth__stat-n">250k+</div>
              <div className="mgm-auth__stat-l">Mutants</div>
            </div>
            <div>
              <div className="mgm-auth__stat-n">4.9★</div>
              <div className="mgm-auth__stat-l">App rating</div>
            </div>
            <div>
              <div className="mgm-auth__stat-n">Free</div>
              <div className="mgm-auth__stat-l">To start</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right — clean white form panel */}
      <main className="mgm-auth__form">
        <div className="mgm-auth__form-inner">
          <Link
            href="/"
            aria-label="Money Guy Mutants home"
            className="mgm-auth__form-brand"
          >
            <Wordmark size="sm" />
          </Link>

          <div className="mgm-auth__card">{children}</div>

          <div className="mgm-auth__secure">
            <ShieldCheck size={12} />
            <span>ENCRYPTED · SUPABASE AUTH</span>
          </div>

          {footer}
        </div>
      </main>
    </div>
  );
}

const authShellCss = `
.mgm-auth {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  min-height: 100dvh;
  background: var(--off-white);
}
.mgm-auth__panel {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: clamp(2rem, 4vw, 3.5rem);
  padding-top: calc(clamp(2rem, 4vw, 3.5rem) + var(--safe-top, 0px));
  background: var(--navy-deep);
}
.mgm-auth__stripe {
  position: absolute;
  inset: 0;
  background-color: var(--navy);
  background-image: repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 16px, rgba(255,255,255,0) 16px 32px);
}
.mgm-auth__tint {
  position: absolute;
  inset: 0;
  background: var(--sky);
  mix-blend-mode: screen;
  opacity: .14;
}
.mgm-auth__panel-brand { position: relative; z-index: 1; }
.mgm-auth__brandlink { display: inline-flex; text-decoration: none; }
.mgm-auth__panel-content { position: relative; z-index: 1; margin-top: auto; }
.mgm-auth__headline {
  color: #fff;
  font-size: clamp(1.8rem, 1.2rem + 1.8vw, 2.75rem);
  line-height: 1.15;
  letter-spacing: -0.01em;
  font-weight: 700;
  margin: 0 0 16px;
  max-width: 16ch;
}
.mgm-auth__quote { color: rgba(255,255,255,.85); font-size: 17px; line-height: 1.55; max-width: 40ch; margin: 0; }
.mgm-auth__attrib { color: var(--sky); font-size: 14px; font-weight: 700; margin: 16px 0 0; }
.mgm-auth__stats { display: flex; gap: 32px; margin-top: 36px; }
.mgm-auth__stat-n { color: #fff; font-size: 28px; font-weight: 700; line-height: 1; }
.mgm-auth__stat-l { color: rgba(255,255,255,.7); font-size: 13px; margin-top: 4px; }

.mgm-auth__form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1.5rem, 4vw, 3rem);
  background: var(--white);
}
.mgm-auth__form-inner {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}
.mgm-auth__form-brand { display: none; }
.mgm-auth__card { width: 100%; }
.mgm-auth__secure {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--gray-500);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

@media (max-width: 860px) {
  .mgm-auth { grid-template-columns: 1fr; }
  .mgm-auth__panel { display: none; }
  .mgm-auth__form-brand { display: inline-flex; text-decoration: none; margin-bottom: 8px; }
}
`;

type FieldProps = {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
  labelColor?: string;
};

/** Labelled input wrapper used by login/signup/reset forms. */
export function AuthField({ label, icon, children, hint, labelColor }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-label)',
          color: labelColor ?? 'var(--navy)',
        }}
      >
        {label.toUpperCase()}
      </span>
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray-500)',
              display: 'inline-flex',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
        {children}
      </div>
      {hint && (
        <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{hint}</span>
      )}
    </div>
  );
}

/** Left padding for an .mgm-input that carries a leading icon. */
export const authInputWithIcon: React.CSSProperties = { paddingLeft: 42 };

export const authErrorStyle: React.CSSProperties = {
  background: 'var(--crimson-tint)',
  color: 'var(--crimson-500)',
  border: '1px solid var(--crimson-border)',
  borderRadius: 'var(--radius-sm)',
  padding: '12px 14px',
  fontSize: 13,
  fontWeight: 600,
};

export const authSuccessStyle: React.CSSProperties = {
  background: 'var(--emerald-tint)',
  color: 'var(--teal-green)',
  border: '1px solid var(--emerald-border)',
  borderRadius: 'var(--radius-sm)',
  padding: '12px 14px',
  fontSize: 13,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

/** Inline text link / action (orange by default; override color for back-links). */
export const authLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  background: 'transparent',
  color: 'var(--orange)',
  border: 0,
  padding: 0,
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
  textDecoration: 'none',
};
