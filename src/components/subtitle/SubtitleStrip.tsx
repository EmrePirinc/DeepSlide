// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { cn } from '@/lib/utils';

interface SubtitleStripProps {
  text: string;
  isActive: boolean;
  className?: string;
}

export function SubtitleStrip({ text, isActive, className }: SubtitleStripProps) {
  if (!isActive || !text) return null;

  return (
    <div
      className={cn(
        'fixed bottom-8 left-1/2 z-50 -translate-x-1/2',
        'max-w-3xl px-6 py-3 text-center',
        'rounded-2xl bg-black/70 backdrop-blur-sm',
        'text-[1.6rem] font-semibold leading-tight text-white drop-shadow-lg',
        className,
      )}
      aria-live="polite"
      aria-label="Alt yazı"
    >
      {text}
    </div>
  );
}
