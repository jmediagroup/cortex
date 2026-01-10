'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  ChevronLeft,
  User,
  Save,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { getTierDisplayName, getTierColor, type Tier } from '@/lib/access-control';

export default function AccountPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<Tier>('free');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'prefer_not_to_say' | ''>('');

  // UI state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // Fetch user profile data
      const { data: userData } = await supabase
        .from('users')
        .select('tier, first_name, last_name, birth_date, gender')
        .eq('id', session.user.id)
        .single() as { data: { tier: Tier; first_name?: string; last_name?: string; birth_date?: string; gender?: 'male' | 'female' | 'prefer_not_to_say' } | null };

      if (userData) {
        setUserTier(userData.tier);
        setFirstName(userData.first_name || '');
        setLastName(userData.last_name || '');
        setBirthDate(userData.birth_date || '');
        setGender(userData.gender || '');
      }

      setLoading(false);
    };

    loadUserData();
  }, [router, supabase]);

  // Calculate age from birth date
  const calculateAge = (birthDateString: string): number | null => {
    if (!birthDateString) return null;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { error } = await (supabase
        .from('users')
        .update as any)({
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate || null,
          gender: gender || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update profile');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Handle tier changes
  const handleUpgradeToPro = () => {
    router.push('/pricing');
  };

  const handleDowngradeToFree = async () => {
    if (!confirm('Are you sure you want to downgrade to the Free tier? This will cancel your subscription and you will lose access to Pro features.')) {
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Call API to cancel Stripe subscription
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setUserTier('free');
      setSuccessMessage('Successfully downgraded to Free tier. Your subscription has been canceled.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to downgrade tier');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setErrorMessage('Please type DELETE to confirm');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    setSaving(true);

    try {
      // Delete user from database
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (dbError) throw dbError;

      // Sign out and redirect
      await supabase.auth.signOut();
      router.push('/');
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to delete account');
      setSaving(false);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* TOP NAVIGATION */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-bold"
          >
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <User className="text-indigo-600" size={20} />
            <span className="font-black text-xl tracking-tight">My Account</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Zap size={16} fill="currentColor" />
          </div>
          <span className="font-black text-lg tracking-tight">Cortex<span className="text-indigo-600">Hub</span></span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-3">
            <CheckCircle size={20} />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl flex items-center gap-3">
            <XCircle size={20} />
            <span className="font-bold">{errorMessage}</span>
          </div>
        )}

        {/* Profile Information Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-3 rounded-2xl">
              <User className="text-indigo-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Profile Information</h2>
              <p className="text-slate-500 font-medium">Update your personal details</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 font-medium">
                {user.email}
              </div>
              <p className="text-xs text-slate-400 mt-2">Email address cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {birthDate && calculateAge(birthDate) !== null && (
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Age: {calculateAge(birthDate)} years
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'prefer_not_to_say' | '')}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white font-black px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Subscription Management Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl ${userTier !== 'free' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
              {userTier !== 'free' ? (
                <TrendingUp className="text-indigo-600" size={24} />
              ) : (
                <TrendingDown className="text-slate-500" size={24} />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Subscription</h2>
              <p className="text-slate-500 font-medium">Manage your plan and billing</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wide mb-1">Current Plan</p>
                <p className="text-3xl font-black text-slate-900 uppercase">{getTierDisplayName(userTier)}</p>
              </div>
              <div className={`px-4 py-2 rounded-xl font-black text-sm bg-${getTierColor(userTier)}-600 text-white`}>
                {userTier === 'elite' ? '$29/month' : userTier === 'finance_pro' ? '$9/month' : '$0/month'}
              </div>
            </div>
          </div>

          {userTier === 'free' ? (
            <button
              onClick={handleUpgradeToPro}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-black px-6 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <TrendingUp size={20} />
              View Plans
            </button>
          ) : (
            <button
              onClick={handleDowngradeToFree}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-slate-200 text-slate-700 font-black px-6 py-4 rounded-xl hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrendingDown size={20} />
              {saving ? 'Processing...' : 'Cancel Subscription'}
            </button>
          )}
        </div>

        {/* Danger Zone - Delete Account */}
        <div className="bg-white rounded-3xl border-2 border-rose-200 shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-rose-100 p-3 rounded-2xl">
              <AlertTriangle className="text-rose-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-rose-900">Danger Zone</h2>
              <p className="text-rose-600 font-medium">Permanently delete your account</p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-rose-600 text-white font-black px-6 py-3 rounded-xl hover:bg-rose-700 transition-colors"
            >
              <Trash2 size={18} />
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
                <p className="font-bold text-rose-900 mb-3">
                  This action cannot be undone. This will permanently delete your account and remove all data.
                </p>
                <p className="text-sm text-rose-700 mb-4">
                  Please type <span className="font-black">DELETE</span> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full border-2 border-rose-300 rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 font-black px-6 py-3 rounded-xl hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving || deleteConfirmText !== 'DELETE'}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-600 text-white font-black px-6 py-3 rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={18} />
                  {saving ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-4xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-sm">
        &copy; {new Date().getFullYear()} Cortex Financial Technology. All rights reserved.
      </footer>
    </div>
  );
}
