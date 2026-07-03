import type { ReactNode } from 'react';
import { MarketingShell } from '@/components/marketing/MarketingShell';

export default function ArticlesLayout({ children }: { children: ReactNode }) {
  return (
    <MarketingShell>
      {/*
        Auto-discovery of the RSS feed so news aggregators, browsers, and
        AI search engines can subscribe to article updates without scraping.
      */}
      <link
        rel="alternate"
        type="application/rss+xml"
        title="Money Guy Mutants — Articles RSS"
        href="https://moneyguymutants.com/articles/rss.xml"
      />
      {children}
    </MarketingShell>
  );
}
