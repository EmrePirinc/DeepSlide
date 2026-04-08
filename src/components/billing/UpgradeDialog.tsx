'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PLANS, getRegionalPrice } from '@/lib/billing/plans';

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  reason: string;
}

export function UpgradeDialog({ open, onClose, reason }: UpgradeDialogProps) {
  const pro = PLANS.pro;
  const price = getRegionalPrice('TR');

  const handleUpgrade = async () => {
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'monthly' }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // Stripe checkout hatası
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Premium&apos;a Geçin</DialogTitle>
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
          <Button className="flex-1" onClick={handleUpgrade}>
            Premium&apos;a Geç
          </Button>
          <Button variant="outline" onClick={onClose}>
            Şimdi Değil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
