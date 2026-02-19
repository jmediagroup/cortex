'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { getRecommendedTools, type ToolInfo } from './toolRecommendations';

interface ToolRecommendationSidebarProps {
  context: string;
  className?: string;
}

export default function ToolRecommendationSidebar({
  context,
  className = '',
}: ToolRecommendationSidebarProps) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tools, setTools] = useState<ToolInfo[]>([]);

  useEffect(() => {
    async function checkAccess() {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsPro(false);
        setIsLoading(false);
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('tier')
        .eq('id', session.user.id)
        .single<{ tier: Tier }>();

      const userTier = user?.tier || 'free';
      setIsPro(hasProAccess('finance', userTier));
      setIsLoading(false);
    }

    checkAccess();
  }, []);

  useEffect(() => {
    setTools(getRecommendedTools(context));
  }, [context]);

  if (isLoading || tools.length === 0) {
    return null;
  }

  return (
    <div className={`hidden xl:block w-[320px] shrink-0 ${className}`}>
      <div className="sticky top-24 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
          You might also like
        </p>

        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/apps/${tool.slug}`}
            className="block bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-4 group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm">{tool.name}</p>
                <p className="text-sm text-slate-500 truncate">{tool.description}</p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-slate-300 group-hover:text-emerald-500 transition-colors"
              />
            </div>
          </Link>
        ))}

        {!isPro && (
          <Link
            href="/pricing"
            className="block rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={14} />
                  <p className="font-bold text-sm">Unlock Pro</p>
                </div>
                <p className="text-sm text-emerald-100">
                  Ad-free experience with advanced features
                </p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-emerald-200 group-hover:text-white transition-colors"
              />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
