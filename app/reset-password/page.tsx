'use client';

import { Suspense, useEffect, useState } from 'react';
import { ArrowRight, Check, Loader2, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';
import {
  AuthShell,
  AuthField,
  authInputStyle,
  authErrorStyle,
  authPrimaryBtn,
} from '@/components/auth/AuthShell';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session && !window.location.hash.includes('type=recovery')) {
        router.push('/login');
      }
    })();
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
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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
      setError(e.message || 'Failed to reset password. Please try again.');
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
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-md)',
              background: 'var(--emerald-tint)',
              border: '1px solid var(--emerald-border)',
              color: 'var(--emerald-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px var(--cta-glow-soft)',
            }}
          >
            <Check size={26} />
          </div>
          <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--emerald-500)' }}>
            DONE
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 12px',
            }}
          >
            Password updated.
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 20px',
            }}
          >
            Redirecting you to your dashboard...
          </p>
          <Loader2 className="animate-spin" size={20} color="var(--emerald-500)" />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--text-tertiary)' }}>
            RESET PASSWORD
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 8px',
            }}
          >
            Set a new password.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', margin: 0 }}>
            Enter your new password below.
          </p>
        </div>

        {error && <div style={authErrorStyle}>{error}</div>}

        <AuthField
          label="New password"
          icon={<Lock size={16} />}
          hint="Minimum 6 characters."
        >
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={authInputStyle}
            minLength={6}
            autoComplete="new-password"
          />
        </AuthField>

        <AuthField label="Confirm new password" icon={<Lock size={16} />}>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            style={authInputStyle}
            minLength={6}
            autoComplete="new-password"
          />
        </AuthField>

        <button type="submit" disabled={loading} style={{ ...authPrimaryBtn, opacity: loading ? 0.7 : 1 }}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Updating...
            </>
          ) : (
            <>
              Reset password <ArrowRight size={16} />
            </>
          )}
        </button>
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
