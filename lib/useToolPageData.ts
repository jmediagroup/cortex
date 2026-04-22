'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { trackToolVisit } from '@/lib/useRecentTools';

type ToolPageData = {
  hasSession: boolean;
  isPro: boolean;
  loading: boolean;
  initialValues?: Record<string, unknown>;
};

type Args = {
  toolId: string;
  toolName: string;
  toolPath: string;
};

/**
 * Bundles the repeated per-tool page bootstrapping:
 * - Resolve the current session and Pro access.
 * - Hydrate a saved scenario from a `?scenario=<token>` query param.
 * - Track the tool visit for the "recent tools" list.
 */
export function useToolPageData({ toolId, toolName, toolPath }: Args): ToolPageData {
  const searchParams = useSearchParams();
  const [hasSession, setHasSession] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | undefined>();

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      setHasSession(!!session);

      if (session) {
        const { data: userData } = (await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single()) as { data: { tier: Tier } | null };
        if (active && userData?.tier) {
          setIsPro(hasProAccess('finance', userData.tier));
        }
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const token = searchParams.get('scenario');
    if (!token) return;
    let active = true;
    fetch(`/api/scenarios/shared/${token}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.scenario?.inputs) setInitialValues(data.scenario.inputs);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [searchParams]);

  useEffect(() => {
    trackToolVisit(toolId, toolName, toolPath);
  }, [toolId, toolName, toolPath]);

  return { hasSession, isPro, loading, initialValues };
}
