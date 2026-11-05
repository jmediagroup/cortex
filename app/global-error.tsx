'use client';

/**
 * Last-resort error screen, used only when the root layout itself fails
 * (app/error.tsx handles everything below it). It replaces the whole
 * document, so it renders its own <html>/<body> and inline styles — the app
 * stylesheet may be what failed.
 *
 * It never shows the error message or stack: in production Next.js already
 * strips server error details, and this screen shows only the opaque
 * `digest`, which matches the server log entry for support.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          background: '#F7F3F3',
          color: '#08375A',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          textAlign: 'center',
        }}
      >
        <main style={{ maxWidth: 520 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#C8102E', margin: '0 0 12px' }}>
            SOMETHING BROKE
          </p>
          <h1 style={{ fontSize: 32, margin: '0 0 16px', lineHeight: 1.2 }}>We hit an unexpected error.</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: '#48494A', margin: '0 0 28px' }}>
            Please try again. If it keeps happening, email us and include the reference below.
          </p>
          {error.digest && (
            <p style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12, color: '#6B6B6B', margin: '0 0 24px' }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: '#F26531',
              color: '#fff',
              border: 0,
              borderRadius: 4,
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              marginRight: 12,
            }}
          >
            Try again
          </button>
          {/* A plain <a>, not next/link: the router may be what failed. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" style={{ color: '#054C7D', fontSize: 14, fontWeight: 600 }}>
            Go to the homepage
          </a>
        </main>
      </body>
    </html>
  );
}
