import Link from 'next/link';
import { useCallback, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Wordmark } from '@/components/brand/Wordmark';
import './auth-states.css';

type Props = {
  children: React.ReactNode;
  /** Optional extra content rendered below the security badge. */
  footer?: React.ReactNode;
  /** Success: lift the card out just before a redirect (see useAuthFormStates). */
  leaving?: boolean;
};

/**
 * Auth shell — Money Guy Mutants split-screen: a navy duotone brand panel
 * on the left, a clean white form panel on the right. The brand panel
 * collapses on small screens, where a compact wordmark sits above the form.
 * Light-only (no theme toggle, no aurora/grid/glass).
 */
export function AuthShell({ children, footer, leaving = false }: Props) {
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

          <div className={leaving ? 'mgm-auth__card is-leaving' : 'mgm-auth__card'}>{children}</div>

          <div className="mgm-auth__secure">
            <ShieldCheck size={12} />
            <span>ENCRYPTED · SUPABASE AUTH</span>
          </div>

          <p className="mgm-auth__affiliation">
            An independent, fan-made project — not affiliated with, endorsed by,
            or sponsored by The Money Guy Show or Abound Wealth Management, LLC.
          </p>

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
.mgm-auth__affiliation {
  max-width: 420px;
  margin: -12px 0 0;
  text-align: center;
  color: var(--gray-500);
  font-size: 11px;
  line-height: 1.5;
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
  hint?: React.ReactNode;
  labelColor?: string;
  /**
   * Id of the input inside. Renders a real `<label htmlFor>` so screen
   * readers announce the field name and clicking the label focuses the input.
   * The hint (if any) gets `${id}-hint`; pass that as `aria-describedby`.
   */
  id?: string;
  /** Optional element rendered at the right end of the label row (e.g. a show/hide toggle). */
  trailing?: React.ReactNode;
  /** Plays the one-shot error shake on the field (icon + input together). */
  shaking?: boolean;
  /** Called when the shake finishes, so the class can be removed and replayed later. */
  onShakeEnd?: () => void;
};

/** Id used for a field's hint text, for `aria-describedby`. */
export function authHintId(id: string): string {
  return `${id}-hint`;
}

/** Labelled input wrapper used by login/signup/reset forms. */
export function AuthField({
  label,
  icon,
  children,
  hint,
  labelColor,
  id,
  trailing,
  shaking = false,
  onShakeEnd,
}: FieldProps) {
  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 'var(--tracking-label)',
    color: labelColor ?? 'var(--navy)',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {id ? (
          <label htmlFor={id} style={labelStyle}>
            {label.toUpperCase()}
          </label>
        ) : (
          <span style={labelStyle}>{label.toUpperCase()}</span>
        )}
        {trailing}
      </div>
      <div
        className={shaking ? 'mgm-auth-field__control is-shaking' : 'mgm-auth-field__control'}
        onAnimationEnd={(e) => {
          if (e.animationName === 'mgm-auth-shake') onShakeEnd?.();
        }}
      >
        {icon && (
          <span
            aria-hidden="true"
            className="mgm-auth-field__icon"
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
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
        <span id={id ? authHintId(id) : undefined} style={{ fontSize: 12, color: 'var(--gray-500)' }}>
          {hint}
        </span>
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

/**
 * Error message for an auth form. Fades/rises in on mount (auth-states.css);
 * render it directly under the field it is about. Focusable so the page can
 * move focus to it after a failed submit.
 */
export function AuthAlert({
  id,
  children,
  ref,
  style,
}: {
  id?: string;
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
  style?: React.CSSProperties;
}) {
  return (
    <div
      ref={ref}
      id={id}
      role="alert"
      aria-live="polite"
      tabIndex={-1}
      className="mgm-auth-alert"
      style={{ ...authErrorStyle, outline: 'none', ...style }}
    >
      {children}
    </div>
  );
}

/** Lift-out duration before a success redirect; matches .mgm-auth__card in auth-states.css. */
export const AUTH_LEAVE_MS = 180;

/** 0 when the person prefers reduced motion, otherwise AUTH_LEAVE_MS. */
export function authLeaveDelay(): number {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return AUTH_LEAVE_MS;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : AUTH_LEAVE_MS;
}

/**
 * Visual state for an auth form: which fields are invalid / shaking, and the
 * success lift-out. Purely presentational — the pages keep their own
 * Supabase, Turnstile and redirect logic and just call into this.
 */
export function useAuthFormStates<F extends string>() {
  const [invalid, setInvalid] = useState<ReadonlySet<F>>(() => new Set());
  const [shaking, setShaking] = useState<ReadonlySet<F>>(() => new Set());
  const [leaving, setLeaving] = useState(false);

  /** A submit failed: mark these fields invalid and shake them once. */
  const fail = useCallback((fields: F[]) => {
    setInvalid(new Set(fields));
    setShaking(new Set(fields));
  }, []);

  /** Forget all field errors (start of a new attempt). */
  const reset = useCallback(() => {
    setInvalid(new Set());
    setShaking(new Set());
  }, []);

  /**
   * The person typed in `field`: clear its error. Returns true when no
   * invalid field is left, i.e. the error message can be cleared too.
   * An error that flags several fields at once ("Incorrect email or
   * password") is about the combination, so editing any of them clears all.
   */
  const clear = (field: F): boolean => {
    if (!invalid.has(field)) return invalid.size === 0;
    const next = new Set(invalid);
    if (next.size > 1) next.clear();
    else next.delete(field);
    setInvalid(next);
    setShaking(new Set());
    return next.size === 0;
  };

  const shakeEnd = useCallback((field: F) => {
    setShaking((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  /** Success: lift the card out, then run the navigation (immediately under reduced motion). */
  const leave = useCallback((navigate: () => void) => {
    const delay = authLeaveDelay();
    setLeaving(true);
    if (delay === 0) navigate();
    else window.setTimeout(navigate, delay);
    // Safety net: if the navigation doesn't unmount this page, never leave
    // the card invisible.
    window.setTimeout(() => setLeaving(false), 2000);
  }, []);

  return {
    leaving,
    leave,
    fail,
    reset,
    clear,
    isInvalid: (field: F) => invalid.has(field),
    /** Props for <AuthField> wrapping `field`. */
    fieldProps: (field: F) => ({
      shaking: shaking.has(field),
      onShakeEnd: () => shakeEnd(field),
    }),
  };
}

/** Neutral notice (e.g. "your email is verified, log in to continue"). */
export const authInfoStyle: React.CSSProperties = {
  background: 'rgba(78, 201, 245, 0.12)',
  color: 'var(--navy)',
  border: '1px solid rgba(78, 201, 245, 0.45)',
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
