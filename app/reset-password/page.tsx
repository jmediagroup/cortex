'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Loader2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';
import {
  AuthShell,
  AuthField,
  AuthAlert,
  useAuthFormStates,
  authHintId,
  authInputWithIcon,
  authLeaveDelay,
} from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { checkPassword, MIN_PASSWORD_LENGTH, PASSWORD_HINT } from '@/lib/password-policy';
import { friendlyResetError } from '@/lib/auth-errors';

type ResetField = 'password' | 'confirm';

/** Which field a failed password update is about (weak / same password → the new one). */
function resetErrorFields(e: { message?: string; code?: string }): ResetField[] {
  const code = e.code ?? '';
  const msg = (e.message ?? '').toLowerCase();
  if (code === 'session_expired' || code === 'session_not_found' || msg.includes('session')) return [];
  if (code === 'over_email_send_rate_limit' || msg.includes('rate limit')) return [];
  if (code === 'same_password' || code === 'weak_password' || msg.includes('password')) return ['password'];
  return [];
}

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();
  const errorRef = useRef<HTMLDivElement | null>(null);
  const fields = useAuthFormStates<ResetField>();
  const busy = loading || fields.leaving;

  // Typing in a field clears its error; the message goes once no field is left flagged.
  const onFieldInput = (field: ResetField) => {
    if (error && fields.clear(field)) setError(null);
  };

  // Move focus to the error so keyboard and screen-reader users hear it.
  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus();
  }, [error]);

  // The recovery link is exchanged for a session by /auth/callback before we
  // land here. No session means the link was never exchanged (expired, or
  // opened directly) — send them back to request a new one.
  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (active && !user) {
        router.replace('/login?notice=link_expired&mode=reset');
      }
    })();
    return () => {
      active = false;
    };
  }, [router, supabase]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    fields.reset();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      fields.fail(['confirm']);
      setLoading(false);
      return;
    }
    // Same policy as signup, so a reset can't set a weaker password.
    const check = checkPassword(password);
    if (!check.ok) {
      setError(check.message);
      fields.fail(['password']);
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      await trackEvent('password_reset_completed', {}, true);
      // Same 1.5s on the success screen; the card lifts out over the last 180ms.
      setTimeout(() => fields.leave(() => router.push('/dashboard')), 1500 - authLeaveDelay());
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string };
      console.error('Password reset error:', err);
      setError(friendlyResetError(e));
      fields.fail(resetErrorFields(e));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell leaving={fields.leaving}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              margin: '0 auto 20px',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--emerald-tint)',
              color: 'var(--teal-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={28} />
          </div>
          <div className="mgm-eyebrow" style={{ marginBottom: 10 }}>
            ALL SET
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--navy)',
              letterSpacing: '-0.01em',
              margin: '0 0 12px',
            }}
          >
            Password updated.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 20px',
            }}
          >
            Redirecting you to your dashboard…
          </p>
          <Loader2 className="animate-spin" size={20} color="var(--sky)" />
        </div>
      </AuthShell>
    );
  }

  const errorBanner = error ? (
    <AuthAlert ref={errorRef} id="reset-error">
      {error}
    </AuthAlert>
  ) : null;
  // Under the new-password field when only it is flagged, otherwise under the last field.
  const errorUnderPassword = fields.isInvalid('password') && !fields.isInvalid('confirm');

  return (
    <AuthShell>
      <form
        onSubmit={handleResetPassword}
        className={busy ? 'mgm-auth-form busy' : 'mgm-auth-form'}
        aria-busy={busy}
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <div>
          <div className="mgm-eyebrow" style={{ marginBottom: 10 }}>
            NEW PASSWORD
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--navy)',
              letterSpacing: '-0.01em',
              margin: '0 0 8px',
            }}
          >
            Set a new password.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>
            Enter your new password below.
          </p>
        </div>

        <AuthField
          id="reset-new-password"
          label="New password"
          icon={<Lock size={16} />}
          hint={PASSWORD_HINT}
          {...fields.fieldProps('password')}
        >
          <input
            id="reset-new-password"
            name="new-password"
            aria-describedby={
              fields.isInvalid('password')
                ? `${authHintId('reset-new-password')} reset-error`
                : authHintId('reset-new-password')
            }
            aria-invalid={fields.isInvalid('password')}
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              onFieldInput('password');
            }}
            placeholder="••••••••"
            className="mgm-input"
            style={authInputWithIcon}
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
          />
        </AuthField>

        {errorUnderPassword && errorBanner}

        <AuthField
          id="reset-confirm-password"
          label="Confirm new password"
          icon={<Lock size={16} />}
          {...fields.fieldProps('confirm')}
        >
          <input
            id="reset-confirm-password"
            name="confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              onFieldInput('confirm');
            }}
            aria-invalid={fields.isInvalid('confirm')}
            aria-describedby={fields.isInvalid('confirm') ? 'reset-error' : undefined}
            placeholder="••••••••"
            className="mgm-input"
            style={authInputWithIcon}
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
          />
        </AuthField>

        {!errorUnderPassword && errorBanner}

        <Button variant="primary" type="submit" disabled={busy} style={{ width: '100%' }}>
          {busy ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Updating…
            </>
          ) : (
            <>
              Reset password <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
              color: 'var(--text-tertiary)',
            }}
          >
            <Loader2 className="animate-spin" size={24} />
          </div>
        </AuthShell>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
