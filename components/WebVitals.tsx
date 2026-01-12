'use client';

import { useEffect } from 'react';
import { onCLS, onLCP, onFCP, onTTFB, onINP, Metric } from 'web-vitals';
import { trackWebVital } from '@/lib/analytics';

function getRating(value: number, thresholds: [number, number]): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds[0]) return 'good';
  if (value <= thresholds[1]) return 'needs-improvement';
  return 'poor';
}

export default function WebVitals() {
  useEffect(() => {
    // Track Core Web Vitals
    onCLS((metric: Metric) => {
      const rating = getRating(metric.value, [0.1, 0.25]);
      trackWebVital('cls', metric.value, rating, metric.delta);
    });

    onLCP((metric: Metric) => {
      const rating = getRating(metric.value, [2500, 4000]);
      trackWebVital('lcp', metric.value, rating, metric.delta);
    });

    onFCP((metric: Metric) => {
      const rating = getRating(metric.value, [1800, 3000]);
      trackWebVital('fcp', metric.value, rating, metric.delta);
    });

    onTTFB((metric: Metric) => {
      const rating = getRating(metric.value, [800, 1800]);
      trackWebVital('ttfb', metric.value, rating, metric.delta);
    });

    onINP((metric: Metric) => {
      const rating = getRating(metric.value, [200, 500]);
      trackWebVital('inp', metric.value, rating, metric.delta);
    });
  }, []);

  return null; // This component doesn't render anything
}
