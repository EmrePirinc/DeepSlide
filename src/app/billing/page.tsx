'use client';

import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { PLANS } from '@/lib/billing/plans';

export default function BillingPage() {
  const { isPremium } = useAuth();

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    const { url, message } = await res.json();
    if (url) {
      window.location.href = url;
    } else if (message) {
      alert(message);
    }
  };

  const handlePortal = async () => {
    const res = await fetch('/api/billing/portal', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Fiyatlandırma</h1>
          <p className="text-muted-foreground mt-2">
            İhtiyacınıza uygun planı seçin
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className={`p-6 space-y-4 ${!isPremium ? 'ring-2 ring-primary' : ''}`}>
            <h2 className="text-xl font-bold">{PLANS.free.name}</h2>
            <div className="text-3xl font-bold">$0 <span className="text-sm font-normal text-muted-foreground">/ay</span></div>
            <ul className="space-y-2 text-sm">
              <li>3 sunum</li>
              <li>Sunum başına 100 görsel</li>
              <li>Sesle kontrol</li>
              <li>3 tema & 3 geçiş efekti</li>
              <li>Yerel depolama (IndexedDB)</li>
            </ul>
            {!isPremium && (
              <Button variant="outline" className="w-full" disabled>
                Mevcut Plan
              </Button>
            )}
          </Card>

          {/* Pro Plan */}
          <Card className={`p-6 space-y-4 ${isPremium ? 'ring-2 ring-primary' : 'border-primary'}`}>
            <h2 className="text-xl font-bold">{PLANS.pro.name}</h2>
            <div className="text-3xl font-bold">
              $15 <span className="text-sm font-normal text-muted-foreground">/ay</span>
              <span className="text-sm text-muted-foreground ml-2">veya $144/yıl</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li>Sınırsız sunum</li>
              <li>Sunum başına 500 görsel</li>
              <li>Bulut depolama & senkronizasyon</li>
              <li>Sunum analitik raporu</li>
              <li>Link & QR code paylaşım</li>
              <li>Tüm ücretsiz özellikler</li>
            </ul>
            {isPremium ? (
              <Button variant="outline" className="w-full" onClick={handlePortal}>
                Aboneliği Yönet
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleCheckout('monthly')}>
                  Aylık $15
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleCheckout('yearly')}>
                  Yıllık $144
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
