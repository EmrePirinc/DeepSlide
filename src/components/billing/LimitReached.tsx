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

interface LimitReachedProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function LimitReached({ open, onClose, onUpgrade }: LimitReachedProps) {
  const price = getRegionalPrice('TR');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Aylık Sunum Hakkınız Doldu</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Bu ayki sunum hakkınız (2 sunum) doldu. Pro ile sınırsız sunum yapın.
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={onUpgrade}>
            Sınırsız Sunum — Pro {price.symbol}{price.monthly}/ay
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Gelecek Ay Bekle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
