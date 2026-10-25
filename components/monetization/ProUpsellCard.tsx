'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Check } from 'lucide-react';
import { TOOL_BENEFITS, DEFAULT_PRO_BENEFITS } from './ProGatedPreview';

interface ProUpsellCardProps {
  toolId: string;
  isLoggedIn: boolean;
}

export default function ProUpsellCard({ toolId, isLoggedIn }: ProUpsellCardProps) {
  const router = useRouter();
  const benefits = TOOL_BENEFITS[toolId] || DEFAULT_PRO_BENEFITS;

  return (
    <div
      className="bg-[var(--obsidian-800)] rounded-xl p-8 md:p-10 text-white relative overflow-hidden shadow-[var(--shadow-card)]"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
        <Sparkles size={160} fill="currentColor" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 text-white">
          <Sparkles size={20} />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/85">Pro Feature</span>
        </div>
        <h3 className="text-2xl font-bold mb-2 text-white">Unlock Pro</h3>
        <p className="text-white/85 font-medium text-sm mb-6 max-w-lg">
          Unlock the full analysis with advanced modeling tools to make smarter financial decisions.
        </p>
        <div className="space-y-3 mb-8">
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="bg-white/15 rounded-full p-1 text-white">
                <Check size={12} strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold text-white/90">{benefit}</span>
            </div>
          ))}
        </div>
        <button
          data-funnel-ignore
          onClick={() => router.push('/pricing')}
          className="bg-white text-[var(--navy)] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[var(--bg-card-hover)] transition-all shadow-md hover:scale-105 active:scale-95"
        >
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}
