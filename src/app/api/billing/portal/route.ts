// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

// TODO: İyzico paneli açılınca test et:
//   1. Sandbox aboneliği oluştur, subscriptionReferenceCode'u al
//   2. /api/billing/portal POST { action: 'cancel' } ile iptal et
//   3. Firestore'da plan 'free' olduğunu doğrula
//   4. Webhook'un da subscription.cancelled tetiklendiğini kontrol et
//
// TODO: Firebase Admin key'leri .env.local'a ekle:
//   FIREBASE_CLIENT_EMAIL=...
//   FIREBASE_PRIVATE_KEY=...

import { NextRequest, NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';
import { iyzicoRequest } from '@/lib/billing/iyzico';

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

// GET — Mevcut abonelik durumunu döner (Firestore'dan)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId gerekli' }, { status: 400 });
    }

    const admin = await getFirebaseAdmin();
    const doc = await admin.firestore().collection('profiles').doc(userId).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const data = doc.data()!;
    return NextResponse.json({
      plan: data.plan ?? 'free',
      subscriptionStatus: data.subscriptionStatus ?? 'none',
      iyzicoSubscriptionRef: data.iyzicoSubscriptionRef ?? null,
      billingPeriod: data.billingPeriod ?? null,
      updatedAt: data.updatedAt ?? null,
    });
  } catch (error) {
    console.error('Portal GET error:', error);
    return NextResponse.json({ error: 'Abonelik bilgisi alınamadı' }, { status: 500 });
  }
}

// POST — Abonelik yönetimi (cancel / upgrade)
export async function POST(request: NextRequest) {
  try {
    const { userId, action, subscriptionReferenceCode, newPlanRef } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId ve action gerekli' }, { status: 400 });
    }

    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
      // TODO: İyzico key'leri eklenince bu mesaj kalkacak
      return NextResponse.json({
        error: 'İyzico yapılandırılmamış. IYZICO_API_KEY ve IYZICO_SECRET_KEY ekleyin.',
      }, { status: 503 });
    }

    const admin = await getFirebaseAdmin();
    const firestore = admin.firestore();

    if (action === 'cancel') {
      if (!subscriptionReferenceCode) {
        return NextResponse.json({ error: 'subscriptionReferenceCode gerekli' }, { status: 400 });
      }

      const result = await iyzicoRequest<Record<string, unknown>>((iyzico, cb) =>
        iyzico.subscription.cancel(
          {
            locale: Iyzipay.LOCALE.TR,
            conversationId: userId,
            subscriptionReferenceCode,
          },
          cb,
        ),
      );

      if (result.status !== 'success') {
        return NextResponse.json(
          { error: result.errorMessage ?? 'Abonelik iptal edilemedi' },
          { status: 400 },
        );
      }

      await firestore.collection('profiles').doc(userId).update({
        plan: 'free',
        subscriptionStatus: 'none',
        iyzicoSubscriptionRef: null,
        billingPeriod: null,
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true, message: 'Abonelik iptal edildi.' });
    }

    if (action === 'upgrade') {
      // TODO: İyzico plan değiştirme API'si mevcut değil — yeni checkout açılır
      // subscriptionUpgrade.update() destekleniyorsa buraya ekle
      if (!newPlanRef) {
        return NextResponse.json({ error: 'newPlanRef gerekli' }, { status: 400 });
      }

      return NextResponse.json({
        redirect: '/billing',
        message: 'Plan değiştirmek için yeni ödeme başlatın.',
      });
    }

    return NextResponse.json({ error: 'Geçersiz action' }, { status: 400 });
  } catch (error) {
    console.error('Portal POST error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
