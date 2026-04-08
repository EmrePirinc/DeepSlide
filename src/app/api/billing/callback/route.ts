// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';

// TODO: İyzico onayı gelince bu endpoint'i test et:
//   1. Sandbox panelden test kartıyla ödeme yap
//   2. Callback'in bu endpoint'e düşüp düşmediğini kontrol et
//   3. Firestore'da plan durumunun güncelleneceğini doğrula
//
// TODO: Firebase Admin key'leri .env.local'a ekle:
//   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@deepslide-74660.iam.gserviceaccount.com
//   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

function getIyzico(): Iyzipay {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY!,
    secretKey: process.env.IYZICO_SECRET_KEY!,
    uri: process.env.IYZICO_URI ?? 'https://sandbox-api.iyzipay.com',
  });
}

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
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const plan = url.searchParams.get('plan') ?? 'monthly';

    if (!userId) {
      return NextResponse.redirect(new URL('/billing?error=no_user', request.url));
    }

    const formData = await request.formData();
    const token = formData.get('token') as string;

    if (!token) {
      return NextResponse.redirect(new URL('/billing?error=no_token', request.url));
    }

    const iyzico = getIyzico();

    // İyzico'dan ödeme sonucunu doğrula
    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      iyzico.checkoutForm.retrieve(
        { locale: Iyzipay.LOCALE.TR, conversationId: userId, token },
        (err: unknown, res: Record<string, unknown>) => {
          if (err) return reject(err);
          resolve(res);
        },
      );
    });

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      // TODO: Firebase Admin key'leri eklenince bu blok çalışacak
      const admin = await getFirebaseAdmin();
      await admin.firestore().collection('profiles').doc(userId).update({
        plan: 'pro',
        subscriptionStatus: 'active',
        iyzicoPaymentId: result.paymentId,
        iyzicoSubscriptionRef: result.subscriptionReferenceCode ?? null,
        billingPeriod: plan,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.redirect(new URL('/billing?success=true', request.url));
    }

    console.error('İyzico payment failed:', result.errorMessage);
    return NextResponse.redirect(
      new URL(`/billing?error=${encodeURIComponent(String(result.errorMessage ?? 'payment_failed'))}`, request.url),
    );
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/billing?error=callback_failed', request.url));
  }
}
