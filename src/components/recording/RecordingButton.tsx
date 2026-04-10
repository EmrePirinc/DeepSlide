// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { cn } from '@/lib/utils';

export type RecordingState = 'idle' | 'recording' | 'stopping' | 'error';

interface RecordingButtonProps {
  state: RecordingState;
  isSafariMode?: boolean;
  onStart: () => void;
  onStop: () => void;
  className?: string;
}

export function RecordingButton({ state, isSafariMode, onStart, onStop, className }: RecordingButtonProps) {
  const isRecording = state === 'recording';
  const isStopping = state === 'stopping';
  const isDisabled = isStopping;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <button
        onClick={isRecording ? onStop : onStart}
        disabled={isDisabled}
        aria-label={isRecording ? 'Kaydı Durdur' : 'Kaydı Başlat'}
        className={cn(
          'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
          isRecording
            ? 'bg-red-600 text-white shadow-lg shadow-red-600/40'
            : 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
          isStopping && 'cursor-not-allowed opacity-60',
        )}
      >
        {isStopping ? (
          <>
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Durduruluyor…
          </>
        ) : isRecording ? (
          <>
            <RecordingDot />
            ● REC
          </>
        ) : (
          <>
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            ● REC
          </>
        )}
      </button>

      {isSafariMode && !isRecording && (
        <p className="max-w-[220px] rounded-md bg-yellow-500/20 px-2 py-1 text-center text-xs text-yellow-200">
          Safari&apos;de tam deneyim için Chrome kullanın. Yalnızca mikrofon sesi kaydedilecek.
        </p>
      )}
    </div>
  );
}

function RecordingDot() {
  return (
    <span
      className="h-2.5 w-2.5 rounded-full bg-white"
      style={{ animation: 'blink 1s step-start infinite' }}
    >
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </span>
  );
}
