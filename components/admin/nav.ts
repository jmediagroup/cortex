import {
  BarChart3,
  CircleDollarSign,
  CreditCard,
  FileText,
  HandCoins,
  LayoutDashboard,
  Megaphone,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Tone } from './ui/List';

export interface AdminNavItem {
  key: string;
  label: string;
  /** Shorter name for the narrow iPad rail and the phone tab bar. */
  short?: string;
  href: string;
  icon: LucideIcon;
  tone: Tone;
  group: string;
  /** Shown in the phone tab bar; everything else lives under "More". */
  tab?: boolean;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { key: 'overview', label: 'Overview', href: '/admin', icon: LayoutDashboard, tone: 'navy', group: 'Home', tab: true },
  { key: 'content', label: 'Content', href: '/admin/content', icon: FileText, tone: 'blue', group: 'Publish', tab: true },
  { key: 'ads', label: 'Ads', href: '/admin/ads', icon: Megaphone, tone: 'orange', group: 'Revenue', tab: true },
  { key: 'offers', label: 'Offers', href: '/admin/offers', icon: HandCoins, tone: 'amber', group: 'Revenue' },
  { key: 'monetization', label: 'Monetization', short: 'Scorecard', href: '/admin/monetization', icon: CircleDollarSign, tone: 'green', group: 'Revenue' },
  { key: 'users', label: 'Users', href: '/admin/users', icon: Users, tone: 'sky', group: 'People', tab: true },
  { key: 'subscriptions', label: 'Subscriptions', short: 'Billing', href: '/admin/subscriptions', icon: CreditCard, tone: 'violet', group: 'People' },
  { key: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: BarChart3, tone: 'gray', group: 'Insights' },
];

export const ADMIN_TABS = ADMIN_NAV.filter((n) => n.tab);
export const ADMIN_MORE = ADMIN_NAV.filter((n) => !n.tab);

/** The nav item a path belongs to (nested editors map to their section). */
export function activeNavItem(pathname: string): AdminNavItem | undefined {
  if (pathname === '/admin') return ADMIN_NAV[0];
  return ADMIN_NAV.slice(1).find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
}

/** Top-level sections show the phone tab bar; pushed screens (editors) hide it. */
export function isRootRoute(pathname: string): boolean {
  return ADMIN_NAV.some((n) => n.href === pathname);
}
