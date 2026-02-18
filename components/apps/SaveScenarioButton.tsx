'use client';

import React, { useState } from 'react';
import { Bookmark, Check, Crown, Trash2, Loader2 } from 'lucide-react';
import { useScenarios, type Scenario } from '@/lib/useScenarios';

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
  const [showUpsell, setShowUpsell] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toolScenarios = scenarios.filter(s => s.tool_id === toolId);

  const handleSave = async () => {
    if (!isLoggedIn) {
      onLoginPrompt?.();
      return;
    }

    const inputs = getInputs();
    const keyResult = getKeyResult();
    const success = await saveScenario(inputs, keyResult);

    if (success) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } else if (freeLimitReached) {
      setShowUpsell(true);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteScenario(id);
    setDeletingId(null);
  };

  return (
    <div className="relative">
      {/* Save button + saved count */}
      <div className="flex items-center gap-2">
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
                <button
                  onClick={() => handleDelete(scenario.id)}
                  disabled={deletingId === scenario.id}
                  className="flex-shrink-0 p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                >
                  {deletingId === scenario.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
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
