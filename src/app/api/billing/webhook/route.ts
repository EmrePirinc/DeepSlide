import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Firebase Admin SDK — server-side only
async function getFirebaseAdmin() {
  const admin = await import('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return admin;
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') ?? '';

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const updatePlan = async (customerId: string, plan: string) => {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return;
      const userId = customer.metadata?.user_id;
      if (userId) {
        const admin = await getFirebaseAdmin();
        await admin.firestore().collection('profiles').doc(userId).update({
          plan,
          updatedAt: new Date().toISOString(),
        });
      }
    };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (typeof session.customer === 'string') {
          await updatePlan(session.customer, 'pro');
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        if (typeof subscription.customer === 'string') {
          await updatePlan(subscription.customer, 'free');
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
