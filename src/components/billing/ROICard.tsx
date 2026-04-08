'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { getRegionalPrice } from '@/lib/billing/plans';

interface ROICardProps {
  imageCount: number;
  actualMinutes: number;
  onUpgrade: () => void;
  onDismiss: () => void;
  cumulativeHoursSaved?: number;
}

export function ROICard({
  imageCount,
  actualMinutes,
  onUpgrade,
  onDismiss,
  cumulativeHoursSaved,
}: ROICardProps) {
  const { isPremium, profile } = useAuth();
  const price = getRegionalPrice('TR');

  const traditionalMinutes = imageCount * 2;
  const savedMinutes = Math.max(0, traditionalMinutes - actualMinutes);
  const savedDisplay = savedMinutes >= 60
    ? `${Math.round(savedMinutes / 60 * 10) / 10} saat`
    : `${Math.round(savedMinutes)} dakika`;

  return (
    <Card className="max-w-md mx-auto p-6 space-y-4">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">Sunum Özeti</p>
        <p className="text-lg">
          Bu sunumu hazırlamak normalde <strong>~{traditionalMinutes} dakika</strong> sürerdi.
        </p>
        <p className="text-2xl font-bold text-primary">
          DeepSlide ile {actualMinutes} dakikada tamamladınız.
        </p>
        <p className="text-sm text-muted-foreground">
          {savedDisplay} kazandınız
        </p>
      </div>

      {cumulativeHoursSaved != null && cumulativeHoursSaved > 0 && (
        <div className="rounded-lg bg-primary/5 p-3 text-center">
          <p className="text-sm font-medium">
            3 sunumda toplam <strong>{Math.round(cumulativeHoursSaved * 10) / 10} saat</strong> kazandınız
          </p>
        </div>
      )}

      {!isPremium && (
        <div className="space-y-2">
          <Button className="w-full" onClick={onUpgrade}>
            Her sunumda bu hızda olun — Pro {price.symbol}{price.monthly}/ay
          </Button>
          <Button variant="ghost" className="w-full" onClick={onDismiss}>
            Şimdi Değil
          </Button>
        </div>
      )}

      {isPremium && (
        <Button variant="outline" className="w-full" onClick={onDismiss}>
          Tamam
        </Button>
      )}
    </Card>
  );
}
