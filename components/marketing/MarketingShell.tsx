import type { ReactNode } from 'react';
import { MarketingNav } from './Nav';
import { MarketingFooter } from './Footer';

type Props = {
  children: ReactNode;
  hideFooter?: boolean;
};

export function MarketingShell({ children, hideFooter }: Props) {
  return (
    <>
      <MarketingNav />
      <main style={{ background: 'var(--bg-canvas)', minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </main>
      {!hideFooter && <MarketingFooter />}
    </>
  );
}
