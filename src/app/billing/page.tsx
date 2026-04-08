'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { PLANS, getRegionalPrice } from '@/lib/billing/plans';

const FEATURES_FREE = [
  { text: '15 görsele kadar tam deneyim', included: true },
  { text: 'Ayda 2 sunum (16+ görsel)', included: true },
  { text: 'İlk 2 slayt ses kontrolü', included: true },
  { text: 'İlk 3 sunum full Pro deneme', included: true },
  { text: 'Sınırsız ses kontrolü', included: false },
  { text: 'PDF/PPT export', included: false },
  { text: 'Watermark yok', included: false },
];

const FEATURES_PRO = [
  { text: '500 görsele kadar', included: true },
  { text: 'Sınırsız sunum', included: true },
  { text: 'Tüm slaytlarda ses kontrolü', included: true },
  { text: 'PDF/PPT export', included: true },
  { text: 'Watermark yok', included: true },
  { text: 'Öncelikli destek', included: true },
  { text: 'Bulut depolama (yakında)', included: true },
];

export default function BillingPage() {
  const { user, isPremium, profile } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const price = getRegionalPrice('TR');
  const monthlyDisplay = billingPeriod === 'monthly'
    ? price.monthly
    : Math.round(price.yearly / 12);
  const savings = billingPeriod === 'yearly'
    ? Math.round((price.monthly * 12 - price.yearly) / (price.monthly * 12) * 100)
    : 0;

  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    if (!user) {
      window.location.href = '/auth/login?redirect=/billing';
      return;
    }
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan,
        userId: user.uid,
        email: user.email,
        name: user.displayName ?? '',
      }),
    });
    const data = await res.json();
    if (data.formContent) {
      if (typeof data.formContent === 'string' && data.formContent.startsWith('http')) {
        window.location.href = data.formContent;
      } else {
        setCheckoutHtml(data.formContent);
      }
    } else if (data.message) {
      alert(data.message);
    } else if (data.error) {
      alert(data.error);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Fiyatlandırma</h1>
          <p className="text-muted-foreground">
            Siz konuşun, sunumunuz sizi takip etsin.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border p-1 bg-muted/50">
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Aylık
            </button>
            <button
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Yıllık
              {savings > 0 && (
                <span className="ml-1.5 text-xs text-primary font-semibold">
                  %{savings} tasarruf
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className={`p-6 space-y-6 ${!isPremium && profile.trialRemaining === 0 ? 'ring-2 ring-primary' : ''}`}>
            <div>
              <h2 className="text-xl font-bold">{PLANS.free.name}</h2>
              <div className="mt-2">
                <span className="text-3xl font-bold">{price.symbol}0</span>
                <span className="text-muted-foreground ml-1">/ay</span>
              </div>
            </div>

            <ul className="space-y-3 text-sm">
              {FEATURES_FREE.map((f) => (
                <li key={f.text} className="flex items-start gap-2">
                  <span className={f.included ? 'text-primary' : 'text-muted-foreground'}>
                    {f.included ? '✓' : '—'}
                  </span>
                  <span className={!f.included ? 'text-muted-foreground' : ''}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            {!isPremium ? (
              <Button variant="outline" className="w-full" disabled>
                Mevcut Plan
              </Button>
            ) : (
              <div className="h-10" />
            )}
          </Card>

          {/* Pro Plan */}
          <Card className={`p-6 space-y-6 border-primary ${isPremium ? 'ring-2 ring-primary' : ''}`}>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{PLANS.pro.name}</h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Popüler
                </span>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold">
                  {price.symbol}{monthlyDisplay}
                </span>
                <span className="text-muted-foreground ml-1">/ay</span>
                {billingPeriod === 'yearly' && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({price.symbol}{price.yearly}/yıl)
                  </span>
                )}
              </div>
            </div>

            <ul className="space-y-3 text-sm">
              {FEATURES_PRO.map((f) => (
                <li key={f.text} className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>

            {isPremium ? (
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/profile'}>
                Aboneliği Yönet
              </Button>
            ) : (
              <Button className="w-full" onClick={() => handleCheckout(billingPeriod)}>
                Pro&apos;ya Geç — {price.symbol}{monthlyDisplay}/ay
              </Button>
            )}
          </Card>
        </div>

        {/* Karşılaştırma */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>PowerPoint ile sunum hazırlamak ortalama 4 saat alır.</p>
          <p className="font-medium text-foreground">DeepSlide ile 12 dakikada hazır.</p>
        </div>

        {/* İyzico Checkout Form Modal */}
        {checkoutHtml && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 z-10"
                onClick={() => setCheckoutHtml(null)}
              >
                ✕
              </button>
              <div
                className="p-4"
                dangerouslySetInnerHTML={{ __html: checkoutHtml }}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
