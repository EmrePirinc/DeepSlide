'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PLANS, getRegionalPrice } from '@/lib/billing/plans';
import { useAuth } from '@/hooks/useAuth';

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  reason: string;
}

export function UpgradeDialog({ open, onClose, reason }: UpgradeDialogProps) {
  const { user } = useAuth();
  const pro = PLANS.pro;
  const price = getRegionalPrice('TR');
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      window.location.href = '/auth/login?redirect=/billing';
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'monthly',
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
        // İyzico henüz yapılandırılmamış — billing sayfasına yönlendir
        window.location.href = '/billing';
      } else if (data.error) {
        console.error('Checkout error:', data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkoutHtml) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 z-10"
            onClick={() => { setCheckoutHtml(null); onClose(); }}
          >
            ✕
          </button>
          <div
            className="p-4"
            dangerouslySetInnerHTML={{ __html: checkoutHtml }}
          />
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pro&apos;ya Geçin</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{reason}</p>

        <div className="border rounded-lg p-4 space-y-3 mt-4">
          <h3 className="font-semibold">{pro.name} Plan</h3>
          <ul className="text-sm space-y-1">
            <li>Sınırsız sunum + ses kontrolü</li>
            <li>Sunum başına 500 görsel</li>
            <li>PDF/PPT export</li>
            <li>Watermark yok</li>
            <li>Bulut depolama (yakında)</li>
          </ul>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{price.symbol}{price.monthly}</span>
            <span className="text-muted-foreground">/ay</span>
            <span className="text-xs text-muted-foreground ml-2">
              veya {price.symbol}{price.yearly}/yıl (%25 indirim)
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button className="flex-1" onClick={handleUpgrade} disabled={loading}>
            {loading ? 'Yükleniyor...' : 'Pro\'ya Geç'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Şimdi Değil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
