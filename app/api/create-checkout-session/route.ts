import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, type Database } from '@/lib/supabase/client';
import { createCheckoutSession } from '@/lib/stripe/server';

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();

    // Get the authenticated user
    const supabase = createServiceClient();
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession(
      (userData as Database['public']['Tables']['users']['Row']).stripe_customer_id || '',
      priceId,
      user.id,
      user.email!
    );

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
