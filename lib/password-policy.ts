/**
 * The one password policy for the whole app. Used by the server-side signup
 * route (authoritative), the signup form hint, and the reset-password screen —
 * so a reset can't quietly set a weaker password than signup would accept.
 *
 * Kept dependency-free so it can be unit-tested with plain `node --test`.
 */

export const MIN_PASSWORD_LENGTH = 10;

export const PASSWORD_HINT =
  `Minimum ${MIN_PASSWORD_LENGTH} characters, with a mix of letters and numbers or symbols.`;

export type PasswordCheck = { ok: true } | { ok: false; message: string };

export function checkPassword(password: string): PasswordCheck {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (/^\d+$/.test(password) || /^[a-z]+$/i.test(password)) {
    return {
      ok: false,
      message: 'Please choose a password with a mix of letters, numbers or symbols.',
    };
  }
  return { ok: true };
}
