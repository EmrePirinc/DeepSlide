'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { PptxImportProgress as Progress } from '@/lib/pptx/types';

interface Props {
  progress: Progress;
}

const PHASE_LABEL: Record<Progress['phase'], string> = {
  idle: '',
  uploading: 'PPTX yükleniyor…',
  converting: 'Yüksek sadakatli dönüşüm yapılıyor…',
  downloading: 'Slayt görselleri indiriliyor…',
  saving: 'Görseller kaydediliyor…',
  done: 'İçe aktarma tamamlandı',
  error: 'Hata',
};

export function PptxImportProgress({ progress }: Props) {
  if (progress.phase === 'idle') return null;

  const pct = progress.totalSlides > 0
    ? Math.round((progress.processedSlides / progress.totalSlides) * 100)
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
            {progress.processedSlides} / {progress.totalSlides}
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

      {isDone && (
        <p className="text-xs text-emerald-400">
          ✓ {progress.totalSlides} slayt %98+ sadakatle aktarıldı
        </p>
      )}
    </div>
  );
}
