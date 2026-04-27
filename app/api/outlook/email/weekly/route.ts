import { NextRequest } from 'next/server';
import { runDigest } from '@/lib/outlook/runDigest';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  return runDigest(request, 'weekly');
}

export async function POST(request: NextRequest) {
  return runDigest(request, 'weekly');
}
