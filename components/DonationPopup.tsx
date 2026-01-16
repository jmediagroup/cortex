'use client';

import React, { useState, useEffect } from 'react';
import { X, Coffee, Heart, ExternalLink } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';
import { type Tier } from '@/lib/access-control';

const GUMROAD_LINK = 'https://jmediagroup.gumroad.com/coffee';
const POPUP_DELAY_MS = 3 * 60 * 1000; // 3 minutes
const STORAGE_KEY = 'cortex_donation_popup_dismissed';
const DISMISS_DURATION_DAYS = 7; // Don't show again for 7 days after dismissal

export default function DonationPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const checkAndShowPopup = async () => {
      // Check if popup was recently dismissed
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (dismissedAt) {
        const dismissedDate = new Date(parseInt(dismissedAt, 10));
        const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < DISMISS_DURATION_DAYS) {
          return; // Don't show popup yet
        }
      }

      // Check if user is a paying customer
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single() as { data: { tier: Tier } | null };

        // Don't show popup to paying users
        if (userData?.tier && userData.tier !== 'free') {
          return;
        }
      }

      // Set timer to show popup after 3 minutes
      const timer = setTimeout(() => {
        setShowPopup(true);
        trackEvent('donation_popup_shown', { source: 'time_trigger' });
      }, POPUP_DELAY_MS);

      return () => clearTimeout(timer);
    };

    checkAndShowPopup();
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsClosing(false);
      // Store dismissal time
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      trackEvent('donation_popup_dismissed', { action: 'close' });
    }, 200);
  };

  const handleDonate = () => {
    trackEvent('donation_popup_clicked', { destination: 'gumroad' });
    window.open(GUMROAD_LINK, '_blank', 'noopener,noreferrer');
    // Also dismiss the popup after clicking
    handleClose();
  };

  const handleMaybeLater = () => {
    trackEvent('donation_popup_dismissed', { action: 'maybe_later' });
    handleClose();
  };

  if (!showPopup) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md mx-4 transition-all duration-200 ${
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-8 text-white text-center">
            <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Coffee size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-black mb-2">Enjoying Cortex?</h3>
            <p className="text-amber-100 font-medium">
              These tools are free, but they took time to build.
            </p>
          </div>

          {/* Body */}
          <div className="p-8">
            <p className="text-slate-600 font-medium text-center mb-6 leading-relaxed">
              If Cortex has helped you make better financial decisions, consider buying me a coffee.
              Your support helps keep these tools free for everyone.
            </p>

            <div className="space-y-3">
              {/* Donate button */}
              <button
                onClick={handleDonate}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-2xl font-black text-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Coffee size={20} />
                Buy Me a Coffee - $5
                <ExternalLink size={16} className="opacity-70" />
              </button>

              {/* Maybe later */}
              <button
                onClick={handleMaybeLater}
                className="w-full text-slate-500 px-6 py-3 rounded-xl font-medium hover:text-slate-700 hover:bg-slate-50 transition-all text-sm"
              >
                Maybe later
              </button>
            </div>

            {/* Footer note */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Heart size={12} className="text-rose-400" />
                Thanks for using Cortex
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
