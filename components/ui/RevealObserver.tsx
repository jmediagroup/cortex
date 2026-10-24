'use client';

import { useEffect } from 'react';

/**
 * Reveals `.reveal` / `.reveal-line` elements once as they scroll into view
 * by adding `.in` (styles live in app/motion.css). Mount it once per shell.
 *
 * Safety: elements are only hidden while <html class="js"> is present (set by
 * the inline bootstrap script in the shell before content paints), and under
 * reduced motion or without IntersectionObserver everything is shown at once.
 * Each element is unobserved after it reveals, so nothing ever replays.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js');

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const select = () => document.querySelectorAll<HTMLElement>('.reveal:not(.in), .reveal-line:not(.in)');

    if (reduce || !('IntersectionObserver' in window)) {
      select().forEach((el) => el.classList.remove('reveal', 'reveal-line', 'in'));
      return;
    }

    // Reveal, then once the transition has played drop the motion classes so
    // the element returns to its natural styles (hover lifts, inline
    // transitions) with no visual change.
    const settle = (el: HTMLElement) => {
      el.classList.add('in');
      const i = parseFloat(getComputedStyle(el).getPropertyValue('--i')) || 0;
      const total = 900 + i * 80 + 60;
      window.setTimeout(() => el.classList.remove('reveal', 'reveal-line', 'in'), total);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          io.unobserve(en.target);
          settle(en.target as HTMLElement);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    const observe = () => select().forEach((el) => io.observe(el));
    observe();

    // Client-side navigations and streamed server components add new
    // `.reveal` elements after mount; pick them up without replaying old ones.
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}

/**
 * Inline bootstrap: flags <html class="js"> before the first paint so
 * `.reveal` elements start hidden only when JS is actually running. Render it
 * at the top of the shell, ahead of the content.
 */
export function RevealBootstrap() {
  return (
    <script
      // Runs synchronously during HTML parsing; no React state involved.
      dangerouslySetInnerHTML={{
        __html: "document.documentElement.classList.add('js')",
      }}
    />
  );
}
