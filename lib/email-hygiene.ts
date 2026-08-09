/**
 * Email hygiene + signup abuse heuristics.
 *
 * Background: the admin user list filled up with hundreds of never-verified
 * "free" accounts whose addresses were textbook Gmail alias farms
 * (`b.i.la.l.man.so.or@gmail.com`, `s.t.ac.wel2.5@gmail.com`, …) paired with
 * random-string first names (`rxRwdQrbolvPisvN`). Gmail ignores dots and
 * everything after a `+` in the local part, so a single real inbox can mint an
 * unbounded number of "unique" addresses. Nothing in the signup path
 * canonicalised addresses, so every alias looked like a brand new human.
 *
 * This module gives the rest of the app three things:
 *   1. `normalizeEmail` — a canonical form used for duplicate detection, so
 *      alias farms collapse onto the one inbox that actually receives them.
 *   2. Domain policy — disposable/throwaway providers and lookalike domains.
 *   3. `assessSignup` — a scored verdict (allow / flag / block) combining the
 *      above with a machine-generated-name heuristic.
 *
 * Everything here is pure and dependency-free so it can run on the edge, in a
 * route handler, or in a one-off cleanup script.
 */

/** Providers that ignore dots in the local part (Google only, in practice). */
const DOT_INSENSITIVE_DOMAINS = new Set(['gmail.com', 'googlemail.com']);

/** Domains that are the same mailbox under different names. */
const DOMAIN_ALIASES: Record<string, string> = {
  'googlemail.com': 'gmail.com',
  'hotmail.co.uk': 'hotmail.com',
  'live.co.uk': 'live.com',
  'ymail.com': 'yahoo.com',
  'rocketmail.com': 'yahoo.com',
  'me.com': 'icloud.com',
  'mac.com': 'icloud.com',
  'pm.me': 'proton.me',
  'protonmail.com': 'proton.me',
  'protonmail.ch': 'proton.me',
};

/**
 * Well-known consumer mail domains. Used both to skip "is this a real domain"
 * suspicion and as the reference set for lookalike detection.
 */
const KNOWN_PROVIDER_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'rocketmail.com',
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'live.com',
  'live.co.uk',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'protonmail.ch',
  'zoho.com',
  'gmx.com',
  'gmx.net',
  'mail.com',
  'yandex.com',
  'fastmail.com',
  'comcast.net',
  'verizon.net',
  'att.net',
  'sbcglobal.net',
  'cox.net',
  'charter.net',
  'bellsouth.net',
  'earthlink.net',
  // Corporate domains of the big mail brands. These are real (employee)
  // addresses, and listing them here also makes their *subdomains* —
  // `xwf.google.com` and friends — resolve as lookalikes below.
  'google.com',
  'apple.com',
  'microsoft.com',
]);

/**
 * Disposable / throwaway inbox providers. Not exhaustive — no static list ever
 * is — but it covers the high-volume services that show up in signup floods.
 * Matching is suffix-based so subdomains (`foo.mailinator.com`) are caught too.
 */
const DISPOSABLE_DOMAINS = new Set([
  '0-mail.com',
  '10minutemail.com',
  '10minutemail.net',
  '20minutemail.com',
  '33mail.com',
  'anonaddy.com',
  'anonaddy.me',
  'burnermail.io',
  'byom.de',
  'cock.li',
  'dispostable.com',
  'dropmail.me',
  'duck.com',
  'emailondeck.com',
  'emailfake.com',
  'fakeinbox.com',
  'fakemail.net',
  'getairmail.com',
  'getnada.com',
  'grr.la',
  'guerrillamail.biz',
  'guerrillamail.com',
  'guerrillamail.de',
  'guerrillamail.info',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'harakirimail.com',
  'inboxbear.com',
  'inboxkitten.com',
  'jetable.org',
  'mail-temp.com',
  'mail7.io',
  'mailbox52.ga',
  'maildrop.cc',
  'mailduck.io',
  'maildu.de',
  'maileasy.fr',
  'mailforspam.com',
  'mailinator.com',
  'mailinator.net',
  'mailnesia.com',
  'mailsac.com',
  'mailtemp.info',
  'mintemail.com',
  'mohmal.com',
  'moakt.com',
  'mytemp.email',
  'nowmymail.com',
  'nvhrw.com',
  'sharklasers.com',
  'spam4.me',
  'spamgourmet.com',
  'spambox.us',
  'spamherelots.com',
  'temp-mail.io',
  'temp-mail.org',
  'tempail.com',
  'tempinbox.com',
  'tempmail.dev',
  'tempmail.net',
  'tempmail.plus',
  'tempmailo.com',
  'tempr.email',
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.de',
  'trashmail.me',
  'trbvm.com',
  'tmpmail.net',
  'wegwerfmail.de',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'zetmail.com',
]);

/** Split an address into `[localPart, domain]`, lowercased and trimmed. */
function splitEmail(raw: string): [string, string] | null {
  const value = (raw || '').trim().toLowerCase();
  const at = value.lastIndexOf('@');
  if (at <= 0 || at === value.length - 1) return null;
  return [value.slice(0, at), value.slice(at + 1)];
}

/** The domain portion of an address, lowercased. Empty string if malformed. */
export function emailDomain(raw: string): string {
  return splitEmail(raw)?.[1] ?? '';
}

/**
 * Canonical form of an address, for duplicate detection only.
 *
 * - Lowercases the whole address (domains are case-insensitive; local parts are
 *   technically case-sensitive per RFC 5321 but no real provider treats them
 *   that way).
 * - Maps alias domains onto their canonical domain (googlemail → gmail).
 * - Strips `+tag` suffixes, which every major provider treats as sub-addressing.
 * - Strips dots from the local part for Google addresses only.
 *
 * NEVER use the result as a delivery address — it is a comparison key. Always
 * send mail to the address the user actually typed.
 */
export function normalizeEmail(raw: string): string {
  const parts = splitEmail(raw);
  if (!parts) return (raw || '').trim().toLowerCase();

  let [local, domain] = parts;
  domain = DOMAIN_ALIASES[domain] ?? domain;

  // Sub-addressing: everything from the first '+' onward is a user-chosen tag.
  const plus = local.indexOf('+');
  if (plus > 0) local = local.slice(0, plus);

  if (DOT_INSENSITIVE_DOMAINS.has(domain) || domain === 'gmail.com') {
    local = local.replace(/\./g, '');
  }

  return `${local}@${domain}`;
}

/** True when the address uses a known throwaway inbox provider. */
export function isDisposableEmail(raw: string): boolean {
  const domain = emailDomain(raw);
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  // Suffix match so `inbox.mailinator.com` is caught as well.
  for (const blocked of DISPOSABLE_DOMAINS) {
    if (domain.endsWith(`.${blocked}`)) return true;
  }
  return false;
}

/**
 * Damerau-Levenshtein distance, capped early once it exceeds `max`.
 *
 * Transpositions count as a single edit because swapped adjacent characters
 * (`gmial.com`) are the single most common domain typo — plain Levenshtein
 * scores those as 2 and would miss them at a threshold of 1.
 */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;

  // Rolling rows: `prev2` is needed for the transposition case.
  let prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        value = Math.min(value, prev2[j - 2] + 1);
      }
      curr[j] = value;
      rowMin = Math.min(rowMin, value);
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = curr;
  }
  return prev[b.length];
}

/**
 * Detects domains that impersonate a major provider without being one:
 * subdomains (`xwf.google.com`), suffix-grafts (`gmail.com.co`), and
 * one-character typos (`gmial.com`, `gnail.com`).
 */
export function isLookalikeProviderDomain(raw: string): boolean {
  const domain = emailDomain(raw);
  if (!domain || KNOWN_PROVIDER_DOMAINS.has(domain)) return false;

  for (const provider of KNOWN_PROVIDER_DOMAINS) {
    // `mail.google.com`-style subdomains and `gmail.com.co`-style grafts.
    if (domain.endsWith(`.${provider}`) || domain.startsWith(`${provider}.`)) {
      return true;
    }
    // Typo-squats of the big four only — smaller providers produce false
    // positives against legitimate short corporate domains.
    if (
      ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(provider) &&
      editDistance(domain, provider, 1) <= 1
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Heuristic for bot-filled name fields. The flood in the admin panel used
 * random 12–20 character strings like `rxRwdQrbolvPisvN` and
 * `OOJblXMOXaStDsNXmgzj` — human names have vowels in roughly natural
 * proportion and don't switch case five times.
 *
 * Deliberately conservative: short names, names with spaces, and names with
 * ordinary capitalisation (`Gary`, `MaryAnne`, `O'Brien`) never trip it.
 */
export function looksMachineGenerated(name: string | null | undefined): boolean {
  const value = (name || '').trim();
  if (value.length < 10) return false;
  if (/\s/.test(value)) return false;

  const letters = value.replace(/[^a-z]/gi, '');
  if (letters.length < 10) return false;

  let signals = 0;

  // Case flips beyond simple TitleCase / camelCase.
  const caseTransitions = (value.match(/[a-z][A-Z]|[A-Z][a-z]/g) || []).length;
  if (caseTransitions >= 4) signals++;

  // Vowel ratio well outside the ~35-45% typical of names in Latin scripts.
  const vowels = (letters.match(/[aeiou]/gi) || []).length;
  const vowelRatio = vowels / letters.length;
  if (vowelRatio < 0.25 || vowelRatio > 0.75) signals++;

  // Long unpronounceable consonant runs.
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(letters)) signals++;

  // Digits interleaved with letters rather than trailing (`user123` is fine).
  if (/\d/.test(value) && !/^\D+\d+$/.test(value)) signals++;

  return signals >= 2;
}

export type SignupDecision = 'allow' | 'flag' | 'block';

export interface SignupAssessment {
  /** What the signup route should do with this attempt. */
  decision: SignupDecision;
  /** Canonical address used for duplicate detection. */
  normalizedEmail: string;
  /** Machine-readable reason codes, persisted for later analysis. */
  reasons: string[];
  /** True when the literal address differs from its canonical form. */
  isAlias: boolean;
}

export interface SignupInput {
  email: string;
  firstName?: string | null;
}

/**
 * Scores a signup attempt on email and name signals alone (rate limiting,
 * honeypots and CAPTCHA are handled by the caller).
 *
 * `block` is reserved for signals that are essentially never a real customer:
 * a malformed address, a throwaway inbox, or a provider lookalike. Softer
 * signals — an alias address, a random-looking name — only `flag`, so the
 * account is created but marked for review rather than silently rejecting
 * someone whose name happens to look unusual.
 */
export function assessSignup({ email, firstName }: SignupInput): SignupAssessment {
  const reasons: string[] = [];
  const normalizedEmail = normalizeEmail(email);
  const literal = (email || '').trim().toLowerCase();
  const isAlias = normalizedEmail !== literal;

  let decision: SignupDecision = 'allow';
  const block = (reason: string) => {
    reasons.push(reason);
    decision = 'block';
  };
  const flag = (reason: string) => {
    reasons.push(reason);
    if (decision !== 'block') decision = 'flag';
  };

  if (!splitEmail(email)) {
    block('invalid_email');
    return { decision, normalizedEmail, reasons, isAlias };
  }

  if (isDisposableEmail(email)) block('disposable_domain');
  if (isLookalikeProviderDomain(email)) block('lookalike_domain');

  if (isAlias) flag('alias_address');
  if (looksMachineGenerated(firstName)) flag('machine_generated_name');

  return { decision, normalizedEmail, reasons, isAlias };
}

/** Exposed for tests and the cleanup script. */
export const __internals = {
  DISPOSABLE_DOMAINS,
  KNOWN_PROVIDER_DOMAINS,
  editDistance,
};
