import Link from 'next/link';
import { Wordmark } from '@/components/brand/Wordmark';

type LinkGroup = { heading: string; links: { label: string; href: string }[] };

const LINK_GROUPS: LinkGroup[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Tools', href: '/#tools' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Roadmap', href: '/roadmap' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Guides', href: '/guides' },
      { label: 'Thinking', href: '/thinking' },
      { label: 'Articles', href: '/articles' },
      { label: 'Enterprise', href: '/enterprise' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/terms' },
      { label: 'Security', href: '/security' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer
      style={{
        background: 'var(--bg-canvas)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '48px 24px 40px',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          className="marketing-footer-top"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 32,
            marginBottom: 40,
          }}
        >
          <div style={{ maxWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Wordmark size="sm" />
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.55, margin: 0 }}>
              Tools for long-term thinking. A decision-support platform that makes invisible consequences visible.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            {LINK_GROUPS.map((group) => (
              <div key={group.heading}>
                <div
                  className="eyebrow"
                  style={{ fontSize: 10, marginBottom: 14, color: 'var(--text-muted)' }}
                >
                  {group.heading}
                </div>
                {group.links.map((link) => (
                  <Link
                    key={link.label + link.href}
                    href={link.href}
                    style={{
                      display: 'block',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                      marginBottom: 8,
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            paddingTop: 24,
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            © {new Date().getFullYear()} Cortex Technologies
          </span>
          <p
            style={{
              flexBasis: '100%',
              order: 3,
              fontSize: 11,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Money Guy Mutants is an independent, fan-made project built by
            personal-finance enthusiasts. We are not affiliated with, endorsed
            by, or sponsored by The Money Guy Show or Abound Wealth Management,
            LLC. &ldquo;The Money Guy Show&rdquo; and related marks are the
            property of their respective owners.
          </p>
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--emerald-500)',
                boxShadow: '0 0 6px var(--emerald-500)',
              }}
            />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
