'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CanvasControls } from '@/components/canvas/CanvasControls';

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
  return (
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

          <Link href={`/presentation/${presentationId}/present`}>
            <Button disabled={completedCount === 0}>
              Sunuma Başla
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
