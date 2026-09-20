'use client';

import { Suspense, useEffect, useState } from 'react';
import { ArrowRight, Check, Loader2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';
import {
  AuthShell,
  AuthField,
  authHintId,
  authInputWithIcon,
  authErrorStyle,
} from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { checkPassword, MIN_PASSWORD_LENGTH, PASSWORD_HINT } from '@/lib/password-policy';
import { friendlyResetError } from '@/lib/auth-errors';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

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

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    // Same policy as signup, so a reset can't set a weaker password.
    const check = checkPassword(password);
    if (!check.ok) {
      setError(check.message);
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      await trackEvent('password_reset_completed', {}, true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Password reset error:', err);
      setError(friendlyResetError(e));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell>
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

  return (
    <AuthShell>
      <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

        {error && (
          <div role="alert" style={authErrorStyle}>
            {error}
          </div>
        )}

        <AuthField
          id="reset-new-password"
          label="New password"
          icon={<Lock size={16} />}
          hint={PASSWORD_HINT}
        >
          <input
            id="reset-new-password"
            name="new-password"
            aria-describedby={authHintId('reset-new-password')}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mgm-input"
            style={authInputWithIcon}
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
          />
        </AuthField>

        <AuthField id="reset-confirm-password" label="Confirm new password" icon={<Lock size={16} />}>
          <input
            id="reset-confirm-password"
            name="confirm-password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="mgm-input"
            style={authInputWithIcon}
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
          />
        </AuthField>

        <Button variant="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? (
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
