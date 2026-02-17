'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, Trash2, Edit3, X, Check } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { getTierDisplayName } from '@/lib/access-control';

interface User {
  id: string;
  email: string;
  tier: 'free' | 'finance_pro' | 'elite';
  first_name?: string | null;
  last_name?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  created_at: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminUsers() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editTier, setEditTier] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const token = await getToken();
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (tierFilter) params.set('tier', tierFilter);

    try {
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      setData(await res.json());
    } catch {
      // Error handled by empty state
    } finally {
      setLoading(false);
    }
  }, [page, search, tierFilter, getToken]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(), search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const handleUpdateTier = async (userId: string) => {
    setActionLoading(userId);
    const token = await getToken();

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier: editTier }),
      });

      if (!res.ok) throw new Error('Failed to update user');
      setEditingUser(null);
      fetchUsers();
    } catch {
      // Error silently caught, could add toast
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

    setActionLoading(userId);
    const token = await getToken();

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      fetchUsers();
    } catch {
      // Error silently caught
    } finally {
      setActionLoading(null);
    }
  };

  const tierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      free: 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)]',
      finance_pro: 'bg-indigo-100 text-indigo-700',
      elite: 'bg-purple-100 text-purple-700',
    };
    return (
      <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${colors[tier] || colors.free}`}>
        {getTierDisplayName(tier as any)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Users</h1>
        <p className="text-sm text-[var(--text-tertiary)] font-medium mt-1">
          {data?.total || 0} total users
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-[var(--text-tertiary)]" size={16} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--surface-primary)] text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--surface-primary)] text-sm font-medium text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        >
          <option value="">All tiers</option>
          <option value="free">Free</option>
          <option value="finance_pro">Finance Pro</option>
          <option value="elite">Elite</option>
        </select>
      </div>

      {/* Users Table */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-[var(--color-accent)]" size={24} />
          </div>
        ) : !data?.users.length ? (
          <div className="text-center py-16 text-[var(--text-tertiary)] text-sm font-medium">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-secondary)] bg-[var(--surface-secondary)]">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Email</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Name</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Tier</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Subscription</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Joined</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user) => (
                  <tr key={user.id} className="border-b border-[var(--border-secondary)] last:border-0 hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      <span className="truncate max-w-[200px] block">{user.email}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editTier}
                            onChange={(e) => setEditTier(e.target.value)}
                            className="text-xs border border-[var(--border-primary)] rounded-md px-2 py-1 outline-none"
                          >
                            <option value="free">Free</option>
                            <option value="finance_pro">Finance Pro</option>
                            <option value="elite">Elite</option>
                          </select>
                          <button
                            onClick={() => handleUpdateTier(user.id)}
                            disabled={actionLoading === user.id}
                            className="text-[var(--color-positive)] hover:opacity-70"
                          >
                            {actionLoading === user.id ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                          </button>
                          <button onClick={() => setEditingUser(null)} className="text-[var(--text-tertiary)] hover:opacity-70">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        tierBadge(user.tier)
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] text-xs">
                      {user.subscription_status || (user.stripe_subscription_id ? 'active' : '—')}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-tertiary)] text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingUser(user.id); setEditTier(user.tier); }}
                          className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                          title="Edit tier"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:bg-red-50 hover:text-[var(--color-negative)] transition-colors"
                          title="Delete user"
                        >
                          {actionLoading === user.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border-secondary)] px-4 py-3 bg-[var(--surface-secondary)]">
            <span className="text-xs text-[var(--text-tertiary)] font-medium">
              Page {data.page} of {data.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-md border border-[var(--border-primary)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--surface-primary)] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="p-1.5 rounded-md border border-[var(--border-primary)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--surface-primary)] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
