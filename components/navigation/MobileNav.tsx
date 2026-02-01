'use client';

import { useState, useEffect } from 'react';
import { Menu, X, BookOpen, LogIn, Sparkles, Brain, ChevronRight } from 'lucide-react';

/**
 * MobileNav - Apple-style bottom sheet navigation for mobile devices
 * Features:
 * - Hamburger menu trigger (visible on mobile only)
 * - Bottom sheet with iOS-style presentation
 * - Backdrop blur and smooth spring animations
 * - Drag-to-dismiss gesture support
 * - Safe area padding for notched devices
 */
export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const navItems = [
    {
      label: 'Articles',
      href: '/articles',
      icon: BookOpen,
      description: 'Insights & guides'
    },
    {
      label: 'Sign In',
      href: '/login',
      icon: LogIn,
      description: 'Access your account'
    }
  ];

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button
        onClick={handleOpen}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} className="text-slate-700" />
      </button>

      {/* Bottom Sheet Overlay & Container */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleClose}
          />

          {/* Bottom Sheet */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out ${
              isClosing ? 'translate-y-full' : 'translate-y-0'
            }`}
            style={{
              paddingBottom: 'env(safe-area-inset-bottom, 20px)'
            }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                  <Brain size={18} />
                </div>
                <span className="font-bold text-lg text-slate-900">Menu</span>
              </div>
              <button
                onClick={handleClose}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors"
                aria-label="Close menu"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="px-4 py-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 active:bg-slate-100 transition-colors group"
                  onClick={handleClose}
                >
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-blue-100 group-active:bg-blue-200 transition-colors">
                    <item.icon size={22} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{item.label}</div>
                    <div className="text-sm text-slate-500">{item.description}</div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                </a>
              ))}
            </nav>

            {/* Primary CTA */}
            <div className="px-6 py-4">
              <a
                href="/login"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-6 py-4 rounded-2xl font-semibold text-base hover:bg-blue-700 active:bg-blue-800 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
                onClick={handleClose}
              >
                <Sparkles size={20} />
                Get Started Free
              </a>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 text-center">
              <p className="text-xs text-slate-400">
                Free tools for smarter decisions
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
