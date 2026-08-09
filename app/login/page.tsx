'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { siteUrl } from '@/lib/site-url';
import { safeNextPath } from '@/lib/safe-redirect';
import { trackEvent } from '@/lib/analytics';
import {
  AuthShell,
  AuthField,
  authInputWithIcon,
  authErrorStyle,
  authLinkStyle,
} from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { MarketingIcon } from '@/components/marketing/Icons';
import { TurnstileWidget, isTurnstileEnabled } from '@/components/auth/TurnstileWidget';

function AuthForm() {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  // Once CAPTCHA protection is switched on for the Supabase project it applies
  // to every auth endpoint — sign-in and password recovery included, not just
  // signup — so all three calls below carry a token.
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  // Tokens are single-use; a failed attempt needs a fresh one before retrying.
  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaNonce((n) => n + 1);
  }, []);

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
        const redirect = safeNextPath(searchParams.get('redirect'), '/dashboard');
        router.push(redirect);
      }
    };
    checkSession();
  }, [router, searchParams, supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsVerification(false);
    setResendMsg(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });
      if (signInError) throw signInError;
      if (data.session) {
        await trackEvent('user_login', {}, true);
        const redirect = safeNextPath(searchParams.get('redirect'), '/dashboard');
        router.push(redirect);
      }
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string };
      console.error('Auth error:', err);
      if (e.code === 'email_not_confirmed') {
        setNeedsVerification(true);
        setError('Your email isn’t verified yet. Check your inbox for the link, or resend it below.');
      } else {
        setError(e.message || 'An error occurred. Please try again.');
      }
      resetCaptcha();
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

  const handleResendVerification = async () => {
    if (!email || resendLoading) return;
    setResendLoading(true);
    setResendMsg(null);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: captchaToken ? { captchaToken } : undefined,
      });
      if (resendError) throw resendError;
      setResendMsg('Verification email sent — check your inbox.');
      await trackEvent('resend_verification_requested', { context: 'login' }, true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setResendMsg(e.message || 'Could not resend right now. Please try again shortly.');
    } finally {
      resetCaptcha();
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        // Exchange the recovery code at /auth/callback first, then land on the
        // set-new-password screen with a live recovery session.
        redirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
        ...(captchaToken ? { captchaToken } : {}),
      });
      if (resetError) throw resetError;
      setResetEmailSent(true);
      await trackEvent('password_reset_requested', {}, true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Password reset error:', err);
      setError(e.message || 'Failed to send reset email. Please try again.');
      resetCaptcha();
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
            CHECK YOUR EMAIL
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
            We sent a reset link.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 16px',
            }}
          >
            We sent a password reset link to{' '}
            <span style={{ color: 'var(--navy)', fontWeight: 700 }}>{email}</span>.
          </p>
          <p
            style={{
              fontSize: 13,
              color: 'var(--gray-500)',
              margin: '0 0 24px',
            }}
          >
            The link expires in 24 hours.
          </p>
          <button
            type="button"
            onClick={handleBackToLogin}
            style={{ ...authLinkStyle, color: 'var(--navy)' }}
          >
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
            <div className="mgm-eyebrow" style={{ marginBottom: 10 }}>
              NO WORRIES
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
              Reset your password.
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>
              Enter your email and we&apos;ll send a link to set a new one.
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
              className="mgm-input"
              style={authInputWithIcon}
            />
          </AuthField>

          <TurnstileWidget onToken={setCaptchaToken} resetSignal={captchaNonce} />

          <Button
            variant="primary"
            type="submit"
            disabled={loading || (isTurnstileEnabled() && !captchaToken)}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send reset link <MarketingIcon name="arrowRight" size={14} />
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={handleBackToLogin}
            style={{ ...authLinkStyle, color: 'var(--navy)', alignSelf: 'center' }}
          >
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
          <div className="mgm-eyebrow" style={{ marginBottom: 10 }}>
            WELCOME BACK
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
            Log in to Money Guy Mutants.
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0 }}>
            Pick up right where you left off.
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
            className="mgm-input"
            style={authInputWithIcon}
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
            className="mgm-input"
            style={authInputWithIcon}
            minLength={6}
            autoComplete="current-password"
          />
        </AuthField>

        {needsVerification && (
          <div style={{ marginTop: -6 }}>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendLoading}
              style={{ ...authLinkStyle, fontSize: 13 }}
            >
              {resendLoading ? 'Sending…' : 'Resend verification email'}
            </button>
            {resendMsg && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                {resendMsg}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: -6, textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => setIsForgotPassword(true)}
            style={{ ...authLinkStyle, fontSize: 12 }}
          >
            Forgot password?
          </button>
        </div>

        <TurnstileWidget onToken={setCaptchaToken} resetSignal={captchaNonce} />

        <Button
          variant="primary"
          type="submit"
          disabled={loading || (isTurnstileEnabled() && !captchaToken)}
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Signing in…
            </>
          ) : (
            <>
              Log in <ArrowRight size={16} />
            </>
          )}
        </Button>

        <div
          style={{
            textAlign: 'center',
            fontSize: 14,
            color: 'var(--text-secondary)',
            paddingTop: 8,
          }}
        >
          New here?{' '}
          <Link
            href={signupHref}
            style={{ color: 'var(--orange)', fontWeight: 700, textDecoration: 'none' }}
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
