'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import type { ArchetypeId } from '@/lib/personality-quiz-data';
import {
  buildIntentUrls,
  buildShareCopy,
  buildShareImageUrl,
} from '@/lib/personality-quiz-share';

type ShareBarProps = {
  primary: ArchetypeId;
  secondary: ArchetypeId;
  /** Optional retake action — only rendered when provided. */
  onRetake?: () => void;
};

/**
 * Multi-network share bar used by both the live quiz result and the
 * public `/r/[archetype]` shared landing.
 *
 * Networks fall into two buckets:
 *   - URL-driven (X, Facebook, LinkedIn) — open intent URLs that pick
 *     up the dynamic OG image from the result page automatically.
 *   - Image-driven (Instagram) — there is no public IG share URL, so
 *     we surface a portrait PNG download + caption copy instead.
 *
 * The native share sheet is offered when available (mobile), giving
 * users access to Instagram, Messages, etc. without leaving the page.
 */
export function ShareBar({ primary, secondary, onRetake }: ShareBarProps) {
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  const intents = buildIntentUrls(primary, secondary);
  const copy = buildShareCopy(primary, secondary);
  const portraitUrl = buildShareImageUrl(primary, secondary, 'portrait');

  useEffect(() => {
    setHasNativeShare(
      typeof navigator !== 'undefined' && typeof navigator.share === 'function',
    );
  }, []);

  const flashCopied = (key: string) => {
    setCopiedTarget(key);
    window.setTimeout(() => setCopiedTarget((v) => (v === key ? null : v)), 2000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(copy.url);
      flashCopied('link');
    } catch {
      /* clipboard blocked — silently no-op */
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(copy.instagram.caption);
      flashCopied('caption');
    } catch {
      /* no-op */
    }
  };

  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
      const res = await fetch(portraitUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `cortex-${primary}-personality.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fall back: open the image in a new tab so the user can save it manually.
      window.open(portraitUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) return;
    try {
      await navigator.share({
        title: 'Cortex Financial Personality Quiz',
        text: copy.generic,
        url: copy.url,
      });
    } catch {
      /* user cancelled — no-op */
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        paddingTop: 20,
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="eyebrow"
        style={{ color: 'var(--text-tertiary)', letterSpacing: '0.18em' }}
      >
        SHARE YOUR RESULT
      </div>

      {/* Primary action row: network buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <NetworkButton
          label="X"
          href={intents.x}
          aria="Share on X"
          icon={<XIcon />}
        />
        <NetworkButton
          label="Facebook"
          href={intents.facebook}
          aria="Share on Facebook"
          icon={<FacebookIcon />}
        />
        <NetworkButton
          label="LinkedIn"
          href={intents.linkedin}
          aria="Share on LinkedIn"
          icon={<LinkedInIcon />}
        />
        <button
          type="button"
          onClick={handleDownloadImage}
          disabled={downloading}
          aria-label="Download Instagram-ready image"
          style={chipBtnStyle({ pressed: false })}
        >
          <InstagramIcon />
          <span>{downloading ? 'Preparing…' : 'Instagram'}</span>
        </button>
        {hasNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            aria-label="Open native share sheet"
            style={chipBtnStyle({ pressed: false })}
          >
            <ShareIcon />
            <span>More</span>
          </button>
        )}
      </div>

      {/* Secondary action row: link/caption copy + retake */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={handleCopyLink}
          style={textBtnStyle(copiedTarget === 'link')}
        >
          {copiedTarget === 'link' ? '✓ Link copied' : 'Copy link'}
        </button>
        <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
          ·
        </span>
        <button
          type="button"
          onClick={handleCopyCaption}
          style={textBtnStyle(copiedTarget === 'caption')}
        >
          {copiedTarget === 'caption' ? '✓ Caption copied' : 'Copy IG caption'}
        </button>
        {onRetake && (
          <>
            <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
              ·
            </span>
            <button type="button" onClick={onRetake} style={textBtnStyle(false)}>
              Retake quiz
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- internal pieces ---------------- */

function NetworkButton({
  label,
  href,
  aria,
  icon,
}: {
  label: string;
  href: string;
  aria: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={aria}
      style={chipBtnStyle({ pressed: false, asLink: true })}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function chipBtnStyle({
  pressed,
  asLink,
}: {
  pressed: boolean;
  asLink?: boolean;
}): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    minHeight: 40,
    borderRadius: 9999,
    background: pressed ? 'var(--emerald-tint)' : 'var(--bg-glass)',
    border: `1px solid ${pressed ? 'var(--emerald-500)' : 'var(--glass-border-strong)'}`,
    color: pressed ? 'var(--emerald-500)' : 'var(--text-primary)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'inherit',
    transition: 'background 160ms, border-color 160ms, color 160ms',
    ...(asLink ? { display: 'inline-flex' } : {}),
  };
}

function textBtnStyle(active: boolean): CSSProperties {
  return {
    background: 'transparent',
    border: 0,
    padding: 0,
    color: active ? 'var(--emerald-500)' : 'var(--text-tertiary)',
    fontSize: 13,
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    fontFamily: 'inherit',
  };
}

/* ---------------- icons ---------------- */

const ICON: CSSProperties = {
  width: 16,
  height: 16,
  display: 'inline-block',
  flexShrink: 0,
};

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={ICON} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={ICON} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={ICON} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={ICON}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={ICON}
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
