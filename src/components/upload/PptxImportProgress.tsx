'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { PptxImportProgress as Progress } from '@/lib/pptx/types';

interface Props {
  progress: Progress;
}

const PHASE_LABEL: Record<Progress['phase'], string> = {
  idle: '',
  parsing: 'PPTX ayrıştırılıyor…',
  rendering: 'Slaytlar resme dönüştürülüyor…',
  uploading: 'Görseller kaydediliyor…',
  done: 'İçe aktarma tamamlandı',
  error: 'Hata',
};

export function PptxImportProgress({ progress }: Props) {
  if (progress.phase === 'idle') return null;

  const pct = progress.totalSlides > 0
    ? Math.round((progress.renderedSlides / progress.totalSlides) * 100)
    : 0;

  const isDone = progress.phase === 'done';
  const isError = progress.phase === 'error';

  return (
    <div className="glass-card rounded-2xl border border-white/5 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-white">
          {PHASE_LABEL[progress.phase]}
        </p>
        {progress.totalSlides > 0 && !isError && (
          <p className="text-xs text-on-surface-variant font-mono">
            {progress.renderedSlides} / {progress.totalSlides}
          </p>
        )}
      </div>

      {!isError && (
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isDone ? 'bg-emerald-400' : 'bg-primary'
            }`}
            style={{ width: `${isDone ? 100 : pct}%` }}
          />
        </div>
      )}

      {isError && progress.error && (
        <p className="text-xs text-rose-400">{progress.error}</p>
      )}

      {isDone && progress.skippedElements.length > 0 && (
        <div className="text-xs text-on-surface-variant">
          <p className="font-semibold text-amber-400 mb-1">
            ⚠️ {progress.skippedElements.length} öğe basitleştirildi
          </p>
          <p>
            SmartArt, grafik, animasyon veya video gibi karmaşık öğeler yer
            tutucu olarak çizildi. Tam sadakat için bulut dönüşümü (yakında)
            seçeneğini kullanabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
