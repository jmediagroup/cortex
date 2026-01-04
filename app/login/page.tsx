'use client';

import React, { useState } from 'react';
import { Zap, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

/**
 * AUTHENTICATION PAGE
 * Handles both Sign In and Account Creation for the Cortex platform.
 * Integrated with Supabase authentication.
 */
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // Sign in with Supabase
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.session) {
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        // Sign up with Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          // Auto-login after signup
          router.push('/dashboard');
          router.refresh();
        } else {
          // Email confirmation required
          setMessage('Check your email for the confirmation link!');
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200">

        {/* Branding Header */}
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200 transition-transform hover:scale-105">
            <Zap fill="currentColor" size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-slate-500 mt-2 font-medium text-sm">
            {isLogin
              ? 'Access your mathematical strategy engine'
              : 'Start optimizing your wealth with precision'}
          </p>
        </div>

        {/* Authentication Form */}
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-sm font-bold border border-emerald-100 animate-in fade-in slide-in-from-top-1">
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all text-slate-700 placeholder:text-slate-300"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all text-slate-700 placeholder:text-slate-300"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isLogin ? 'Sign In to Cortex' : 'Create My Account'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Form Toggle */}
        <div className="text-center pt-2">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors px-6 py-3 rounded-2xl hover:bg-indigo-50 active:scale-95"
          >
            {isLogin ? "New here? Create an account" : 'Already a member? Sign in'}
          </button>
        </div>

        {/* Security Assurance */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Bank-grade security</span>
        </div>
      </div>
    </div>
  );
}
