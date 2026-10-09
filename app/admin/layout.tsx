import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
  // "Add to Home Screen" opens straight into the admin as its own app.
  manifest: '/admin.webmanifest',
  appleWebApp: { capable: true, title: 'MGM Admin', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#f2f4f7',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
