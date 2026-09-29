'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureSessionAttribution, trackPageView } from '@/lib/analytics';

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Read the session's referrer and UTM tags while the landing URL still
    // has them; tool_viewed events attach this later (lib/tool-funnel.ts).
    captureSessionAttribution();
  }, []);

  useEffect(() => {
    // Track page view on route change
    trackPageView(pathname);
  }, [pathname]);

  return null; // This component doesn't render anything
}
