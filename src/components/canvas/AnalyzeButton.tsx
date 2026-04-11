// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface AnalyzeButtonProps {
  pendingCount: number;
  completedCount: number;
  totalCount: number;
  isAnalyzing: boolean;
  onStart: () => void;
  onStop: () => void;
  onReanalyze: () => void;
}

export function AnalyzeButton({
  pendingCount,
  completedCount,
  totalCount,
  isAnalyzing,
  onStart,
  onStop,
  onReanalyze,
}: AnalyzeButtonProps) {
  const allDone = totalCount > 0 && pendingCount === 0 && !isAnalyzing;

  // Analiz ediliyor
  if (isAnalyzing) {
    return (
      <div className="flex items-center gap-3">
        <button
          className="flex items-center gap-2 bg-primary/20 border border-primary/30 text-white rounded-xl px-4 py-2 text-xs font-bold"
        >
          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>{completedCount}/{totalCount}</span>
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden ml-1">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </button>
        <button
          onClick={onStop}
          className="text-[10px] font-black text-on-surface-variant hover:text-white uppercase tracking-wider transition-colors"
        >
          Durdur
        </button>
      </div>
    );
  }

  // Tümü analiz edildi
  if (allDone) {
    return (
      <button
        onClick={onReanalyze}
        className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl px-4 py-2 text-xs font-bold hover:bg-emerald-500/20 transition-all group"
      >
        <MaterialIcon icon="check_circle" size={18} />
        <span>Tümü analiz edildi</span>
        <span className="text-[10px] text-emerald-400/60 group-hover:text-emerald-400 transition-colors ml-1">
          Yeniden →
        </span>
      </button>
    );
  }

  // Bekleyen var — CTA
  if (pendingCount > 0) {
    return (
      <button
        onClick={onStart}
        className="relative flex items-center gap-2 bg-primary hover:bg-primary-container text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-xl shadow-primary/30 active:scale-95 transition-all animate-pulse"
      >
        <MaterialIcon icon="auto_awesome" size={18} />
        <span>AI Analiz Et</span>
        {/* Badge */}
        <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
          {pendingCount}
        </span>
      </button>
    );
  }

  // Görsel yok
  return (
    <button
      disabled
      className="flex items-center gap-2 bg-white/5 text-on-surface-variant rounded-xl px-4 py-2 text-xs font-bold cursor-not-allowed opacity-50"
    >
      <MaterialIcon icon="auto_awesome" size={18} />
      <span>Görsel yükleyin</span>
    </button>
  );
}
