/**
 * Friendly copy for the auth flows.
 *
 * Supabase error strings ("Invalid login credentials", "Email rate limit
 * exceeded", "Database error saving new user"…) are written for developers.
 * This maps the ones a person can realistically hit to a sentence that tells
 * them what to do next, and falls back to a generic message for anything
 * unexpected so raw internals never reach the UI.
 *
 * Dependency-free so it can be unit-tested with plain `node --test`.
 */

type SupabaseLikeError = { message?: string; code?: string; status?: number } | null | undefined;

const GENERIC_SIGNUP = 'We couldn’t create your account just now. Please try again in a moment.';
const GENERIC_LOGIN = 'We couldn’t sign you in just now. Please try again in a moment.';

/** Message for a failed `signUp` / `resend` call. */
export function friendlySignupError(error: SupabaseLikeError): string {
  const code = error?.code ?? '';
  const msg = (error?.message ?? '').toLowerCase();

  if (code === 'user_already_exists' || msg.includes('already registered') || msg.includes('already been registered')) {
    return 'An account already exists for this email. Log in instead, or reset your password if you’ve forgotten it.';
  }
  if (code === 'over_email_send_rate_limit' || msg.includes('email rate limit')) {
    return 'We’ve sent a few emails to this address recently. Please wait a minute or two and try again.';
  }
  if (code === 'over_request_rate_limit' || msg.includes('rate limit')) {
    return 'Too many attempts in a short time. Please wait a minute and try again.';
  }
  if (code === 'weak_password' || msg.includes('password')) {
    return 'That password is too easy to guess. Try a longer one with a mix of letters, numbers or symbols.';
  }
  if (code === 'email_address_invalid' || msg.includes('invalid email') || msg.includes('validate email')) {
    return 'That doesn’t look like a valid email address. Please check it and try again.';
  }
  if (code === 'captcha_failed' || msg.includes('captcha')) {
    return 'The security check didn’t pass. Please refresh the page and try again.';
  }
  if (code === 'signup_disabled' || msg.includes('signups not allowed')) {
    return 'New signups are paused right now. Please check back soon.';
  }
  return GENERIC_SIGNUP;
}

/** Message for a failed `signInWithPassword` call. */
export function friendlyLoginError(error: SupabaseLikeError): string {
  const code = error?.code ?? '';
  const msg = (error?.message ?? '').toLowerCase();

  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again, or reset your password.';
  }
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Your email isn’t verified yet. Check your inbox for the link, or resend it below.';
  }
  if (code === 'over_request_rate_limit' || msg.includes('rate limit')) {
    return 'Too many attempts in a short time. Please wait a minute and try again.';
  }
  if (code === 'captcha_failed' || msg.includes('captcha')) {
    return 'The security check didn’t pass. Please refresh the page and try again.';
  }
  if (code === 'user_banned' || msg.includes('banned')) {
    return 'This account has been disabled. Contact support if you think that’s a mistake.';
  }
  return GENERIC_LOGIN;
}

/** Message for a failed `resetPasswordForEmail` / `updateUser({ password })` call. */
export function friendlyResetError(error: SupabaseLikeError): string {
  const code = error?.code ?? '';
  const msg = (error?.message ?? '').toLowerCase();

  if (code === 'same_password' || msg.includes('different from the old')) {
    return 'That’s your current password. Please choose a new one.';
  }
  if (code === 'weak_password' || msg.includes('password')) {
    return 'That password is too easy to guess. Try a longer one with a mix of letters, numbers or symbols.';
  }
  if (code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
    return 'We’ve sent a few emails to this address recently. Please wait a minute or two and try again.';
  }
  if (code === 'session_expired' || code === 'session_not_found' || msg.includes('session')) {
    return 'This reset link has expired. Request a new one from the login page.';
  }
  return 'We couldn’t update your password just now. Please try again in a moment.';
}

/**
 * Query-string codes that /auth/callback hands to /login when a link can't
 * be completed, and the copy each one should show.
 */
export type CallbackErrorCode =
  | 'link_expired'
  | 'link_invalid'
  | 'verified_login_required'
  | 'auth_callback';

export function callbackNotice(code: string | null): { tone: 'error' | 'success' | 'info'; text: string } | null {
  switch (code) {
    case 'link_expired':
      return {
        tone: 'error',
        text: 'That link has expired or was already used. Enter your email below and we’ll send a fresh one.',
      };
    case 'link_invalid':
      return {
        tone: 'error',
        text: 'That link didn’t work. Enter your email below and we’ll send a fresh one.',
      };
    case 'verified_login_required':
      return {
        tone: 'success',
        text: 'Your email is verified. Log in to continue.',
      };
    case 'auth_callback':
      return {
        tone: 'error',
        text: 'We couldn’t complete that link. Log in below, or request a new link if your email isn’t verified yet.',
      };
    default:
      return null;
  }
}
