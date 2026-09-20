'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { siteUrl } from '@/lib/site-url';
import { safeNextPath } from '@/lib/safe-redirect';
import { trackEvent } from '@/lib/analytics';
import { callbackNotice, friendlyLoginError, friendlySignupError } from '@/lib/auth-errors';
import {
  AuthShell,
  AuthField,
  authInputWithIcon,
  authErrorStyle,
  authInfoStyle,
  authLinkStyle,
  authSuccessStyle,
} from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { MarketingIcon } from '@/components/marketing/Icons';
import { TurnstileWidget, isTurnstileEnabled } from '@/components/auth/TurnstileWidget';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  // `?mode=reset` opens the forgot-password view directly (linked from the
  // "account already exists" message on signup). `?email=` pre-fills.
  const [isForgotPassword, setIsForgotPassword] = useState(searchParams.get('mode') === 'reset');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<{ ok: boolean; text: string } | null>(null);
  // Once CAPTCHA protection is switched on for the Supabase project it applies
  // to every auth endpoint — sign-in and password recovery included, not just
  // signup — so all three calls below carry a token.
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Tokens are single-use; a failed attempt needs a fresh one before retrying.
  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaNonce((n) => n + 1);
  }, []);

  // A message handed over by /auth/callback (expired link, "you're verified,
  // log in", …). Cleared as soon as the person starts a fresh attempt.
  const [notice, setNotice] = useState(() => callbackNotice(searchParams.get('notice')));
  const noticeIsExpiredLink =
    searchParams.get('notice') === 'link_expired' || searchParams.get('notice') === 'link_invalid';

  const redirectTarget = useMemo(
    () => safeNextPath(searchParams.get('redirect'), '/dashboard'),
    [searchParams],
  );

  const signupHref = useMemo(() => {
    const redirect = searchParams.get('redirect');
    const plan = searchParams.get('plan');
    const billing = searchParams.get('billing');
    const params = new URLSearchParams();
    if (plan) params.set('plan', plan);
    if (billing) params.set('billing', billing);
    const ref = searchParams.get('ref');
    if (ref) params.set('ref', ref);
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

  // Already signed in? Go where they were headed. `getUser()` validates the
  // token server-side so a revoked/stale cookie can't create a redirect loop
  // with the middleware (which also uses getUser).
  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (active && user) router.replace(redirectTarget);
    })();
    return () => {
      active = false;
    };
  }, [router, redirectTarget, supabase]);

  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus();
  }, [error]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
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
        router.replace(redirectTarget);
        return;
      }
      throw new Error('No session returned');
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string };
      console.error('Auth error:', err);
      if (e.code === 'email_not_confirmed' || /email not confirmed/i.test(e.message ?? '')) {
        setNeedsVerification(true);
      }
      setError(friendlyLoginError(e));
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
      setResendMsg({ ok: true, text: 'Verification email sent — check your inbox (and spam).' });
      await trackEvent('resend_verification_requested', { context: 'login' }, true);
    } catch (err: unknown) {
      setResendMsg({ ok: false, text: friendlySignupError(err as { message?: string; code?: string }) });
    } finally {
      resetCaptcha();
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        // Exchange the recovery token at /auth/callback first, then land on the
        // set-new-password screen with a live recovery session.
        redirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
        ...(captchaToken ? { captchaToken } : {}),
      });
      if (resetError) throw resetError;
      setResetEmailSent(true);
      await trackEvent('password_reset_requested', {}, true);
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string };
      console.error('Password reset error:', err);
      setError(friendlySignupError(e));
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

  const captchaBlocksSubmit = isTurnstileEnabled() && !captchaToken;

  const noticeBanner = notice ? (
    <div
      role={notice.tone === 'error' ? 'alert' : 'status'}
      style={
        notice.tone === 'error'
          ? authErrorStyle
          : notice.tone === 'success'
            ? { ...authSuccessStyle, display: 'flex' }
            : authInfoStyle
      }
    >
      {notice.tone === 'success' && <Check size={14} aria-hidden="true" />}
      <span>{notice.text}</span>
    </div>
  ) : null;

  const errorBanner = error ? (
    <div ref={errorRef} role="alert" tabIndex={-1} style={{ ...authErrorStyle, outline: 'none' }}>
      {error}
    </div>
  ) : null;

  if (resetEmailSent) {
    return (
      <AuthShell>
        <div style={{ textAlign: 'center' }}>
          <div
            aria-hidden="true"
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
            role="status"
            style={{
              fontSize: 15,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 16px',
            }}
          >
            If an account exists for{' '}
            <span style={{ color: 'var(--navy)', fontWeight: 700 }}>{email}</span>, a password
            reset link is on its way. It works on any device.
          </p>
          <p
            style={{
              fontSize: 13,
              color: 'var(--gray-500)',
              margin: '0 0 24px',
            }}
          >
            Can&apos;t find it? Check your spam or promotions folder.
          </p>
          <button
            type="button"
            onClick={handleBackToLogin}
            style={{ ...authLinkStyle, color: 'var(--navy)' }}
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back to sign in
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

          {noticeBanner}
          {errorBanner}

          <AuthField id="reset-email" label="Email address" icon={<Mail size={16} />}>
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mgm-input"
              style={authInputWithIcon}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
            />
          </AuthField>

          <TurnstileWidget onToken={setCaptchaToken} resetSignal={captchaNonce} />

          <Button
            variant="primary"
            type="submit"
            disabled={loading || captchaBlocksSubmit}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Sending…
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
            <ArrowLeft size={14} aria-hidden="true" /> Back to sign in
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

        {noticeBanner}
        {errorBanner}

        <AuthField id="login-email" label="Email address" icon={<Mail size={16} />}>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="mgm-input"
            style={authInputWithIcon}
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="email"
          />
        </AuthField>

        <AuthField
          id="login-password"
          label="Password"
          icon={<Lock size={16} />}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                ...authLinkStyle,
                fontSize: 11,
                color: 'var(--gray-500)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-label)',
              }}
            >
              {showPassword ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
              {showPassword ? 'Hide' : 'Show'}
            </button>
          }
        >
          <input
            id="login-password"
            name="current-password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mgm-input"
            style={authInputWithIcon}
            // Older accounts may have shorter passwords than the current
            // signup policy; never lock them out at the form.
            minLength={6}
            autoComplete="current-password"
          />
        </AuthField>

        {(needsVerification || noticeIsExpiredLink) && (
          <div style={{ marginTop: -6 }}>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendLoading || !email || captchaBlocksSubmit}
              style={{ ...authLinkStyle, fontSize: 13 }}
            >
              {resendLoading ? 'Sending…' : 'Send a new verification email'}
            </button>
            {!email && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                Enter your email above first.
              </div>
            )}
            {resendMsg && (
              <div
                role="status"
                style={{
                  fontSize: 12,
                  color: resendMsg.ok ? 'var(--teal-green)' : 'var(--crimson-500)',
                  marginTop: 6,
                }}
              >
                {resendMsg.text}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: -6, textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => {
              setIsForgotPassword(true);
              setError(null);
            }}
            style={{ ...authLinkStyle, fontSize: 12 }}
          >
            Forgot password?
          </button>
        </div>

        <TurnstileWidget onToken={setCaptchaToken} resetSignal={captchaNonce} />

        <Button
          variant="primary"
          type="submit"
          disabled={loading || captchaBlocksSubmit}
          style={{ width: '100%' }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Signing in…
            </>
          ) : (
            <>
              Log in <ArrowRight size={16} aria-hidden="true" />
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
            Create a free account
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
