'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getRegionalPrice } from '@/lib/billing/plans';

interface ExportGateProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function ExportGate({ open, onClose, onUpgrade }: ExportGateProps) {
  const price = getRegionalPrice('TR');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Export Pro Özelliğidir</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Sunumunuzu PDF veya PPT olarak indirmek için Pro plana geçin.
          Watermark olmadan, profesyonel kalitede export.
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={onUpgrade}>
            Pro&apos;ya Geç — {price.symbol}{price.monthly}/ay
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Şimdi Değil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
