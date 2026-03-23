'use client';

import { useState, useEffect, useCallback } from 'react';

export interface RecentTool {
  id: string;
  name: string;
  path: string;
  visitedAt: number;
}

const STORAGE_KEY = 'cortex_recent_tools';
const MAX_RECENT = 3;

export function getRecentTools(): RecentTool[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentTool[];
  } catch {
    return [];
  }
}

export function trackToolVisit(id: string, name: string, path: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentTools().filter((t) => t.id !== id);
    const updated: RecentTool[] = [
      { id, name, path, visitedAt: Date.now() },
      ...existing,
    ].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage might be full or blocked
  }
}

export function useRecentTools(): RecentTool[] {
  const [tools, setTools] = useState<RecentTool[]>([]);

  useEffect(() => {
    setTools(getRecentTools());
  }, []);

  return tools;
}
