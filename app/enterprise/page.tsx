'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Mail,
  User,
  Phone,
  MessageSquare,
  Users,
  Loader2,
  ShieldCheck,
  Globe,
  Zap,
  BarChart3,
} from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { COMPANY_SIZES } from '@/lib/validation';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingIcon } from '@/components/marketing/Icons';
import { Button } from '@/components/ui/Button';

export default function EnterprisePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    trackEvent('enterprise_page_view');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enterprise-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          companyName,
          companySize,
          phone: phone || null,
          message,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit form');

      await trackEvent('enterprise_form_submitted', { company_size: companySize }, true);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      console.error('Form submission error:', err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <MarketingShell>
        <section
          className="hero-gradient"
          style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '96px 24px',
          }}
        >
          <div
            style={{
              maxWidth: 560,
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--off-white)',
              borderRadius: 'var(--radius-md)',
              padding: '48px 40px',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                margin: '0 auto 24px',
                width: 72,
                height: 72,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(29, 128, 114, 0.12)',
                border: '1px solid rgba(29, 128, 114, 0.28)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--teal-green)',
              }}
            >
              <MarketingIcon name="check" size={32} stroke={2.5} />
            </div>
            <h1
              className="h-hero"
              style={{ fontSize: 32, margin: '0 0 12px' }}
            >
              You&apos;re in. Thank you.
            </h1>
            <p
              style={{
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                margin: '0 0 28px',
              }}
            >
              We&apos;ve received your request. A member of our team will be in touch within 1–2 business days to discuss your enterprise needs.
            </p>
            <div
              style={{
                background: 'var(--off-white)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 20,
                textAlign: 'left',
                marginBottom: 28,
              }}
            >
              <div className="mgm-eyebrow" style={{ marginBottom: 12 }}>
                WHAT HAPPENS NEXT
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Our team will review your requirements',
                  'We’ll reach out to schedule a discovery call',
                  'You’ll receive a custom proposal tailored to your needs',
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                      lineHeight: 1.55,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        marginTop: 2,
                        color: 'var(--teal-green)',
                        display: 'inline-flex',
                      }}
                    >
                      <MarketingIcon name="check" size={14} stroke={2.6} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Button variant="secondary" tone="navy" onClick={() => router.push('/')}>
              Back to home <MarketingIcon name="arrowRight" size={14} />
            </Button>
          </div>
        </section>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <section
        className="hero-gradient"
        style={{ padding: '80px 24px', position: 'relative' }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
            gap: 48,
            alignItems: 'start',
          }}
          className="marketing-enterprise-grid"
        >
          <div>
            <div className="mgm-eyebrow" style={{ marginBottom: 16 }}>
              ENTERPRISE
            </div>
            <h1
              className="h-hero"
              style={{ margin: '0 0 20px', fontSize: 'clamp(36px,5vw,52px)' }}
            >
              Precision finance tools, built around your org.
            </h1>
            <p
              style={{
                fontSize: 17,
                color: 'var(--gray-600)',
                lineHeight: 1.6,
                margin: '0 0 32px',
              }}
            >
              Custom integrations, white-label deployments, and dedicated support for organizations that need precision financial tools at scale.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  icon: <Globe size={16} />,
                  title: 'White-label solutions',
                  desc: 'Fully branded tools deployed on your domain.',
                },
                {
                  icon: <Zap size={16} />,
                  title: 'Custom integrations',
                  desc: 'API access and integrations with your existing systems.',
                },
                {
                  icon: <BarChart3 size={16} />,
                  title: 'Advanced analytics',
                  desc: 'Detailed usage analytics and reporting dashboards.',
                },
                {
                  icon: <Users size={16} />,
                  title: 'Dedicated support',
                  desc: 'Priority support with a named account manager.',
                },
              ].map((feat) => (
                <div
                  key={feat.title}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: 16,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--off-white)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 34,
                      height: 34,
                      borderRadius: 'var(--radius-circle)',
                      background: 'var(--mint)',
                      color: 'var(--navy)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {feat.icon}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--navy)',
                        margin: '0 0 4px',
                      }}
                    >
                      {feat.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: 'var(--gray-600)',
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                lineHeight: 1.55,
                marginTop: 32,
                paddingTop: 20,
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              Trusted by financial advisors, HR teams, and organizations that value clarity in decision-making.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--off-white)',
              borderRadius: 'var(--radius-md)',
              padding: 32,
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--navy)',
                  letterSpacing: '-0.01em',
                  margin: '0 0 6px',
                }}
              >
                Let&apos;s talk.
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--gray-600)',
                  margin: 0,
                }}
              >
                Tell us about your needs and we&apos;ll create a custom solution.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  background: 'var(--crimson-tint)',
                  color: 'var(--crimson-500)',
                  border: '1px solid var(--crimson-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="First name" icon={<User size={16} />}>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Last name" icon={<User size={16} />}>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Smith"
                  style={inputStyle}
                />
              </FormField>
            </div>

            <FormField label="Work email" icon={<Mail size={16} />}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                style={inputStyle}
              />
            </FormField>

            <FormField label="Company name" icon={<Building2 size={16} />}>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                style={inputStyle}
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <FormField label="Company size" icon={<Users size={16} />}>
                <select
                  required
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="" disabled>
                    Select size
                  </option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size} employees
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Phone (optional)" icon={<Phone size={16} />}>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  style={inputStyle}
                />
              </FormField>
            </div>

            <FormField label="How can we help?" icon={<MessageSquare size={16} />}>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Tell us about your use case, number of users, timeline, etc."
                style={{ ...inputStyle, resize: 'vertical', paddingTop: 12 }}
              />
            </FormField>

            <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Submitting...
                </>
              ) : (
                <>
                  Submit request <MarketingIcon name="arrowRight" size={14} />
                </>
              )}
            </Button>

            <p
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                textAlign: 'center',
                margin: 0,
              }}
            >
              We&apos;ll respond within 1–2 business days.
            </p>

            <div
              style={{
                textAlign: 'center',
                paddingTop: 14,
                borderTop: '1px solid var(--border-subtle)',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              Not ready for enterprise?{' '}
              <Link
                href="/pricing"
                style={{ color: 'var(--navy)', fontWeight: 700, textDecoration: 'underline' }}
              >
                View our plans
              </Link>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6,
                color: 'var(--text-muted)',
              }}
            >
              <ShieldCheck size={14} />
              <span
                className="eyebrow"
                style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)' }}
              >
                YOUR INFORMATION IS SECURE
              </span>
            </div>
          </form>
        </div>
      </section>
    </MarketingShell>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px 12px 40px',
  background: 'var(--white)',
  border: '1px solid var(--gray-300)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--navy)',
  fontSize: 14,
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 150ms ease',
};

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span
        className="eyebrow"
        style={{ fontSize: 10, color: 'var(--text-tertiary)', margin: 0 }}
      >
        {label.toUpperCase()}
      </span>
      <div style={{ position: 'relative' }}>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)',
            pointerEvents: 'none',
          }}
        >
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}
