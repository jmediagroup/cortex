import { createServiceClient } from '@/lib/supabase/client';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import type { Metadata } from 'next';

interface SharedScenarioPageProps {
  params: Promise<{ token: string }>;
}

async function getScenario(token: string) {
  const supabase = createServiceClient() as any;

  const { data, error } = await supabase
    .from('scenarios')
    .select('tool_id, tool_name, inputs, key_result, share_token')
    .eq('share_token', token)
    .eq('is_public', true)
    .single();

  if (error || !data) return null;
  return data;
}

async function getSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op for read-only server component
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    // Format large numbers with commas
    return value.toLocaleString('en-US');
  }
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export async function generateMetadata({ params }: SharedScenarioPageProps): Promise<Metadata> {
  const { token } = await params;
  const scenario = await getScenario(token);

  if (!scenario) {
    return { title: 'Scenario Not Found — Cortex' };
  }

  const title = `${scenario.tool_name} Scenario — Cortex`;
  const description = scenario.key_result
    ? `${scenario.tool_name}: ${scenario.key_result}`
    : `Shared ${scenario.tool_name} scenario on Cortex`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'Cortex',
      url: `https://cortex.vip/s/${token}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function SharedScenarioPage({ params }: SharedScenarioPageProps) {
  const { token } = await params;
  const [scenario, session] = await Promise.all([
    getScenario(token),
    getSession(),
  ]);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Scenario Not Found</h1>
          <p className="text-slate-500 mb-6">This shared scenario doesn&apos;t exist or is no longer public.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
          >
            Go to Cortex
          </Link>
        </div>
      </div>
    );
  }

  const isLoggedIn = !!session;
  const inputs = scenario.inputs as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-black text-slate-900">
            Cortex
          </Link>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            Shared Scenario
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Tool name + key result */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            {scenario.tool_name}
          </p>
          {scenario.key_result && (
            <h1 className="text-2xl font-black text-slate-900 leading-tight">
              {scenario.key_result}
            </h1>
          )}
        </div>

        {/* Inputs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Inputs</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {Object.entries(inputs).map(([key, value]) => (
              <div key={key} className="px-6 py-3.5 flex items-start justify-between gap-4">
                <span className="text-sm text-slate-500 font-medium">{formatLabel(key)}</span>
                <span className="text-sm text-slate-900 font-semibold text-right">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky bottom banner */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 shadow-lg z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {isLoggedIn ? (
            <>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Try this scenario yourself</span>
              </p>
              <Link
                href={`/apps/${scenario.tool_id}`}
                className="flex-shrink-0 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Open in {scenario.tool_name}
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Save your own scenarios</span>
                {' '}&mdash; it&apos;s free
              </p>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Sign up free
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
