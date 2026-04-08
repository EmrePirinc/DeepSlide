// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';
import { rateLimitBilling } from '@/lib/utils/apiGuard';

// TODO: İyzico paneli açılınca sandbox API key'leri .env.local'a ekle:
//   IYZICO_API_KEY=sandbox-...
//   IYZICO_SECRET_KEY=sandbox-...
//   IYZICO_URI=https://sandbox-api.iyzipay.com
//
// TODO: İyzico panelinde Subscription Product + Plan oluştur:
//   1. Panel → Abonelik → Ürün Oluştur ("DeepSlide Pro")
//   2. Aylık Plan: ₺99/ay → referans kodunu IYZICO_MONTHLY_PLAN_REF'e ekle
//   3. Yıllık Plan: ₺888/yıl → referans kodunu IYZICO_YEARLY_PLAN_REF'e ekle
//
// TODO: Prod'a geçerken:
//   - IYZICO_URI'yi https://api.iyzipay.com olarak değiştir
//   - Live API key'leri ekle

function getIyzico(): Iyzipay {
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY!,
    secretKey: process.env.IYZICO_SECRET_KEY!,
    uri: process.env.IYZICO_URI ?? 'https://sandbox-api.iyzipay.com',
  });
}

export async function POST(request: NextRequest) {
  const rateLimited = rateLimitBilling(request);
  if (rateLimited) return rateLimited;

  try {
    const { plan, userId, email, name } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
      // TODO: İyzico key'leri eklenince bu mesaj kalkacak
      return NextResponse.json({
        url: null,
        message: 'İyzico yapılandırılmamış. .env.local dosyasına IYZICO_API_KEY ve IYZICO_SECRET_KEY ekleyin.',
      });
    }

    const iyzico = getIyzico();
    const origin = request.nextUrl.origin;

    const price = plan === 'yearly' ? '888.00' : '99.00';
    const pricingPlanRef = plan === 'yearly'
      ? process.env.IYZICO_YEARLY_PLAN_REF
      : process.env.IYZICO_MONTHLY_PLAN_REF;

    // Abonelik checkout formu ile ödeme
    if (pricingPlanRef) {
      const subscriptionRequest = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: userId,
        pricingPlanReferenceCode: pricingPlanRef,
        subscriptionInitialStatus: 'ACTIVE',
        callbackUrl: `${origin}/api/billing/callback?userId=${encodeURIComponent(userId)}`,
        customer: {
          name: name || 'Kullanıcı',
          surname: '.',
          email: email,
          // TODO: Kullanıcıdan gerçek telefon numarası al (profil sayfasına ekle)
          gsmNumber: '+905000000000',
          // TODO: Kullanıcıdan gerçek TC kimlik no al (ödeme sırasında iste)
          identityNumber: '11111111111',
          shippingContactName: name || 'Kullanıcı',
          shippingCity: 'Istanbul',
          shippingCountry: 'Turkey',
          shippingAddress: 'Istanbul',
          billingContactName: name || 'Kullanıcı',
          billingCity: 'Istanbul',
          billingCountry: 'Turkey',
          billingAddress: 'Istanbul',
        },
      };

      const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
        iyzico.subscriptionCheckoutForm.initialize(subscriptionRequest, (err: unknown, res: Record<string, unknown>) => {
          if (err) return reject(err);
          resolve(res);
        });
      });

      if (result.status === 'success' && result.checkoutFormContent) {
        return NextResponse.json({
          formContent: result.checkoutFormContent,
          token: result.token,
        });
      }

      return NextResponse.json({ error: result.errorMessage || 'Ödeme formu oluşturulamadı' }, { status: 400 });
    }

    // Subscription plan ref yoksa tek seferlik ödeme (checkout form)
    // TODO: İdeal akış subscription API ile. Bu fallback sadece plan ref yoksa çalışır.
    const checkoutRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: userId,
      price,
      paidPrice: price,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: `DS_${plan}_${userId}`,
      paymentGroup: Iyzipay.PAYMENT_GROUP.SUBSCRIPTION,
      callbackUrl: `${origin}/api/billing/callback?userId=${encodeURIComponent(userId)}&plan=${plan}`,
      enabledInstallments: [1],
      buyer: {
        id: userId,
        name: name || 'Kullanıcı',
        surname: '.',
        email,
        gsmNumber: '+905000000000',
        identityNumber: '11111111111',
        registrationAddress: 'Istanbul',
        ip: request.headers.get('x-forwarded-for') ?? '127.0.0.1',
        city: 'Istanbul',
        country: 'Turkey',
      },
      shippingAddress: {
        contactName: name || 'Kullanıcı',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Istanbul',
      },
      billingAddress: {
        contactName: name || 'Kullanıcı',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Istanbul',
      },
      basketItems: [
        {
          id: `deepslide_pro_${plan}`,
          name: `DeepSlide Pro ${plan === 'yearly' ? 'Yıllık' : 'Aylık'}`,
          category1: 'SaaS',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price,
        },
      ],
    };

    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      iyzico.checkoutFormInitialize.create(checkoutRequest, (err: unknown, res: Record<string, unknown>) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    if (result.status === 'success') {
      return NextResponse.json({
        formContent: result.paymentPageUrl || result.checkoutFormContent,
        token: result.token,
      });
    }

    return NextResponse.json(
      { error: result.errorMessage || 'Ödeme başlatılamadı' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
