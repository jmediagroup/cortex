import { Button } from '@/components/ui/Button';
import { MarketingShell } from './MarketingShell';
import { MarketingIcon } from './Icons';

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  body?: React.ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
};

export function MarketingPlaceholder({
  eyebrow,
  title,
  description,
  body,
  ctaHref = '/',
  ctaLabel = 'Back to home',
}: Props) {
  return (
    <MarketingShell>
      <section style={{ padding: '96px 24px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 16 }}>
            {eyebrow}
          </div>
          <h1
            className="h-hero"
            style={{ margin: '0 0 16px', fontSize: 'clamp(40px,6vw,56px)' }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 24px 96px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {body && (
            <div
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 32,
                boxShadow: 'var(--shadow-card)',
                marginBottom: 40,
              }}
            >
              {body}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Button variant="primary" href={ctaHref}>
              {ctaLabel} <MarketingIcon name="arrowRight" size={14} />
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
