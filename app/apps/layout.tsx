import type { ReactNode } from 'react';
import { AppShellClient } from '@/components/app/AppShellClient';

export default function AppsLayout({ children }: { children: ReactNode }) {
  return <AppShellClient>{children}</AppShellClient>;
}
