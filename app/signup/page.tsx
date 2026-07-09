'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Loader2, Lock, Mail, User as UserIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { siteUrl } from '@/lib/site-url';
import {
  AuthShell,
  AuthField,
  authInputWithIcon,
  authErrorStyle,
  authSuccessStyle,
  authLinkStyle,
} from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';

function SignupForm() {
  const [firstName, setFirstName] = useState('');
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

  const postVerifyRedirect = useMemo(() => {
    if (!hasProIntent) return '/onboarding';
    const params = new URLSearchParams({ plan: 'finance_pro' });
    if (billing === 'annual' || billing === 'monthly') params.set('billing', billing);
    return `/dashboard?${params.toString()}`;
  }, [hasProIntent, billing]);

  const signInHref = useMemo(() => {
    if (!hasProIntent) return '/login';
    return `/login?redirect=${encodeURIComponent(postVerifyRedirect)}`;
  }, [hasProIntent, postVerifyRedirect]);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.push(postVerifyRedirect);
    })();
  }, [router, supabase, postVerifyRedirect]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const trimmedFirstName = firstName.trim();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Route the verification link through /auth/callback (on the
          // canonical origin) so the PKCE code is exchanged into a session
          // before the user reaches their post-verify destination.
          emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(postVerifyRedirect)}`,
          data: trimmedFirstName ? { first_name: trimmedFirstName } : undefined,
        },
      });
      if (signUpError) throw signUpError;
      if (data.user) {
        // The public.users row (including first_name, from the signUp
        // metadata) is created atomically by the handle_new_user trigger —
        // no client-side fallback call needed.
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
    setFirstName('');
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
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(78, 201, 245, 0.16)',
              color: 'var(--sky)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mail size={28} />
          </div>
          <div className="mgm-eyebrow" style={{ marginBottom: 10 }}>
            ALMOST THERE
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
            Check your email.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 16px',
            }}
          >
            We sent a verification link to{' '}
            <span style={{ color: 'var(--navy)', fontWeight: 700 }}>{userEmail}</span>.
          </p>
          {hasProIntent ? (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              Once verified, we&apos;ll take you straight to checkout for{' '}
              <strong style={{ color: 'var(--navy)' }}>
                Finance Pro · {billing === 'annual' ? 'Annual' : 'Monthly'}
              </strong>
              .
            </p>
          ) : null}
          <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '0 0 20px' }}>
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
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 6px' }}>
              Didn&apos;t receive the email?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendLoading}
              style={{
                ...authLinkStyle,
                opacity: resendCooldown > 0 || resendLoading ? 0.5 : 1,
                cursor: resendCooldown > 0 || resendLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {resendLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Sending…
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
                ...authLinkStyle,
                color: 'var(--gray-500)',
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
          <div className="mgm-eyebrow" style={{ marginBottom: 10 }}>
            GET STARTED FREE
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
            {hasProIntent ? 'Create your account to continue.' : 'Join the Mutants.'}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>
            {hasProIntent
              ? `Verify your email, then checkout for Finance Pro · ${billing === 'annual' ? 'Annual' : 'Monthly'}.`
              : 'Thousands of Mutants are building wealth on purpose. Yes, it’s free.'}
          </p>
        </div>

        {error && <div style={authErrorStyle}>{error}</div>}

        <AuthField label="First name" icon={<UserIcon size={16} />}>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Alex"
            className="mgm-input"
            style={authInputWithIcon}
            autoComplete="given-name"
            maxLength={60}
          />
        </AuthField>

        <AuthField label="Email address" icon={<Mail size={16} />}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="mgm-input"
            style={authInputWithIcon}
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
            className="mgm-input"
            style={authInputWithIcon}
            minLength={6}
            autoComplete="new-password"
          />
        </AuthField>

        <Button variant="primary" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Creating account…
            </>
          ) : (
            <>
              Create account <ArrowRight size={16} />
            </>
          )}
        </Button>

        <p
          style={{
            fontSize: 12,
            color: 'var(--gray-500)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          By creating an account you agree to our{' '}
          <Link
            href="/terms"
            style={{ color: 'var(--orange)', fontWeight: 700, textDecoration: 'underline' }}
          >
            terms
          </Link>
          .
        </p>

        <div
          style={{
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--text-secondary)',
            paddingTop: 8,
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          Already a member?{' '}
          <Link
            href={signInHref}
            style={{ color: 'var(--orange)', fontWeight: 700, textDecoration: 'none' }}
          >
            Log in
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
