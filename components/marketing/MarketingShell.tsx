import type { ReactNode } from 'react';
import { MarketingNav } from './Nav';
import { MarketingFooter } from './Footer';
import { RevealBootstrap, RevealObserver } from '@/components/ui/RevealObserver';

type Props = {
  children: ReactNode;
  hideFooter?: boolean;
};

export function MarketingShell({ children, hideFooter }: Props) {
  return (
    <>
      <RevealBootstrap />
      <RevealObserver />
      <MarketingNav />
      <main style={{ background: 'var(--bg-canvas)', minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </main>
      {!hideFooter && <MarketingFooter />}
    </>
  );
}
