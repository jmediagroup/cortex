import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/MarketingShell';

export const metadata: Metadata = {
  title: 'Terms & Privacy',
  description:
    'Money Guy Mutants terms of service and privacy policy, covering acceptance of terms, intellectual property, usage data, and contact information.',
  alternates: { canonical: 'https://moneyguymutants.com/terms' },
};

const sectionStyle: React.CSSProperties = {
  padding: '28px 0',
  borderTop: '1px solid var(--border-subtle)',
};

const h2Style: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: 'var(--text-primary)',
  letterSpacing: '-0.02em',
  margin: '0 0 20px',
};

const h3Style: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: 'var(--text-primary)',
  margin: '20px 0 10px',
};

const pStyle: React.CSSProperties = {
  color: 'var(--text-secondary)',
  lineHeight: 1.65,
  margin: '0 0 16px',
};

const calloutStyle: React.CSSProperties = {
  background: 'var(--bg-glass)',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-md)',
  padding: '16px 20px',
  margin: '16px 0',
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <section
        className="hero-gradient"
        style={{ padding: '96px 24px 48px', textAlign: 'center' }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div
            className="eyebrow"
            style={{ marginBottom: 16, color: 'var(--text-tertiary)' }}
          >
            LEGAL
          </div>
          <h1
            className="h-hero"
            style={{ margin: '0 0 16px', fontSize: 'clamp(40px,6vw,56px)' }}
          >
            Terms of service &amp; privacy policy.
          </h1>
          <p
            style={{
              fontSize: 15,
              color: 'var(--text-tertiary)',
              margin: 0,
              fontFamily: 'var(--font-mono)',
            }}
          >
            Last updated · January 16, 2026
          </p>
        </div>
      </section>

      <article
        style={{
          maxWidth: 760,
          margin: '0 auto',
          padding: '32px 24px 96px',
          color: 'var(--text-secondary)',
        }}
      >
        <p style={{ ...pStyle, fontSize: 17 }}>
          This document governs the use of all websites, digital products, and services within the <strong style={{ color: 'var(--text-primary)' }}>J Media Group LLC</strong> ecosystem (the &ldquo;Ecosystem&rdquo;). By accessing any site within this Ecosystem, you agree to these terms. These services are built and maintained by <strong style={{ color: 'var(--text-primary)' }}>J Media Group LLC</strong>, a multimedia production company.
        </p>

        <section style={sectionStyle}>
          <h2 style={h2Style}>1. Terms of service.</h2>

          <h3 style={h3Style}>A. Acceptance of terms</h3>
          <p style={pStyle}>
            By using our websites, you certify that you are at least 18 years of age. If you are using the services on behalf of a business, that business accepts these terms.
          </p>

          <h3 style={h3Style}>B. Intellectual property</h3>
          <p style={pStyle}>
            Unless otherwise stated, all content (text, graphics, logos, music, and code) is the intellectual property of <strong style={{ color: 'var(--text-primary)' }}>J Media Group LLC</strong> or its content creators.
          </p>
          <div style={calloutStyle}>
            <p style={{ ...pStyle, margin: 0 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Limited license.</strong> You are granted a non-exclusive, non-transferable license to view the content for personal use. You may not reproduce, redistribute, or scrape content without express written consent.
            </p>
          </div>

          <h3 style={h3Style}>C. User conduct &amp; prohibited acts</h3>
          <p style={pStyle}>You agree not to:</p>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: 20, lineHeight: 1.75 }}>
            <li>Use the ecosystem for any unlawful purpose.</li>
            <li>Attempt to bypass security features or disrupt the hosting environment.</li>
            <li>Submit false or malicious information via contact forms or interactive tools.</li>
          </ul>

          <h3 style={h3Style}>D. Disclaimers &amp; limitation of liability</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={calloutStyle}>
              <p style={{ ...pStyle, margin: 0 }}>
                <strong style={{ color: 'var(--text-primary)' }}>&ldquo;As is&rdquo; basis.</strong> All services and information are provided &ldquo;as is.&rdquo; We make no warranties regarding accuracy, completeness, or uptime.
              </p>
            </div>
            <div style={calloutStyle}>
              <p style={{ ...pStyle, margin: 0 }}>
                <strong style={{ color: 'var(--text-primary)' }}>No professional advice.</strong> Information provided on our sites is for informational purposes only and does not constitute professional, legal, or financial advice.
              </p>
            </div>
            <div style={calloutStyle}>
              <p style={{ ...pStyle, margin: 0 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Third-party links.</strong> Our sites may link to external websites. J Media Group LLC is not responsible for the content, privacy policies, or practices of these third parties.
              </p>
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>2. Privacy policy.</h2>

          <h3 style={h3Style}>A. Information we collect</h3>
          <p style={pStyle}>We collect information to provide better services to our users, including:</p>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: 20, lineHeight: 1.75 }}>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Personal information.</strong> Name and email address when provided voluntarily via contact forms or newsletter sign-ups.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>Usage data.</strong> IP addresses, browser types, and page interaction data collected via cookies and analytics tools.
            </li>
          </ul>

          <h3 style={h3Style}>B. How we use your data</h3>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: 20, lineHeight: 1.75 }}>
            <li>To maintain and improve our websites and user experience.</li>
            <li>To communicate with you regarding inquiries or subscriptions.</li>
            <li>To monitor the technical health of our web ecosystem.</li>
          </ul>

          <h3 style={h3Style}>C. Sharing &amp; disclosure</h3>
          <div style={calloutStyle}>
            <p style={{ ...pStyle, margin: 0 }}>
              <strong style={{ color: 'var(--emerald-500)' }}>We do not sell your personal data.</strong>{' '}
              We share information only with essential service providers (such as hosting platforms and email service providers) or if required by law to comply with a judicial proceeding.
            </p>
          </div>

          <h3 style={h3Style}>D. Cookies &amp; tracking</h3>
          <p style={pStyle}>
            We use cookies to enhance user experience. You can instruct your browser to refuse all cookies, though some portions of our sites may not function correctly as a result.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>3. Specialized disclaimers.</h2>

          <h3 style={h3Style}>A. Affiliate &amp; compensation disclosure</h3>
          <p style={pStyle}>
            Certain websites within the J Media Group LLC ecosystem may participate in affiliate marketing programs. We may earn a commission on purchases made through our links at no additional cost to you.
          </p>

          <h3 style={h3Style}>B. Directory &amp; local listings</h3>
          <p style={pStyle}>
            For sites providing directory services, J Media Group LLC does not guarantee the quality, safety, or legality of the businesses listed. Users engage with third-party vendors at their own risk.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>4. Contact.</h2>
          <p style={pStyle}>For questions regarding these policies, please contact:</p>
          <div
            style={{
              background: 'linear-gradient(135deg, #121620 0%, #0A0E14 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px 32px',
              color: '#F5F5F7',
            }}
          >
            <p style={{ fontWeight: 700, fontSize: 17, margin: '0 0 8px' }}>
              J Media Group LLC
            </p>
            <a
              href="mailto:support@jmediagroup.net"
              style={{
                color: '#00F0A0',
                textDecoration: 'none',
                fontSize: 14,
                fontFamily: 'var(--font-mono)',
              }}
            >
              support@jmediagroup.net
            </a>
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}
