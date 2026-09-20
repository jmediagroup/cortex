'use client';

import { useCallback, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

/**
 * Fetch wrapper for the admin API routes: attaches the Supabase access token
 * as a Bearer header and defaults JSON bodies to the right content type.
 */
export function useAdminApi() {
  const supabase = useRef(createBrowserClient()).current;

  const token = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? '';
  }, [supabase]);

  return useCallback(
    async (path: string, init: RequestInit = {}) => {
      const t = await token();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${t}`,
        ...(init.headers as Record<string, string> | undefined),
      };
      if (init.body && !(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';
      return fetch(path, { ...init, headers });
    },
    [token],
  );
}

/** Read `{ error }` from a failed admin API response. */
export async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const json = await res.json();
    return json?.error || fallback;
  } catch {
    return fallback;
  }
}
