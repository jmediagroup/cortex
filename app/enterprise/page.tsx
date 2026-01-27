'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  User,
  Phone,
  MessageSquare,
  Users,
  ArrowRight,
  Loader2,
  Check,
  ShieldCheck,
  Sparkles,
  Globe,
  Zap,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import { COMPANY_SIZES } from '@/lib/validation';

export default function EnterprisePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    trackEvent('enterprise_page_view');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enterprise-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          companyName,
          companySize,
          phone: phone || null,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      // Track successful submission
      await trackEvent('enterprise_form_submitted', {
        company_size: companySize,
      }, true);

      setSubmitted(true);
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-lg w-full bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden p-10 lg:p-12 text-center">
          {/* Success Icon */}
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-200">
            <Check size={40} className="text-white" strokeWidth={3} />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
            Thank You!
          </h1>

          {/* Message */}
          <p className="text-slate-600 font-medium mb-8 leading-relaxed">
            We&apos;ve received your request and a member of our team will be in touch within 1-2 business days to discuss your enterprise needs.
          </p>

          {/* What to expect */}
          <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8">
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
              What happens next
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-indigo-100 rounded-lg p-1 mt-0.5">
                  <Check size={14} className="text-indigo-600" strokeWidth={3} />
                </div>
                <span className="text-sm text-slate-700 font-medium">
                  Our team will review your requirements
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-indigo-100 rounded-lg p-1 mt-0.5">
                  <Check size={14} className="text-indigo-600" strokeWidth={3} />
                </div>
                <span className="text-sm text-slate-700 font-medium">
                  We&apos;ll reach out to schedule a discovery call
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-indigo-100 rounded-lg p-1 mt-0.5">
                  <Check size={14} className="text-indigo-600" strokeWidth={3} />
                </div>
                <span className="text-sm text-slate-700 font-medium">
                  You&apos;ll receive a custom proposal tailored to your needs
                </span>
              </li>
            </ul>
          </div>

          {/* Back to home */}
          <button
            onClick={() => router.push('/')}
            className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors inline-flex items-center gap-2"
          >
            Back to Home
            <ArrowRight size={16} />
          </button>

          {/* Security badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Your data is secure</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-0 bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">

        {/* Left Side - Value Proposition */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-10 lg:p-12 text-white flex flex-col justify-center">
          <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 shadow-lg">
            <Sparkles fill="currentColor" size={28} />
          </div>

          <h1 className="text-4xl font-black mb-4 tracking-tight leading-tight">
            Enterprise Solutions for Your Organization
          </h1>
          <p className="text-indigo-100 font-medium mb-8 leading-relaxed">
            Custom integrations, white-label solutions, and dedicated support for organizations that need precision financial tools at scale.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 mt-0.5">
                <Globe size={16} strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold mb-1">White-Label Solutions</h3>
                <p className="text-indigo-100 text-sm">Fully branded tools deployed on your domain</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 mt-0.5">
                <Zap size={16} strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Custom Integrations</h3>
                <p className="text-indigo-100 text-sm">API access and integrations with your existing systems</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 mt-0.5">
                <BarChart3 size={16} strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Advanced Analytics</h3>
                <p className="text-indigo-100 text-sm">Detailed usage analytics and reporting dashboards</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 mt-0.5">
                <Users size={16} strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-bold mb-1">Dedicated Support</h3>
                <p className="text-indigo-100 text-sm">Priority support with a dedicated account manager</p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/20">
            <p className="text-indigo-100 text-sm font-medium">
              Trusted by financial advisors, HR teams, and organizations that value clarity in decision-making.
            </p>
          </div>
        </div>

        {/* Right Side - Lead Capture Form */}
        <div className="p-10 lg:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Let&apos;s Talk
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              Tell us about your needs and we&apos;ll create a custom solution
            </p>
          </div>

          {/* Lead Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  First Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all text-slate-700 placeholder:text-slate-300"
                    placeholder="John"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Last Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all text-slate-700 placeholder:text-slate-300"
                    placeholder="Smith"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Work Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all text-slate-700 placeholder:text-slate-300"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Company Name
              </label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all text-slate-700 placeholder:text-slate-300"
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            {/* Company Size & Phone Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Company Size
                </label>
                <div className="relative group">
                  <Users className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} />
                  <select
                    required
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all text-slate-700 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select size</option>
                    {COMPANY_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size} employees
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Phone <span className="text-slate-300">(Optional)</span>
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all text-slate-700 placeholder:text-slate-300"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                How can we help?
              </label>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all text-slate-700 placeholder:text-slate-300 resize-none"
                  placeholder="Tell us about your use case, number of users, timeline, etc."
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
                  Submit Request
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-xs text-slate-400 text-center font-medium">
              We&apos;ll respond within 1-2 business days
            </p>
          </form>

          {/* Back Link */}
          <div className="text-center mt-6 pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-600 font-medium">
              Not ready for enterprise?{' '}
              <button
                onClick={() => router.push('/pricing')}
                className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors"
              >
                View our plans
              </button>
            </p>
          </div>

          {/* Security Assurance */}
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Your information is secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
