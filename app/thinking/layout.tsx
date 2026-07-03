import type { ReactNode } from 'react';
import { MarketingShell } from '@/components/marketing/MarketingShell';

export default function ThinkingLayout({ children }: { children: ReactNode }) {
  return (
    <MarketingShell>
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Money Guy Mutants — Thinking RSS"
        href="https://moneyguymutants.com/thinking/rss.xml"
      />
      {children}
    </MarketingShell>
  );
}
