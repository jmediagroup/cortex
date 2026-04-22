'use client';

import React from 'react';
import { Brain, ChevronLeft, Shield, FileText, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors font-bold"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Brain size={18} />
            </div>
            <span className="font-black text-xl tracking-tight">Cortex</span>
          </a>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100 dark:border-indigo-900">
            <Shield size={14} />
            Legal
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-4">Terms of Service & Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Last Updated: January 16, 2026
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 md:p-12">

          {/* Introduction */}
          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              This document governs the use of all websites, digital products, and services within the <strong>J Media Group LLC</strong> ecosystem (the "Ecosystem"). By accessing any site within this Ecosystem, you agree to these terms. These services are built and maintained by <strong>J Media Group LLC</strong>, a multimedia production company.
            </p>

            {/* Section 1: Terms of Service */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 p-2 rounded-xl">
                  <FileText size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 m-0">1. Terms of Service</h2>
              </div>

              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-8 mb-4">A. Acceptance of Terms</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                By using our websites, you certify that you are at least 18 years of age. If you are using the Services on behalf of a business, that business accepts these terms.
              </p>

              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-8 mb-4">B. Intellectual Property</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Unless otherwise stated, all content (text, graphics, logos, music, and code) is the intellectual property of <strong>J Media Group LLC</strong> or its content creators.
              </p>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 my-4 border border-slate-100 dark:border-slate-800">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed m-0">
                  <strong className="text-slate-800 dark:text-slate-200">Limited License:</strong> You are granted a non-exclusive, non-transferable license to view the content for personal use. You may not reproduce, redistribute, or "scrape" content without express written consent.
                </p>
              </div>

              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-8 mb-4">C. User Conduct & Prohibited Acts</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">You agree not to:</p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  Use the Ecosystem for any unlawful purpose.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  Attempt to bypass security features or disrupt the hosting environment.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  Submit false or malicious information via contact forms or interactive tools.
                </li>
              </ul>

              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-8 mb-4">D. Disclaimers & Limitation of Liability</h3>
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-6 border border-amber-100 dark:border-amber-900">
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed m-0">
                    <strong className="text-amber-800 dark:text-amber-300">"As Is" Basis:</strong> All services and information are provided "as is." We make no warranties regarding accuracy, completeness, or uptime.
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-6 border border-amber-100 dark:border-amber-900">
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed m-0">
                    <strong className="text-amber-800 dark:text-amber-300">No Professional Advice:</strong> Information provided on our sites is for informational purposes only and does not constitute professional, legal, or financial advice.
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-6 border border-amber-100 dark:border-amber-900">
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed m-0">
                    <strong className="text-amber-800 dark:text-amber-300">Third-Party Links:</strong> Our sites may link to external websites. J Media Group LLC is not responsible for the content, privacy policies, or practices of these third parties.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Privacy Policy */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 p-2 rounded-xl">
                  <Shield size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 m-0">2. Privacy Policy</h2>
              </div>

              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-8 mb-4">A. Information We Collect</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                We collect information to provide better services to our users, including:
              </p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><strong className="text-slate-800 dark:text-slate-200">Personal Information:</strong> Name and email address when provided voluntarily via contact forms or newsletter sign-ups.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span><strong className="text-slate-800 dark:text-slate-200">Usage Data:</strong> IP addresses, browser types, and page interaction data collected via cookies and analytics tools.</span>
                </li>
              </ul>

              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-8 mb-4">B. How We Use Your Data</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  To maintain and improve our websites and user experience.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  To communicate with you regarding inquiries or subscriptions.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  To monitor the technical health of our web ecosystem.
                </li>
              </ul>

              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-8 mb-4">C. Sharing & Disclosure</h3>
              <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-6 border border-emerald-100 dark:border-emerald-900">
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed m-0">
                  <strong className="text-emerald-800 dark:text-emerald-300">We do not sell your personal data.</strong> We share information only with essential service providers (such as hosting platforms and email service providers) or if required by law to comply with a judicial proceeding.
                </p>
              </div>

              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-8 mb-4">D. Cookies & Tracking</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                We use cookies to enhance user experience. You can instruct your browser to refuse all cookies, though some portions of our sites may not function correctly as a result.
              </p>
            </section>

            {/* Section 3: Specialized Disclaimers */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 p-2 rounded-xl">
                  <FileText size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 m-0">3. Specialized Disclaimers</h2>
              </div>

              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-8 mb-4">A. Affiliate & Compensation Disclosure</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Certain websites within the J Media Group LLC Ecosystem may participate in affiliate marketing programs. We may earn a commission on purchases made through our links at no additional cost to you.
              </p>

              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-8 mb-4">B. Directory & Local Listings</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                For sites providing directory services, J Media Group LLC does not guarantee the quality, safety, or legality of the businesses listed. Users engage with third-party vendors at their own risk.
              </p>
            </section>

            {/* Section 4: Contact Information */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 p-2 rounded-xl">
                  <Mail size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 m-0">4. Contact Information</h2>
              </div>

              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                For questions regarding these policies, please contact:
              </p>

              <div className="bg-slate-900 dark:border dark:border-slate-800 rounded-2xl p-8 text-white">
                <p className="font-black text-lg mb-2">J Media Group LLC</p>
                <a
                  href="mailto:support@jmediagroup.net"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  support@jmediagroup.net
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 text-center text-slate-400 font-medium text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-indigo-600 p-1 rounded text-white">
              <Brain size={14} />
            </div>
            <span className="font-black text-slate-300">Cortex</span>
          </div>
          <p className="text-slate-500 mb-4">
            &copy; {new Date().getFullYear()} Cortex Technologies. Tools for Long-Term Thinking.
          </p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <a href="/articles" className="text-slate-500 hover:text-slate-300 transition-colors">
              Articles
            </a>
            <span className="text-slate-600">|</span>
            <a href="/terms" className="text-slate-500 hover:text-slate-300 transition-colors">
              Terms & Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
