import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { ADMIN_MORE, ADMIN_NAV, ADMIN_TABS, activeNavItem, isRootRoute } from '../components/admin/nav.ts';

test('the phone tab bar holds four sections plus "More" (Apple caps a tab bar at five)', () => {
  assert.equal(ADMIN_TABS.length, 4);
  assert.equal(ADMIN_TABS.length + ADMIN_MORE.length, ADMIN_NAV.length);
});

test('every admin section folder under app/admin has a nav entry, and vice versa', () => {
  const dir = path.resolve(import.meta.dirname, '../app/admin');
  const folders = readdirSync(dir).filter((f) => statSync(path.join(dir, f)).isDirectory());
  const navFolders = ADMIN_NAV.map((n) => n.href.replace(/^\/admin\/?/, '')).filter(Boolean);
  assert.deepEqual([...navFolders].sort(), [...folders].sort());
});

test('nested editors map to their section so the right tab stays highlighted', () => {
  assert.equal(activeNavItem('/admin')?.key, 'overview');
  assert.equal(activeNavItem('/admin/content/abc')?.key, 'content');
  assert.equal(activeNavItem('/admin/content/new')?.key, 'content');
  assert.equal(activeNavItem('/admin/ads/campaigns/new')?.key, 'ads');
  assert.equal(activeNavItem('/admin/ads/advertisers/xyz')?.key, 'ads');
  assert.equal(activeNavItem('/admin/users')?.key, 'users');
  // A prefix that only looks similar must not match.
  assert.equal(activeNavItem('/admin/adsx'), undefined);
});

test('the tab bar only shows on top-level sections, not on pushed screens', () => {
  for (const item of ADMIN_NAV) assert.ok(isRootRoute(item.href), item.href);
  assert.equal(isRootRoute('/admin/content/new'), false);
  assert.equal(isRootRoute('/admin/ads/advertisers'), false);
  assert.equal(isRootRoute('/admin/ads/campaigns/c1'), false);
});
