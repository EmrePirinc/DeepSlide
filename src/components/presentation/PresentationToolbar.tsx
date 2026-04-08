'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CanvasControls } from '@/components/canvas/CanvasControls';
import { LimitReached } from '@/components/billing/LimitReached';
import { ExportGate } from '@/components/billing/ExportGate';
import { useAuth } from '@/hooks/useAuth';
import { canCreatePresentation, getPlan } from '@/lib/billing/plans';

interface PresentationToolbarProps {
  presentationId: string;
  columnCount: 3 | 4 | 5;
  onColumnCountChange: (count: 3 | 4 | 5) => void;
  onAutoArrange: () => void;
  onStartAnalysis: () => void;
  onRetryFailed: () => void;
  onReanalyze: () => void;
  onStopAnalysis: () => void;
  imageCount: number;
  pendingCount: number;
  failedCount: number;
  isAnalyzing: boolean;
  analysisCompleted: number;
  analysisTotal: number;
  completedCount: number;
}

export function PresentationToolbar({
  presentationId,
  columnCount,
  onColumnCountChange,
  onAutoArrange,
  onStartAnalysis,
  onRetryFailed,
  onReanalyze,
  onStopAnalysis,
  imageCount,
  pendingCount,
  failedCount,
  isAnalyzing,
  analysisCompleted,
  analysisTotal,
  completedCount,
}: PresentationToolbarProps) {
  const router = useRouter();
  const { profile, isPremium, decrementTrial, incrementMonthlyUsage } = useAuth();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showExportGate, setShowExportGate] = useState(false);

  const handleStartPresentation = () => {
    const allowed = canCreatePresentation(
      profile.plan,
      profile.monthlyPresentationsUsed,
      imageCount,
      profile.trialRemaining,
    );

    if (!allowed) {
      setShowLimitModal(true);
      return;
    }

    // Trial aktifse ve 16+ görsel → trial sayacını düşür
    const plan = getPlan(profile.plan);
    if (profile.trialRemaining > 0 && imageCount > plan.limits.maxImagesFullExperience) {
      decrementTrial();
    }
    // Free'de 16+ görsel ve trial bitmişse → aylık sayacı artır
    else if (!isPremium && profile.trialRemaining === 0 && imageCount > plan.limits.maxImagesFullExperience) {
      incrementMonthlyUsage();
    }

    router.push(`/presentation/${presentationId}/present`);
  };

  return (
    <>
    <LimitReached
      open={showLimitModal}
      onClose={() => setShowLimitModal(false)}
      onUpgrade={() => router.push('/billing')}
    />
    <ExportGate
      open={showExportGate}
      onClose={() => setShowExportGate(false)}
      onUpgrade={() => router.push('/billing')}
    />
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <CanvasControls
          columnCount={columnCount}
          onColumnCountChange={onColumnCountChange}
          onAutoArrange={onAutoArrange}
          imageCount={imageCount}
        />

        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReanalyze}
              disabled={isAnalyzing}
            >
              Yeniden Analiz Et
            </Button>
          )}

          {failedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetryFailed}
              disabled={isAnalyzing}
            >
              Tekrar Dene ({failedCount})
            </Button>
          )}

          {isAnalyzing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onStopAnalysis}
            >
              Durdur ({analysisCompleted}/{analysisTotal})
            </Button>
          )}

          {!isAnalyzing && pendingCount > 0 && (
            <Button
              size="sm"
              onClick={onStartAnalysis}
            >
              {pendingCount} Görseli Analiz Et
            </Button>
          )}

          <Button disabled={completedCount === 0} onClick={handleStartPresentation}>
            Sunuma Basla
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
