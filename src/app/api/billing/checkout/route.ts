import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, email } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        url: null,
        message: 'Stripe yapılandırılmamış. .env.local dosyasına STRIPE_SECRET_KEY ekleyin.',
      });
    }

    const priceId = plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ url: null, message: 'Stripe price ID yapılandırılmamış.' });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const customer = await stripe.customers.create({
      email,
      metadata: { user_id: userId },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/billing?success=true`,
      cancel_url: `${request.nextUrl.origin}/billing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
