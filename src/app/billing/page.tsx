'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
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
      <div className="max-w-4xl mx-auto space-y-10 py-12 px-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-white">Fiyatlandırma</h1>
          <p className="text-on-surface-variant text-lg">
            Siz konuşun, sunumunuz sizi takip etsin.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-full p-1 bg-white/5 border border-white/5">
            <button
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                billingPeriod === 'monthly'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Aylık
            </button>
            <button
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                billingPeriod === 'yearly'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Yıllık
              {savings > 0 && (
                <span className="ml-2 text-xs text-emerald-400 font-bold">
                  %{savings} tasarruf
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className={`glass-card rounded-2xl border p-8 space-y-6 transition-all ${
            !isPremium && profile.trialRemaining === 0 ? 'border-primary/30' : 'border-white/5'
          }`}>
            <div>
              <h2 className="text-xl font-bold text-white">{PLANS.free.name}</h2>
              <p className="text-sm text-on-surface-variant mt-1">Başlangıç için ideal</p>
              <div className="mt-4">
                <span className="text-4xl font-black text-white">{price.symbol}0</span>
                <span className="text-on-surface-variant ml-1">/ay</span>
              </div>
            </div>

            <ul className="space-y-3 text-sm">
              {FEATURES_FREE.map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <MaterialIcon
                    icon={f.included ? 'check_circle' : 'remove'}
                    size={18}
                    className={f.included ? 'text-primary mt-0.5' : 'text-on-surface-variant/40 mt-0.5'}
                  />
                  <span className={f.included ? 'text-white' : 'text-on-surface-variant/60 line-through'}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            {!isPremium ? (
              <Button variant="outline" className="w-full bg-white/5 border-white/10 text-on-surface-variant rounded-xl py-3" disabled>
                Mevcut Plan
              </Button>
            ) : (
              <div className="h-12" />
            )}
          </div>

          {/* Pro Plan */}
          <div className={`glass-card rounded-2xl border p-8 space-y-6 transition-all relative overflow-hidden ${
            isPremium ? 'border-primary/30 slide-thumb-active' : 'border-primary/20'
          }`}>
            {/* Popular badge */}
            <div className="absolute top-4 right-4">
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary border border-primary/30">
                Popüler
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">{PLANS.pro.name}</h2>
              <p className="text-sm text-on-surface-variant mt-1">Profesyoneller için</p>
              <div className="mt-4">
                <span className="text-4xl font-black text-white">
                  {price.symbol}{monthlyDisplay}
                </span>
                <span className="text-on-surface-variant ml-1">/ay</span>
                {billingPeriod === 'yearly' && (
                  <span className="text-sm text-on-surface-variant ml-3">
                    ({price.symbol}{price.yearly}/yıl)
                  </span>
                )}
              </div>
            </div>

            <ul className="space-y-3 text-sm">
              {FEATURES_PRO.map((f) => (
                <li key={f.text} className="flex items-start gap-3">
                  <MaterialIcon icon="check_circle" size={18} className="text-emerald-400 mt-0.5" />
                  <span className="text-white">{f.text}</span>
                </li>
              ))}
            </ul>

            {isPremium ? (
              <Button
                variant="outline"
                className="w-full bg-white/5 border-white/10 text-white rounded-xl py-3 hover:bg-white/10"
                onClick={() => window.location.href = '/profile'}
              >
                Aboneliği Yönet
              </Button>
            ) : (
              <Button
                className="w-full bg-primary hover:bg-primary-container text-white font-bold rounded-xl py-3 shadow-xl shadow-primary/20 active:scale-95 transition-all"
                onClick={() => handleCheckout(billingPeriod)}
              >
                Pro&apos;ya Geç — {price.symbol}{monthlyDisplay}/ay
              </Button>
            )}
          </div>
        </div>

        {/* Bottom text */}
        <div className="text-center text-sm text-on-surface-variant space-y-1">
          <p>PowerPoint ile sunum hazırlamak ortalama 4 saat alır.</p>
          <p className="font-bold text-white">DeepSlide ile 12 dakikada hazır.</p>
        </div>

        {/* iyzico Checkout Modal */}
        {checkoutHtml && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 p-1"
                onClick={() => setCheckoutHtml(null)}
              >
                <MaterialIcon icon="close" size={20} />
              </button>
              <div
                className="p-6"
                dangerouslySetInnerHTML={{ __html: checkoutHtml }}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
