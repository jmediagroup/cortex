'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

export interface Scenario {
  id: string;
  user_id: string;
  tool_id: string;
  tool_name: string;
  inputs: Record<string, any>;
  key_result: string;
  created_at: string;
}

interface UseScenariosReturn {
  scenarios: Scenario[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  freeLimitReached: boolean;
  saveScenario: (inputs: Record<string, any>, keyResult: string) => Promise<boolean>;
  deleteScenario: (id: string) => Promise<boolean>;
  loadScenarios: () => Promise<void>;
}

export function useScenarios(toolId: string, toolName: string): UseScenariosReturn {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freeLimitReached, setFreeLimitReached] = useState(false);

  const getToken = useCallback(async () => {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  const loadScenarios = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/scenarios', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios);
      }
    } catch {
      // Silently fail - scenarios are not critical
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const saveScenario = useCallback(async (inputs: Record<string, any>, keyResult: string): Promise<boolean> => {
    const token = await getToken();
    if (!token) {
      setError('Please sign in to save scenarios.');
      return false;
    }

    setSaving(true);
    setError(null);
    setFreeLimitReached(false);

    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tool_id: toolId, tool_name: toolName, inputs, key_result: keyResult }),
      });

      if (res.status === 403) {
        const data = await res.json();
        if (data.error === 'FREE_LIMIT_REACHED') {
          setFreeLimitReached(true);
          return false;
        }
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save scenario.');
        return false;
      }

      const data = await res.json();
      setScenarios(prev => [data.scenario, ...prev]);
      return true;
    } catch {
      setError('Failed to save scenario.');
      return false;
    } finally {
      setSaving(false);
    }
  }, [getToken, toolId, toolName]);

  const deleteScenario = useCallback(async (id: string): Promise<boolean> => {
    const token = await getToken();
    if (!token) return false;

    try {
      const res = await fetch(`/api/scenarios?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setScenarios(prev => prev.filter(s => s.id !== id));
        setFreeLimitReached(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [getToken]);

  return {
    scenarios,
    loading,
    saving,
    error,
    freeLimitReached,
    saveScenario,
    deleteScenario,
    loadScenarios,
  };
}
