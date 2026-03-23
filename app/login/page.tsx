'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Zap, Mail, Lock, ArrowRight, Loader2, ShieldCheck, ArrowLeft, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const redirect = searchParams.get('redirect') || '/dashboard';
        router.push(redirect);
      }
    };
    checkSession();
  }, [router, searchParams, supabase]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Sign in existing user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        if (data.session) {
          // Track login event
          await trackEvent('user_login', {}, true);

          // Redirect to original destination or dashboard
          const redirect = searchParams.get('redirect') || '/dashboard';
          router.push(redirect);
        }
      } else {
        // Sign up new user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.user) {
          // Create user record in users table via API route (uses service role to bypass RLS)
          try {
            await fetch('/api/create-user-record', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: data.user.id,
                email: data.user.email || '',
              }),
            });
          } catch (insertErr) {
            // Log but don't block signup - the trigger may have already created the record
            console.error('Error creating user record:', insertErr);
          }

          // Track signup event
          await trackEvent('user_signup', { tier: 'free' }, true);

          // Show success message
          setError(null);
          setLoading(false);
          alert('Account created! Please check your email to confirm your account.');
          setIsLogin(true);
          setPassword('');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);

      // Track error
      await trackEvent('error_occurred', {
        error_message: err.message,
        error_code: err.code || 'unknown',
        context: isLogin ? 'login' : 'signup',
      }, true);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      await trackEvent('password_reset_requested', {}, true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetEmailSent(false);
    setError(null);
    setPassword('');
  };

  // Password reset email sent confirmation
  if (resetEmailSent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200 text-center">
          {/* Mail Icon */}
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-200">
            <Mail size={40} className="text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
            Check Your Email
          </h2>

          {/* Email display */}
          <p className="text-slate-500 font-medium mb-6">
            We&apos;ve sent a password reset link to
          </p>
          <p className="text-indigo-600 font-black text-lg mb-8 bg-indigo-50 py-3 px-6 rounded-2xl inline-block">
            {email}
          </p>

          {/* Instructions */}
          <p className="text-slate-600 font-medium mb-8 leading-relaxed">
            Click the link in your email to reset your password.
            <br />
            <span className="text-slate-400 text-sm">The link will expire in 24 hours.</span>
          </p>

          {/* Back to login */}
          <button
            onClick={handleBackToLogin}
            className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </button>

          {/* Security badge */}
          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Bank-grade security</span>
          </div>
        </div>
      </div>
    );
  }

  // Forgot password form
  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200">
              <Lock size={28} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Reset Password
            </h2>
            <p className="text-slate-500 mt-2 font-medium text-sm">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Send Reset Link
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="text-center pt-2">
            <button
              onClick={handleBackToLogin}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors px-6 py-3 rounded-2xl hover:bg-indigo-50 active:scale-95 inline-flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </button>
          </div>

          {/* Security badge */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Bank-grade security</span>
          </div>
        </div>
      </div>
    );
  }

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
                  minLength={6}
                />
              </div>
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
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

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
