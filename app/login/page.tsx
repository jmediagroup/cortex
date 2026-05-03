'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';
import {
  AuthShell,
  AuthField,
  authInputStyle,
  authErrorStyle,
  authPrimaryBtn,
  authSecondaryBtn,
} from '@/components/auth/AuthShell';
import { MarketingIcon } from '@/components/marketing/Icons';

function AuthForm() {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const signupHref = useMemo(() => {
    const redirect = searchParams.get('redirect');
    const plan = searchParams.get('plan');
    const billing = searchParams.get('billing');
    const params = new URLSearchParams();
    if (plan) params.set('plan', plan);
    if (billing) params.set('billing', billing);
    // If a redirect was provided, surface plan/billing it carries to signup
    // so the post-signup checkout flow stays intact.
    if (!plan && redirect && redirect.startsWith('/dashboard')) {
      try {
        const url = new URL(redirect, 'http://x');
        const p = url.searchParams.get('plan');
        const b = url.searchParams.get('billing');
        if (p) params.set('plan', p);
        if (b) params.set('billing', b);
      } catch {
        // ignore malformed redirect
      }
    }
    const qs = params.toString();
    return qs ? `/signup?${qs}` : '/signup';
  }, [searchParams]);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
      }
    };
    checkSession();
  }, [router, searchParams, supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      if (data.session) {
        await trackEvent('user_login', {}, true);
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
      }
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string };
      console.error('Auth error:', err);
      setError(e.message || 'An error occurred. Please try again.');
      setLoading(false);
      await trackEvent(
        'error_occurred',
        {
          error_message: e.message ?? 'unknown',
          error_code: e.code || 'unknown',
          context: 'login',
        },
        true,
      );
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setResetEmailSent(true);
      await trackEvent('password_reset_requested', {}, true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Password reset error:', err);
      setError(e.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetEmailSent(false);
    setError(null);
    setPassword('');
  };

  if (resetEmailSent) {
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
            <Mail size={26} />
          </div>
          <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--emerald-500)' }}>
            CHECK YOUR EMAIL
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
            We sent a reset link.
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 16px',
            }}
          >
            We sent a password reset link to{' '}
            <span
              style={{
                color: 'var(--emerald-500)',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {email}
            </span>
            .
          </p>
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              margin: '0 0 24px',
            }}
          >
            The link expires in 24 hours.
          </p>
          <button type="button" onClick={handleBackToLogin} style={authSecondaryBtn}>
            <ArrowLeft size={14} /> Back to sign in
          </button>
        </div>
      </AuthShell>
    );
  }

  if (isForgotPassword) {
    return (
      <AuthShell>
        <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
              Forgot your password?
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', margin: 0 }}>
              Enter your email and we&apos;ll send a reset link.
            </p>
          </div>

          {error && <div style={authErrorStyle}>{error}</div>}

          <AuthField label="Email address" icon={<Mail size={16} />}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              style={authInputStyle}
            />
          </AuthField>

          <button type="submit" disabled={loading} style={{ ...authPrimaryBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Sending...
              </>
            ) : (
              <>
                Send reset link <MarketingIcon name="arrowRight" size={14} />
              </>
            )}
          </button>

          <button type="button" onClick={handleBackToLogin} style={{ ...authSecondaryBtn, alignSelf: 'center' }}>
            <ArrowLeft size={14} /> Back to sign in
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--text-tertiary)' }}>
            WELCOME BACK
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
            Sign in to Cortex.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', margin: 0 }}>
            Pick up where you left off.
          </p>
        </div>

        {error && <div style={authErrorStyle}>{error}</div>}

        <AuthField label="Email address" icon={<Mail size={16} />}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            style={authInputStyle}
            autoComplete="email"
          />
        </AuthField>

        <AuthField label="Password" icon={<Lock size={16} />}>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={authInputStyle}
            minLength={6}
            autoComplete="current-password"
          />
        </AuthField>

        <div style={{ marginTop: -6, textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => setIsForgotPassword(true)}
            style={{ ...authSecondaryBtn, fontSize: 12 }}
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={loading} style={{ ...authPrimaryBtn, opacity: loading ? 0.7 : 1 }}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Signing in...
            </>
          ) : (
            <>
              Sign in <ArrowRight size={16} />
            </>
          )}
        </button>

        <div
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-tertiary)',
            paddingTop: 8,
          }}
        >
          New to Cortex?{' '}
          <Link
            href={signupHref}
            style={{ color: 'var(--emerald-500)', fontWeight: 600, textDecoration: 'none' }}
          >
            Create an account
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export default function AuthPage() {
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
      <AuthForm />
    </Suspense>
  );
}
