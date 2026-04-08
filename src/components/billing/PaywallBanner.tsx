'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getRegionalPrice } from '@/lib/billing/plans';

interface PaywallBannerProps {
  onUpgrade: () => void;
}

export function PaywallBanner({ onUpgrade }: PaywallBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const price = getRegionalPrice('TR');

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="mx-auto max-w-2xl px-4 pb-4">
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-background/95 backdrop-blur px-4 py-3 shadow-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              Ses kontrolüyle devam edin
            </p>
            <p className="text-xs text-muted-foreground">
              Pro ile tüm slaytlarda sesle kontrol — {price.symbol}{price.monthly}/ay
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" onClick={onUpgrade}>
              Pro&apos;ya Geç
            </Button>
            <button
              className="text-muted-foreground hover:text-foreground p-1"
              onClick={() => setDismissed(true)}
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
