'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Zap, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupComplete, setSignupComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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
        // Create user record in users table with free tier
        const { error: insertError } = await (supabase
          .from('users')
          .insert as any)([{
            id: data.user.id,
            email: data.user.email || '',
            tier: 'free',
          }]);

        if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
          console.error('Error creating user record:', insertError);
        }

        // Show confirmation screen
        setError(null);
        setLoading(false);
        setUserEmail(email);
        setSignupComplete(true);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setResendSuccess(false);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (error) throw error;

      setResendSuccess(true);
      setResendCooldown(60);

      // Start countdown
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Resend error:', err);
      setError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleStartOver = () => {
    setSignupComplete(false);
    setUserEmail('');
    setEmail('');
    setPassword('');
    setError(null);
    setResendSuccess(false);
    setResendCooldown(0);
  };

  // Confirmation screen after successful signup
  if (signupComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-lg w-full bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden p-10 lg:p-12 text-center">
          {/* Mail Icon */}
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-200">
            <Mail size={40} className="text-white" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
            Check Your Email
          </h1>

          {/* Email display */}
          <p className="text-slate-500 font-medium mb-6">
            We&apos;ve sent a verification link to
          </p>
          <p className="text-indigo-600 font-black text-lg mb-8 bg-indigo-50 py-3 px-6 rounded-2xl inline-block">
            {userEmail}
          </p>

          {/* Instructions */}
          <p className="text-slate-600 font-medium mb-8 leading-relaxed">
            Click the link in your email to verify your account.
            <br />
            <span className="text-slate-400 text-sm">The link will expire in 24 hours.</span>
          </p>

          {/* Success message */}
          {resendSuccess && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-1">
              <Check size={20} />
              <span className="font-bold">Verification email sent!</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          {/* Resend button */}
          <div className="mb-6">
            <p className="text-slate-400 text-sm font-medium mb-3">
              Didn&apos;t receive the email?
            </p>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || resendLoading}
              className="text-indigo-600 font-bold hover:text-indigo-500 disabled:text-slate-400 transition-colors inline-flex items-center gap-2"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend verification email'
              )}
            </button>
          </div>

          {/* Start over link */}
          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={handleStartOver}
              className="text-slate-500 font-medium hover:text-slate-700 transition-colors text-sm"
            >
              Wrong email? Start over
            </button>
          </div>

          {/* Security badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Bank-grade security</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-0 bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">

        {/* Left Side - Benefits */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-10 lg:p-12 text-white flex flex-col justify-center">
          <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 shadow-lg">
            <Zap fill="currentColor" size={28} />
          </div>

          <h1 className="text-4xl font-black mb-4 tracking-tight leading-tight">
            Start Building Your Financial Future
          </h1>
          <p className="text-indigo-100 font-medium mb-8 leading-relaxed">
            Join thousands using Cortex to make smarter money decisions with precision tools designed for long-term thinking.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 mt-0.5">
                <Check size={16} strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold mb-1">10 Financial Calculators</h3>
                <p className="text-indigo-100 text-sm">Access our complete suite of financial planning tools</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 mt-0.5">
                <Check size={16} strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Smart Optimization</h3>
                <p className="text-indigo-100 text-sm">AI-powered budget optimization and scenario modeling</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 mt-0.5">
                <Check size={16} strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Free to Start</h3>
                <p className="text-indigo-100 text-sm">No credit card required. Upgrade when you need more power.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/20">
            <p className="text-indigo-100 text-sm font-medium">
              "The best financial planning tools I've ever used. Clear, powerful, and actually useful."
            </p>
            <p className="text-white font-bold mt-2 text-sm">— Cortex User</p>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="p-10 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Create Your Account
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              Get instant access to all calculators
            </p>
          </div>

          {/* Signup Form */}
          <form className="space-y-5" onSubmit={handleSignup}>
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
              <p className="text-xs text-slate-400 ml-1 font-medium">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Create My Free Account
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center font-medium">
              By creating an account, you agree to our Terms of Service
            </p>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-600 font-medium">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Security Assurance */}
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Bank-grade security</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
