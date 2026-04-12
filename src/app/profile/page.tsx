'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { getPlan, getRegionalPrice } from '@/lib/billing/plans';
import { doc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '@/lib/firebase/config';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isPremium, profile, signOut } = useAuth();
  const [name, setName] = useState(user?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const plan = getPlan(profile.plan);
  const price = getRegionalPrice('TR');

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, 'profiles', user.uid), { name }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Hata
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  // TODO: İyzico abonelik iptali API'si ekle
  // İyzico paneli açılınca: iyzico.subscription.cancel({ subscriptionReferenceCode })
  const handleCancelSubscription = () => {
    alert('Abonelik iptali icin destek ile iletisime gecin: support@deepslide.app');
  };

  const initials = (user?.displayName ?? user?.email ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hesap Ayarlari</h1>
          <p className="text-muted-foreground mt-1">Profil bilgilerinizi ve aboneliginizi yonetin</p>
        </div>

        {/* Profil Kartı */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? ''}
                  className="w-16 h-16 rounded-full ring-2 ring-background shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold ring-2 ring-background shadow-md">
                  {initials}
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold">{user?.displayName ?? 'Kullanici'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isPremium ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {isPremium ? 'Pro Plan' : profile.trialRemaining > 0 ? `Trial (${profile.trialRemaining}/3)` : 'Ucretsiz Plan'}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-4">Kisisel Bilgiler</h3>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Ad Soyad</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adinizi girin" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">E-posta</label>
                  <Input value={user?.email ?? ''} disabled className="bg-muted" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Degisiklikleri Kaydet'}
              </Button>
              {saved && <span className="text-sm text-green-600">Basariyla guncellendi</span>}
            </div>
          </div>
        </Card>

        {/* Plan & Kullanım */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold">Plan & Kullanim</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold">{isPremium ? 'Pro' : 'Free'}</p>
              <p className="text-xs text-muted-foreground mt-1">Mevcut plan</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold">
                {isPremium ? '∞' : `${plan.limits.monthlyPresentations - profile.monthlyPresentationsUsed}/${plan.limits.monthlyPresentations}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Kalan sunum</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold">
                {profile.trialRemaining > 0 ? `${profile.trialRemaining}/3` : '—'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Trial hakki</p>
            </div>
          </div>

          {isPremium && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Abonelik durumu</span>
                <span className="font-medium capitalize">{profile.subscriptionStatus}</span>
              </div>
              {profile.currentPeriodEnd && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sonraki odeme</span>
                  <span>{new Date(profile.currentPeriodEnd).toLocaleDateString('tr-TR')}</span>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 text-destructive hover:text-destructive"
                onClick={handleCancelSubscription}
              >
                Aboneligi Iptal Et
              </Button>
            </div>
          )}

          {!isPremium && (
            <Button className="w-full" onClick={() => router.push('/billing')}>
              Pro&apos;ya Yukselt — {price.symbol}{price.monthly}/ay
            </Button>
          )}
        </Card>

        {/* Hesap İşlemleri */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold mb-4">Hesap Islemleri</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
              Cikis Yap
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => alert('Hesap silme islemi icin destek ile iletisime gecin: support@deepslide.app')}
            >
              Hesabi Sil
            </Button>
          </div>
        </Card>

        {/* Yıllık Rapor */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Yıllık Konuşmacı Raporu</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Yılın sunum istatistiklerin, bir bakışta.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/profile/wrapped')}>
              🎉 Raporu Gör
            </Button>
          </div>
        </Card>

        {/* Footer links */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground pb-8">
          <a href="/privacy" className="hover:underline">Gizlilik Politikasi</a>
          <a href="/terms" className="hover:underline">Kullanim Kosullari</a>
        </div>
      </div>
    </AppShell>
  );
}
