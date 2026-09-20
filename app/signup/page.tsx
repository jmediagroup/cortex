'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  Circle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { TurnstileWidget, isTurnstileEnabled } from '@/components/auth/TurnstileWidget';
import {
  AuthShell,
  AuthField,
  authHintId,
  authInputWithIcon,
  authErrorStyle,
  authSuccessStyle,
  authLinkStyle,
} from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { MIN_PASSWORD_LENGTH, checkPassword } from '@/lib/password-policy';
import { friendlySignupError } from '@/lib/auth-errors';
import { safeNextPath } from '@/lib/safe-redirect';
import { trackEvent } from '@/lib/analytics';

type SignupResponse = {
  success?: boolean;
  requiresVerification?: boolean;
  next?: string;
  error?: string;
  code?: string;
  retryAfter?: number;
};

/** Live password checklist shown under the field. Mirrors lib/password-policy.ts. */
function passwordRules(password: string) {
  return [
    {
      key: 'length',
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      ok: password.length >= MIN_PASSWORD_LENGTH,
    },
    {
      key: 'mix',
      label: 'Letters plus numbers or symbols',
      ok: password.length > 0 && !/^\d+$/.test(password) && !/^[a-z]+$/i.test(password),
    },
  ];
}

function PasswordChecklist({ password, id }: { password: string; id: string }) {
  const rules = passwordRules(password);
  return (
    <ul
      id={id}
      aria-live="polite"
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontSize: 12,
      }}
    >
      {rules.map((rule) => (
        <li
          key={rule.key}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: rule.ok ? 'var(--teal-green)' : 'var(--gray-500)',
            fontWeight: rule.ok ? 700 : 500,
          }}
        >
          {rule.ok ? <Check size={12} aria-hidden="true" /> : <Circle size={10} aria-hidden="true" />}
          <span>{rule.label}</span>
          <span className="sr-only">{rule.ok ? ' (done)' : ' (not yet)'}</span>
        </li>
      ))}
    </ul>
  );
}

function SignupForm() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  // Anti-bot state. `honeypot` is hidden from humans and named so no browser
  // autofill heuristic will ever populate it. `formStartedAt` lets the server
  // reject submissions that arrive faster than a page could be read.
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const formStartedAt = useRef<number>(Date.now());
  const errorRef = useRef<HTMLDivElement | null>(null);
  const resendTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  // Turnstile tokens are single-use — after any attempt the widget must hand
  // us a fresh one before the next submit.
  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaNonce((n) => n + 1);
  }, []);

  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');
  const hasProIntent = plan === 'finance_pro' || plan === 'pro';
  const billingLabel = billing === 'annual' ? 'Annual' : 'Monthly';

  const postVerifyRedirect = useMemo(() => {
    if (!hasProIntent) return '/onboarding';
    const params = new URLSearchParams({ plan: 'finance_pro' });
    if (billing === 'annual' || billing === 'monthly') params.set('billing', billing);
    return `/dashboard?${params.toString()}`;
  }, [hasProIntent, billing]);

  const signInHref = useMemo(() => {
    const params = new URLSearchParams();
    if (hasProIntent) params.set('redirect', postVerifyRedirect);
    if (accountExists && email) params.set('email', email);
    const qs = params.toString();
    return qs ? `/login?${qs}` : '/login';
  }, [hasProIntent, postVerifyRedirect, accountExists, email]);

  const resetHref = useMemo(() => {
    const params = new URLSearchParams({ mode: 'reset' });
    if (email) params.set('email', email);
    return `/login?${params.toString()}`;
  }, [email]);

  // Already signed in? Skip the form. `getUser()` validates against the auth
  // server, so a stale cookie can't bounce someone into a redirect loop.
  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (active && user) router.replace(postVerifyRedirect);
    })();
    return () => {
      active = false;
    };
  }, [router, supabase, postVerifyRedirect]);

  // Clear the resend countdown if the page unmounts mid-count.
  useEffect(
    () => () => {
      if (resendTimer.current) clearInterval(resendTimer.current);
    },
    [],
  );

  // Move focus to the error so keyboard and screen-reader users hear it.
  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus();
  }, [error]);

  const passwordOk = checkPassword(password).ok;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAccountExists(false);

    // Same policy as the server. Catching it here saves a round trip and a
    // single-use CAPTCHA token.
    const pw = checkPassword(password);
    if (!pw.ok) {
      setError(pw.message);
      return;
    }

    setLoading(true);

    try {
      // Account creation goes through our own route rather than straight to
      // Supabase, so rate limiting, CAPTCHA verification and the email policy
      // in lib/email-hygiene.ts all get a say before an account exists.
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName.trim(),
          captchaToken,
          mgm_hp: honeypot,
          formStartedAt: formStartedAt.current,
          next: postVerifyRedirect,
        }),
      });

      const payload = (await res.json().catch(() => ({}))) as SignupResponse;

      if (res.status === 409 || payload.code === 'account_exists') {
        setAccountExists(true);
        setError(payload.error || 'An account already exists for this email.');
        return;
      }

      if (!res.ok) {
        throw new Error(payload.error || 'We couldn’t create your account just now. Please try again.');
      }

      void trackEvent('user_signup', { plan: hasProIntent ? 'finance_pro' : 'free' });

      // Email confirmations are off in Supabase: the route already set the
      // session cookies, so go straight in.
      if (payload.requiresVerification === false) {
        router.replace(safeNextPath(payload.next, postVerifyRedirect));
        return;
      }

      setUserEmail(email);
      setSignupComplete(true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error('Signup error:', err);
      setError(e.message || 'We couldn’t create your account just now. Please try again.');
    } finally {
      // The token is spent either way; get a fresh one for the next attempt.
      resetCaptcha();
      setLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    if (resendTimer.current) clearInterval(resendTimer.current);
    resendTimer.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (resendTimer.current) clearInterval(resendTimer.current);
          resendTimer.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
        // Required once CAPTCHA protection is enabled on the Supabase project,
        // which applies to every auth endpoint, not just signup. The widget
        // stays mounted on this screen so a fresh token is always available.
        options: captchaToken ? { captchaToken } : undefined,
      });
      if (resendError) throw resendError;
      setResendSuccess(true);
      startResendCooldown();
      void trackEvent('resend_verification_requested', { context: 'signup' });
    } catch (err: unknown) {
      console.error('Resend error:', err);
      setError(friendlySignupError(err as { message?: string; code?: string }));
    } finally {
      resetCaptcha();
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
    setAccountExists(false);
    setResendSuccess(false);
    setResendCooldown(0);
    if (resendTimer.current) {
      clearInterval(resendTimer.current);
      resendTimer.current = null;
    }
    setHoneypot('');
    resetCaptcha();
    formStartedAt.current = Date.now();
  };

  const captchaBlocksSubmit = isTurnstileEnabled() && !captchaToken;

  if (signupComplete) {
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
            role="status"
            style={{
              fontSize: 15,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 16px',
            }}
          >
            We sent a verification link to{' '}
            <span style={{ color: 'var(--navy)', fontWeight: 700 }}>{userEmail}</span>. Open it on
            any device — phone or computer — to activate your account.
          </p>
          {hasProIntent ? (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              Once verified, we&apos;ll bring you back to finish checkout for{' '}
              <strong style={{ color: 'var(--navy)' }}>Finance Pro · {billingLabel}</strong>.
            </p>
          ) : null}
          <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '0 0 20px' }}>
            Can&apos;t find it? Check your spam or promotions folder.
          </p>

          {resendSuccess && (
            <div role="status" style={{ ...authSuccessStyle, width: '100%', marginBottom: 16 }}>
              <Check size={14} aria-hidden="true" /> Verification email sent.
            </div>
          )}
          {error && (
            <div
              ref={errorRef}
              role="alert"
              tabIndex={-1}
              style={{ ...authErrorStyle, marginBottom: 16, outline: 'none' }}
            >
              {error}
            </div>
          )}

          {/* Kept mounted so a resend always has a fresh single-use token. */}
          <TurnstileWidget onToken={setCaptchaToken} resetSignal={captchaNonce} />

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '0 0 6px' }}>
              Didn&apos;t receive the email?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendLoading || captchaBlocksSubmit}
              aria-disabled={resendCooldown > 0 || resendLoading || captchaBlocksSubmit}
              style={{
                ...authLinkStyle,
                opacity: resendCooldown > 0 || resendLoading || captchaBlocksSubmit ? 0.5 : 1,
                cursor:
                  resendCooldown > 0 || resendLoading || captchaBlocksSubmit
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {resendLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" aria-hidden="true" /> Sending…
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
      <form
        onSubmit={handleSignup}
        noValidate={false}
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
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
              ? `Verify your email, then finish checkout for Finance Pro · ${billingLabel}.`
              : 'Thousands of Mutants are building wealth on purpose. Yes, it’s free.'}
          </p>
        </div>

        {error && (
          <div
            ref={errorRef}
            role="alert"
            tabIndex={-1}
            style={{ ...authErrorStyle, outline: 'none' }}
          >
            <div>{error}</div>
            {accountExists && (
              <div style={{ marginTop: 8, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Link href={signInHref} style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Log in
                </Link>
                <Link href={resetHref} style={{ color: 'inherit', textDecoration: 'underline' }}>
                  Reset password
                </Link>
              </div>
            )}
          </div>
        )}

        <AuthField id="signup-first-name" label="First name" icon={<UserIcon size={16} />}>
          <input
            id="signup-first-name"
            name="given-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Alex (optional)"
            className="mgm-input"
            style={authInputWithIcon}
            autoComplete="given-name"
            autoCapitalize="words"
            maxLength={60}
          />
        </AuthField>

        <AuthField id="signup-email" label="Email address" icon={<Mail size={16} />}>
          <input
            id="signup-email"
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
          id="signup-password"
          label="Password"
          icon={<Lock size={16} />}
          hint={<PasswordChecklist password={password} id={authHintId('signup-password')} />}
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
            id="signup-password"
            name="new-password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            className="mgm-input"
            style={authInputWithIcon}
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            aria-describedby={authHintId('signup-password')}
            aria-invalid={password.length > 0 && !passwordOk}
          />
        </AuthField>

        {/*
          Honeypot. Hidden from sighted users and from screen readers, and
          skipped by keyboard navigation, so only an automated form-filler
          will ever put something in it. The server discards any submission
          that does — silently, so bots can't tell they were caught.
        */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <label htmlFor="mgm-hp">Leave this empty</label>
          <input
            id="mgm-hp"
            name="mgm_hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
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
              <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Creating account…
            </>
          ) : (
            <>
              Create free account <ArrowRight size={16} aria-hidden="true" />
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
          . No credit card required.
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
