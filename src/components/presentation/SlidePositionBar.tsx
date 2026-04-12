'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useState } from 'react';

/**
 * Üst kenarda 2 piksel ince slayt konum göstergesi (FR-007, FR-008).
 *
 * Normalde 2px, cursor hover'da 6px'e kalınlaşır ve "6/15" tooltip gösterir.
 * Dinleyici için fark edilmez, konuşmacı ihtiyacında görür.
 *
 * NFR-ACC-001: WCAG AA kontrast (white on black/80 = 14.8:1)
 * NFR-PERF-004: 300ms geçiş (motion-reduce: 100ms)
 */

interface SlidePositionBarProps {
  currentIndex: number;   // 0-based
  totalSlides: number;
}

export function SlidePositionBar({ currentIndex, totalSlides }: SlidePositionBarProps) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (totalSlides <= 0) return null;

  const progressPct = ((currentIndex + 1) / totalSlides) * 100;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed top-0 left-0 right-0 z-40
        bg-white/10
        transition-all duration-200 motion-reduce:duration-100
        ${isHovered ? 'h-[6px]' : 'h-[2px]'}
      `}
      aria-hidden="true"
    >
      <div
        className="h-full bg-primary transition-all duration-300 motion-reduce:duration-100 ease-out"
        style={{ width: `${progressPct}%` }}
      />

      {isHovered && (
        <div
          className="
            absolute top-[12px] left-1/2 -translate-x-1/2
            px-3 py-1.5 rounded-full
            bg-black/85 text-white text-xs font-semibold
            whitespace-nowrap pointer-events-none
            shadow-lg border border-white/10
          "
        >
          {currentIndex + 1}/{totalSlides}
        </div>
      )}
    </div>
  );
}
