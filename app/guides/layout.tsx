import type { ReactNode } from 'react';
import { MarketingShell } from '@/components/marketing/MarketingShell';

export default function GuidesLayout({ children }: { children: ReactNode }) {
  return (
    <MarketingShell>
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Cortex — Guides RSS"
        href="https://cortex.vip/guides/rss.xml"
      />
      {children}
    </MarketingShell>
  );
}
