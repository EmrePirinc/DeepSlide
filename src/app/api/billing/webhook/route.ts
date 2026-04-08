// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitWebhook } from '@/lib/utils/apiGuard';

// TODO: İyzico paneli açılınca webhook URL'sini ayarla:
//   Panel → Ayarlar → Bildirimler → Webhook URL:
//   https://DOMAIN.vercel.app/api/billing/webhook
//
// TODO: Subscription event'lerini test et:
//   - subscription.order.success → plan Pro olmalı
//   - subscription.order.failure → subscriptionStatus past_due olmalı
//   - subscription.cancelled → plan Free'ye düşmeli
//
// TODO: Firebase Admin key'leri .env.local'a ekle (callback/route.ts ile aynı)

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

// İyzico subscription webhook'ları
export async function POST(request: NextRequest) {
  const rateLimited = rateLimitWebhook(request);
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();

    const eventType = body.iyziEventType as string | undefined;
    const subscriptionRef = body.subscriptionReferenceCode as string | undefined;

    if (!eventType) {
      return NextResponse.json({ error: 'Missing iyziEventType' }, { status: 400 });
    }

    const admin = await getFirebaseAdmin();
    const firestore = admin.firestore();

    // iyzicoSubscriptionRef ile kullanıcıyı bul
    async function findUserBySubscriptionRef(ref: string): Promise<string | null> {
      const snapshot = await firestore
        .collection('profiles')
        .where('iyzicoSubscriptionRef', '==', ref)
        .limit(1)
        .get();
      if (snapshot.empty) return null;
      return snapshot.docs[0].id;
    }

    switch (eventType) {
      case 'subscription.order.success': {
        // Aylık yenileme başarılı
        if (!subscriptionRef) break;
        const userId = await findUserBySubscriptionRef(subscriptionRef);
        if (userId) {
          await firestore.collection('profiles').doc(userId).update({
            plan: 'pro',
            subscriptionStatus: 'active',
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }

      case 'subscription.order.failure': {
        // Aylık yenileme başarısız
        // TODO: Grace period email gönder (1., 3., 7. gün)
        // TODO: 7 gün sonra hâlâ başarısızsa plan Free'ye düşür
        if (!subscriptionRef) break;
        const userId = await findUserBySubscriptionRef(subscriptionRef);
        if (userId) {
          await firestore.collection('profiles').doc(userId).update({
            subscriptionStatus: 'past_due',
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }

      case 'subscription.cancelled': {
        // Abonelik iptal edildi
        if (!subscriptionRef) break;
        const userId = await findUserBySubscriptionRef(subscriptionRef);
        if (userId) {
          await firestore.collection('profiles').doc(userId).update({
            plan: 'free',
            subscriptionStatus: 'none',
            iyzicoSubscriptionRef: null,
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }

      default:
        console.log('Unhandled iyzico event:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
