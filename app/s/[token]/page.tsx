import { createServiceClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
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
  const scenario = await getScenario(token);

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

  redirect(`/apps/${scenario.tool_id}?scenario=${token}`);
}
