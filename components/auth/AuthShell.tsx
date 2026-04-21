import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { LogoMark } from '@/components/marketing/Nav';

type Props = {
  children: React.ReactNode;
  /** Optional extra content rendered below the security badge. */
  footer?: React.ReactNode;
};

/**
 * Auth shell — aurora + grid background with a centered frosted-glass
 * card. Force-dark subtree so sign-in / sign-up / reset flows always
 * look like the product, regardless of the user's marketing theme.
 */
export function AuthShell({ children, footer }: Props) {
  return (
    <div
      data-theme="dark"
      className="hero-gradient grid-bg"
      style={{
        minHeight: '100vh',
        padding: '48px 16px',
        background: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      <Link
        href="/"
        aria-label="Cortex home"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          marginBottom: 8,
        }}
      >
        <LogoMark size={36} iconSize={19} />
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
        >
          Cortex
        </span>
      </Link>

      <div
        style={{
          width: '100%',
          maxWidth: 460,
          position: 'relative',
          background: 'var(--bg-glass-strong)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border-strong)',
          borderRadius: 'var(--radius-2xl)',
          padding: 32,
          boxShadow: 'var(--shadow-elevated), var(--shadow-inset-top)',
        }}
      >
        {children}
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--text-muted)',
        }}
      >
        <ShieldCheck size={12} />
        <span
          className="eyebrow"
          style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}
        >
          ENCRYPTED · SUPABASE AUTH
        </span>
      </div>

      {footer}
    </div>
  );
}

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span
        className="eyebrow"
        style={{ fontSize: 10, color: labelColor ?? 'var(--text-tertiary)', margin: 0 }}
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
              color: 'var(--text-tertiary)',
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
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</span>
      )}
    </div>
  );
}

export const authInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px 12px 40px',
  background: 'var(--bg-glass)',
  border: '1px solid var(--border-default)',
  borderRadius: 12,
  color: 'var(--text-primary)',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
};

export const authErrorStyle: React.CSSProperties = {
  background: 'var(--crimson-tint)',
  color: 'var(--crimson-500)',
  border: '1px solid var(--crimson-border)',
  borderRadius: 'var(--radius-md)',
  padding: '12px 14px',
  fontSize: 13,
  fontWeight: 500,
};

export const authSuccessStyle: React.CSSProperties = {
  background: 'var(--emerald-tint)',
  color: 'var(--emerald-500)',
  border: '1px solid var(--emerald-border)',
  borderRadius: 'var(--radius-md)',
  padding: '12px 14px',
  fontSize: 13,
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
};

export const authPrimaryBtn: React.CSSProperties = {
  width: '100%',
  background: 'var(--emerald-500)',
  color: 'var(--text-inverse)',
  border: 0,
  padding: '14px 20px',
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  boxShadow: '0 0 0 1px var(--cta-glow-ring), 0 0 32px var(--cta-glow-soft)',
  transition: 'all 160ms',
};

export const authSecondaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  background: 'transparent',
  color: 'var(--emerald-500)',
  border: 0,
  padding: 0,
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: 'inherit',
  textDecoration: 'none',
};
