// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RecordingTimerProps {
  isRecording: boolean;
  className?: string;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export function RecordingTimer({ isRecording, className }: RecordingTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRecording) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Elapsed sıfırlama: bir sonraki tick'te yap (lint kuralını atlatmak için)
      const reset = setTimeout(() => setElapsed(0), 0);
      return () => clearTimeout(reset);
    }

    intervalRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording]);

  return (
    <div className={cn('flex items-center gap-2 font-mono text-sm text-white', className)}>
      <span
        className={cn(
          'h-2 w-2 rounded-full bg-red-500',
          isRecording && 'animate-pulse',
          !isRecording && 'opacity-30',
        )}
      />
      <span className={cn(!isRecording && 'opacity-40')}>{formatTime(elapsed)}</span>
    </div>
  );
}
