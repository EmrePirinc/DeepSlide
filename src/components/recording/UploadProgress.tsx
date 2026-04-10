// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { cn } from '@/lib/utils';

export type UploadStatus = 'uploading' | 'done' | 'error';

interface UploadProgressProps {
  progress: number; // 0-100
  status: UploadStatus;
  shareUrl?: string;
  onRetry?: () => void;
}

export function UploadProgress({ progress, status, shareUrl, onRetry }: UploadProgressProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
      {status === 'uploading' && (
        <>
          <div className="flex items-center justify-between text-sm text-white/80">
            <span>Yükleniyor…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-blue-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}

      {status === 'done' && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-green-300">✓ Yükleme tamamlandı</span>
          {shareUrl && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + shareUrl);
              }}
              className="ml-auto rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-400"
            >
              Linki Kopyala
            </button>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-red-300">Yükleme başarısız</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-auto rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30"
            >
              Tekrar Dene
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface UploadStatusBadgeProps {
  status: UploadStatus;
  progress: number;
  className?: string;
}

export function UploadStatusBadge({ status, progress, className }: UploadStatusBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1.5 rounded-full px-2 py-1 text-xs', className,
      status === 'uploading' && 'bg-blue-500/20 text-blue-200',
      status === 'done' && 'bg-green-500/20 text-green-200',
      status === 'error' && 'bg-red-500/20 text-red-200',
    )}>
      {status === 'uploading' && <><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />{progress}%</>}
      {status === 'done' && <><span>✓</span> Yüklendi</>}
      {status === 'error' && <><span>✗</span> Hata</>}
    </div>
  );
}
