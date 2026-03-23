'use client';

import React, { useState } from 'react';
import { Bookmark, Check, Crown, Trash2, Loader2, Share2, Copy, Link as LinkIcon } from 'lucide-react';
import { useScenarios, type Scenario } from '@/lib/useScenarios';
import { createBrowserClient } from '@/lib/supabase/client';

interface SaveScenarioButtonProps {
  toolId: string;
  toolName: string;
  getInputs: () => Record<string, any>;
  getKeyResult: () => string;
  isLoggedIn: boolean;
  onLoginPrompt?: () => void;
}

export default function SaveScenarioButton({
  toolId,
  toolName,
  getInputs,
  getKeyResult,
  isLoggedIn,
  onLoginPrompt,
}: SaveScenarioButtonProps) {
  const {
    scenarios,
    saving,
    freeLimitReached,
    saveScenario,
    deleteScenario,
  } = useScenarios(toolId, toolName);

  const [justSaved, setJustSaved] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Share state
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toolScenarios = scenarios.filter(s => s.tool_id === toolId);

  const handleSave = async () => {
    if (!isLoggedIn) {
      onLoginPrompt?.();
      return;
    }

    // Reset share state on new save
    setShareUrl(null);
    setCopied(false);

    const inputs = getInputs();
    const keyResult = getKeyResult();
    const success = await saveScenario(inputs, keyResult);

    if (success) {
      setJustSaved(true);
      // Get the latest scenario ID (just saved, so it's first in the list after state updates)
      // We read it from scenarios after the next render via a small delay
      setTimeout(() => {
        setJustSaved(false);
      }, 2000);
    } else if (freeLimitReached) {
      setShowUpsell(true);
    }
  };

  // Track last saved scenario: the most recent one for this tool
  const latestScenario = toolScenarios[0] ?? null;

  const handleShare = async (scenarioId: string) => {
    setSharing(true);
    setCopied(false);
    setShareUrl(null);

    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const res = await fetch(`/api/scenarios/${scenarioId}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.share_url);
      }
    } catch {
      // Silently fail
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the input
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteScenario(id);
    // Clear share state if the deleted scenario was the shared one
    if (shareUrl) setShareUrl(null);
    setDeletingId(null);
  };

  return (
    <div className="relative">
      {/* Save button + Share button + saved count */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-60 shadow-sm"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : justSaved ? (
            <Check size={16} />
          ) : (
            <Bookmark size={16} />
          )}
          {justSaved ? 'Saved!' : 'Save Scenario'}
        </button>

        {/* Share button — appears when there are saved scenarios */}
        {latestScenario && !shareUrl && (
          <button
            onClick={() => handleShare(latestScenario.id)}
            disabled={sharing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-60"
          >
            {sharing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Share2 size={16} />
            )}
            Share
          </button>
        )}

        {toolScenarios.length > 0 && (
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all"
          >
            <Bookmark size={14} />
            {toolScenarios.length} saved
          </button>
        )}
      </div>

      {/* Share URL display */}
      {shareUrl && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <LinkIcon size={14} className="text-emerald-600 flex-shrink-0" />
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-sm text-emerald-800 font-medium outline-none min-w-0"
            onFocus={(e) => e.target.select()}
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex-shrink-0"
          >
            {copied ? (
              <>
                <Check size={12} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy
              </>
            )}
          </button>
        </div>
      )}

      {/* Saved scenarios dropdown */}
      {showSaved && toolScenarios.length > 0 && (
        <div className="absolute top-12 right-0 z-40 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Scenarios</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {toolScenarios.map((scenario) => (
              <div key={scenario.id} className="flex items-center justify-between p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-xs text-slate-400">
                    {new Date(scenario.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-slate-700 font-medium truncate">{scenario.key_result || 'Saved scenario'}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleShare(scenario.id)}
                    className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors"
                    title="Share scenario"
                  >
                    <Share2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(scenario.id)}
                    disabled={deletingId === scenario.id}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    {deletingId === scenario.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowSaved(false)}
            className="w-full p-2 text-xs text-slate-400 hover:text-slate-600 transition-colors border-t border-slate-100"
          >
            Close
          </button>
        </div>
      )}

      {/* Free tier upsell modal */}
      {showUpsell && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                <Crown size={24} />
              </div>
              <h3 className="text-xl font-black mb-1">Save More Scenarios</h3>
              <p className="text-indigo-100 text-sm">
                Free accounts can save 1 scenario per tool. Upgrade to Pro for unlimited saves across all tools.
              </p>
            </div>
            <div className="p-6">
              <div className="bg-indigo-50 rounded-xl p-4 mb-5">
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-500 flex-shrink-0" />
                    <span>Unlimited scenario saves</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-500 flex-shrink-0" />
                    <span>Advanced pro features on all tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-500 flex-shrink-0" />
                    <span>Ad-free experience</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpsell(false)}
                  className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Maybe Later
                </button>
                <a
                  href="/pricing"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm text-center hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Crown size={16} />
                  Upgrade
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
