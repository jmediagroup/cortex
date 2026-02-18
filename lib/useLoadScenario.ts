'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to load saved scenario inputs from sessionStorage.
 * The My Scenarios page stores inputs in sessionStorage before navigating to a tool.
 * This hook reads and clears those inputs on mount.
 */
export function useLoadScenario(toolId: string): Record<string, any> | null {
  const [loaded, setLoaded] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const key = `scenario_load_${toolId}`;
    const stored = sessionStorage.getItem(key);
    if (stored) {
      try {
        setLoaded(JSON.parse(stored));
      } catch {
        // Invalid JSON, ignore
      }
      sessionStorage.removeItem(key);
    }
  }, [toolId]);

  return loaded;
}
