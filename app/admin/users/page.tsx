'use client';

import { useCallback, useEffect, useState } from 'react';
import { MailWarning, ShieldAlert, Users as UsersIcon } from 'lucide-react';
import { useAdminApi, readError } from '@/components/admin/useAdminApi';
import { getTierDisplayName, type Tier } from '@/lib/access-control';
import {
  AdminPage,
  Avatar,
  Button,
  Callout,
  ConfirmSheet,
  DataTable,
  DetailRow,
  EmptyState,
  FilterChips,
  ListGroup,
  ListRow,
  Pager,
  Pill,
  SearchField,
  SegmentedControl,
  Sheet,
  SkeletonList,
  StatTile,
  useToast,
} from '@/components/admin/ui';

interface User {
  id: string;
  email: string;
  tier: 'free' | 'finance_pro';
  first_name?: string | null;
  last_name?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  created_at: string;
  /** NULL until the account confirms its email address. */
  email_verified_at?: string | null;
  /** Canonical address — alias variants of one inbox share this value. */
  email_normalized?: string | null;
  /** Reason codes recorded at signup by lib/email-hygiene.ts. */
  signup_flags?: string[] | null;
  is_flagged?: boolean | null;
}

interface AbuseSummary {
  total_users: number;
  verified_users: number;
  unverified_users: number;
  flagged_users: number;
  stale_unverified_users: number;
  distinct_inboxes: number;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: AbuseSummary | null;
}

/** Human-readable labels for the reason codes in `signup_flags`. */
const FLAG_LABELS: Record<string, string> = {
  alias_address: 'Alias address',
  machine_generated_name: 'Random-looking name',
  disposable_domain: 'Disposable domain',
  lookalike_domain: 'Lookalike domain',
  invalid_email: 'Invalid email',
};

const fullName = (u: User) => [u.first_name, u.last_name].filter(Boolean).join(' ');
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmt = (n: number) => n.toLocaleString('en-US');

function StatusPills({ user }: { user: User }) {
  return (
    <span className="flex items-center gap-1.5">
      {user.tier === 'finance_pro' && <Pill tone="green">Pro</Pill>}
      {!user.email_verified_at && <Pill tone="gray">Unverified</Pill>}
      {user.is_flagged && (
        <Pill tone="amber" icon={ShieldAlert}>
          Flagged
        </Pill>
      )}
    </span>
  );
}

export default function AdminUsers() {
  const api = useAdminApi();
  const toast = useToast();
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<User | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTier, setEditTier] = useState<Tier>('free');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (tierFilter) params.set('tier', tierFilter);
    if (statusFilter) params.set('status', statusFilter);
    try {
      const res = await api(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error(await readError(res, 'Failed to fetch users'));
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [api, page, search, tierFilter, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(), search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchUsers, search]);

  const openUser = (user: User) => {
    setSelected(user);
    setEditTier(user.tier);
    setSheetOpen(true);
  };

  const handleUpdateTier = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await api(`/api/admin/users/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ tier: editTier }),
      });
      if (!res.ok) throw new Error(await readError(res, 'Failed to update user'));
      setSheetOpen(false);
      toast(`Plan changed to ${getTierDisplayName(editTier)}`);
      void fetchUsers();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to update user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      const res = await api(`/api/admin/users/${selected.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await readError(res, 'Failed to delete user'));
      setConfirmDelete(false);
      setSheetOpen(false);
      toast('User deleted');
      void fetchUsers();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to delete user', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const summary = data?.summary;
  const aliasCount = summary ? summary.total_users - summary.distinct_inboxes : 0;
  const filtersActive = Boolean(search || tierFilter || statusFilter);

  return (
    <AdminPage title="Users" subtitle={data ? `${fmt(data.total)} total` : undefined} onRefresh={fetchUsers}>
      <div className="space-y-5">
        {/*
          Signup-abuse summary. "Verified" is the only count that reflects real
          people — a profile row is written the moment an account is created,
          before the confirmation link is ever clicked, which is why bot signups
          showed up here as ordinary FREE users.
        */}
        {summary && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile compact label="Verified" value={fmt(summary.verified_users)} tone="green" />
            <StatTile compact label="Unverified" value={fmt(summary.unverified_users)} />
            <StatTile compact label="Unverified > 7d" value={fmt(summary.stale_unverified_users)} />
            <StatTile compact label="Flagged" value={fmt(summary.flagged_users)} tone="amber" />
          </div>
        )}

        {aliasCount > 0 && (
          <Callout icon={MailWarning}>
            <strong className="text-[var(--ad-label)]">{fmt(aliasCount)}</strong> account{aliasCount === 1 ? '' : 's'} share an inbox
            with another account (Gmail dot/plus aliases). Inspect with <code>select * from user_alias_clusters</code>.
          </Callout>
        )}

        <div className="space-y-3 lg:flex lg:items-center lg:gap-4 lg:space-y-0">
          <SearchField
            className="lg:w-80 lg:shrink-0"
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search email or name"
          />
          <FilterChips
            groups={[
              {
                label: 'Account status',
                value: statusFilter,
                onChange: (v) => {
                  setStatusFilter(v);
                  setPage(1);
                },
                options: [
                  { value: '', label: 'All' },
                  { value: 'verified', label: 'Verified' },
                  { value: 'unverified', label: 'Unverified' },
                  { value: 'flagged', label: 'Flagged' },
                ],
              },
              {
                label: 'Plan',
                value: tierFilter,
                onChange: (v) => {
                  setTierFilter(v);
                  setPage(1);
                },
                options: [
                  { value: '', label: 'Any plan' },
                  { value: 'free', label: 'Free' },
                  { value: 'finance_pro', label: 'Pro' },
                ],
              },
            ]}
          />
        </div>

        {error && <Callout tone="error">{error}</Callout>}

        {loading ? (
          <SkeletonList rows={8} />
        ) : !data?.users.length ? (
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            message={filtersActive ? 'Try a different search or clear the filters.' : undefined}
          />
        ) : (
          <DataTable
            rows={data.users}
            rowKey={(u) => u.id}
            onRowClick={openUser}
            mobileRow={(u) => (
              <ListRow
                onClick={() => openUser(u)}
                leading={<Avatar name={fullName(u) || u.email} tone={u.tier === 'finance_pro' ? 'green' : 'navy'} />}
                title={fullName(u) || u.email}
                subtitle={fullName(u) ? u.email : `Joined ${fmtDate(u.created_at)}`}
                trailing={<StatusPills user={u} />}
              />
            )}
            columns={[
              {
                key: 'user',
                header: 'User',
                cell: (u) => (
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar name={fullName(u) || u.email} size={32} tone={u.tier === 'finance_pro' ? 'green' : 'navy'} />
                    <span className="min-w-0">
                      <span className="block max-w-[280px] truncate font-semibold text-[var(--ad-label)]">{fullName(u) || u.email}</span>
                      {fullName(u) && <span className="block max-w-[280px] truncate text-[13px] text-[var(--ad-label-3)]">{u.email}</span>}
                    </span>
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                cell: (u) => (
                  <span className="flex flex-wrap items-center gap-1.5">
                    {u.email_verified_at ? <Pill tone="green">Verified</Pill> : <Pill tone="gray">Unverified</Pill>}
                    {u.is_flagged && (
                      <Pill tone="amber" icon={ShieldAlert}>
                        Flagged
                      </Pill>
                    )}
                  </span>
                ),
              },
              {
                key: 'tier',
                header: 'Plan',
                cell: (u) => <Pill tone={u.tier === 'finance_pro' ? 'green' : 'gray'}>{getTierDisplayName(u.tier)}</Pill>,
              },
              {
                key: 'sub',
                header: 'Subscription',
                cell: (u) => u.subscription_status || (u.stripe_subscription_id ? 'active' : '—'),
              },
              { key: 'joined', header: 'Joined', align: 'right', cell: (u) => fmtDate(u.created_at) },
            ]}
          />
        )}

        {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
      </div>

      {/* User detail */}
      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="User"
        footer={
          selected && editTier !== selected.tier ? (
            <Button variant="primary" size="lg" block loading={saving} onClick={handleUpdateTier}>
              Change plan to {getTierDisplayName(editTier)}
            </Button>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-6">
            <div className="flex flex-col items-center pt-1 text-center">
              <Avatar name={fullName(selected) || selected.email} size={64} tone={selected.tier === 'finance_pro' ? 'green' : 'navy'} />
              <p className="mt-3 text-[20px] font-bold">{fullName(selected) || 'No name'}</p>
              <p className="max-w-full break-all text-[14px] text-[var(--ad-label-2)]">{selected.email}</p>
              <div className="mt-3">
                <StatusPills user={selected} />
              </div>
            </div>

            <ListGroup header="Plan" footer="Changes the plan in the database only. Stripe billing is not touched.">
              <div className="p-3">
                <SegmentedControl<Tier>
                  label="Plan"
                  value={editTier}
                  onChange={setEditTier}
                  options={[
                    { value: 'free', label: getTierDisplayName('free') },
                    { value: 'finance_pro', label: getTierDisplayName('finance_pro') },
                  ]}
                />
              </div>
            </ListGroup>

            <ListGroup header="Account">
              <DetailRow label="Email" value={selected.email_verified_at ? `Verified ${fmtDate(selected.email_verified_at)}` : 'Not verified'} />
              <DetailRow label="Joined" value={fmtDate(selected.created_at)} />
              <DetailRow
                label="Subscription"
                value={selected.subscription_status || (selected.stripe_subscription_id ? 'active' : 'None')}
              />
              {selected.stripe_customer_id && <DetailRow label="Stripe customer" value={selected.stripe_customer_id} mono />}
            </ListGroup>

            {selected.is_flagged && (
              <ListGroup header="Signup flags" footer="Recorded at signup by the email hygiene checks.">
                {(selected.signup_flags?.length ? selected.signup_flags : ['flagged']).map((f) => (
                  <ListRow key={f} title={FLAG_LABELS[f] || f} leading={<ShieldAlert size={18} className="text-[var(--ad-amber)]" />} />
                ))}
              </ListGroup>
            )}

            <ListGroup>
              <ListRow title="Delete user" destructive centered onClick={() => setConfirmDelete(true)} />
            </ListGroup>
          </div>
        )}
      </Sheet>

      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDeleteUser}
        busy={deleting}
        title={`Delete ${selected?.email ?? 'this user'}?`}
        message="Removes their profile and sign-in. A Stripe subscription, if any, is not cancelled. This can't be undone."
        confirmLabel="Delete user"
      />
    </AdminPage>
  );
}
