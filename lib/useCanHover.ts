'use client';

import { useSyncExternalStore } from 'react';

/**
 * True only on devices with a real hover pointer (mouse/trackpad).
 * On touch, a tap fires mouseenter and a JS-driven hover look would stick,
 * so components gate their hover state with this. SSR-safe: false on the
 * server and on first hydration render.
 */
const QUERY = '(hover: hover)';

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getSnapshot() {
  return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useCanHover(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
