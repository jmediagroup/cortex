'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Loader2, Lock, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  AuthShell,
  AuthField,
  authInputStyle,
  authErrorStyle,
  authSuccessStyle,
  authPrimaryBtn,
  authSecondaryBtn,
} from '@/components/auth/AuthShell';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupComplete, setSignupComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');
  const hasProIntent = plan === 'finance_pro' || plan === 'pro';

  const dashboardRedirect = useMemo(() => {
    if (!hasProIntent) return '/dashboard';
    const params = new URLSearchParams({ plan: 'finance_pro' });
    if (billing === 'annual' || billing === 'monthly') params.set('billing', billing);
    return `/dashboard?${params.toString()}`;
  }, [hasProIntent, billing]);

  const signInHref = useMemo(() => {
    if (!hasProIntent) return '/login';
    return `/login?redirect=${encodeURIComponent(dashboardRedirect)}`;
  }, [hasProIntent, dashboardRedirect]);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.push(dashboardRedirect);
    })();
  }, [router, supabase, dashboardRedirect]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${dashboardRedirect}`,
        },
      });
      if (signUpError) throw signUpError;
      if (data.user) {
        try {
          await fetch('/api/create-user-record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: data.user.id, email: data.user.email || '' }),
          });
        } catch (insertErr) {
          console.error('Error creating user record:', insertErr);
        }
        setUserEmail(email);
        setSignupComplete(true);
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Signup error:', err);
      setError(e.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setResendSuccess(false);
    setError(null);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });
      if (resendError) throw resendError;
      setResendSuccess(true);
      setResendCooldown(60);

      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Resend error:', err);
      setError(e.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleStartOver = () => {
    setSignupComplete(false);
    setUserEmail('');
    setEmail('');
    setPassword('');
    setError(null);
    setResendSuccess(false);
    setResendCooldown(0);
  };

  if (signupComplete) {
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
            Verify your account.
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 16px',
            }}
          >
            We sent a verification link to{' '}
            <span
              style={{
                color: 'var(--emerald-500)',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {userEmail}
            </span>
            .
          </p>
          {hasProIntent ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              Once verified, we&apos;ll take you straight to checkout for{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                Finance Pro · {billing === 'annual' ? 'Annual' : 'Monthly'}
              </strong>
              .
            </p>
          ) : null}
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 20px' }}>
            The link expires in 24 hours.
          </p>

          {resendSuccess && (
            <div style={{ ...authSuccessStyle, width: '100%', marginBottom: 16 }}>
              <Check size={14} /> Verification email sent.
            </div>
          )}
          {error && (
            <div style={{ ...authErrorStyle, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 6px' }}>
              Didn&apos;t receive the email?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendLoading}
              style={{
                ...authSecondaryBtn,
                opacity: resendCooldown > 0 || resendLoading ? 0.5 : 1,
                cursor: resendCooldown > 0 || resendLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {resendLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend verification email'
              )}
            </button>
          </div>

          <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={handleStartOver}
              style={{
                ...authSecondaryBtn,
                color: 'var(--text-tertiary)',
                fontSize: 12,
              }}
            >
              Wrong email? Start over
            </button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--emerald-500)' }}>
            ● GET STARTED
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
            {hasProIntent ? 'Create your account to continue.' : 'Create your Cortex account.'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', margin: 0 }}>
            {hasProIntent
              ? `Verify your email, then checkout for Finance Pro · ${billing === 'annual' ? 'Annual' : 'Monthly'}.`
              : 'Free forever. No credit card required.'}
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

        <AuthField
          label="Password"
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

        <button type="submit" disabled={loading} style={{ ...authPrimaryBtn, opacity: loading ? 0.7 : 1 }}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Creating account...
            </>
          ) : (
            <>
              Create account <ArrowRight size={16} />
            </>
          )}
        </button>

        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          By creating an account you agree to our{' '}
          <Link
            href="/terms"
            style={{ color: 'var(--emerald-500)', textDecoration: 'underline' }}
          >
            terms
          </Link>
          .
        </p>

        <div
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-tertiary)',
            paddingTop: 8,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          Already have an account?{' '}
          <Link
            href={signInHref}
            style={{ color: 'var(--emerald-500)', fontWeight: 600, textDecoration: 'none' }}
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
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
      <SignupForm />
    </Suspense>
  );
}
