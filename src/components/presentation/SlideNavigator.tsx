'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import type { PresentationTheme } from '@/lib/themes/types';

interface SlideNavigatorProps {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  theme: PresentationTheme;
}

/**
 * Sunum modunda sol/sağ navigasyon okları.
 * Ekranın kenarlarında yarı saydam, hover'da belirgin.
 */
export function SlideNavigator({
  onPrev,
  onNext,
  canPrev,
  canNext,
  theme,
}: SlideNavigatorProps) {
  return (
    <>
      {/* Sol ok — önceki */}
      {canPrev && (
        <button
          onClick={onPrev}
          className="fixed left-0 top-0 bottom-0 w-16 z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          style={{ background: `linear-gradient(to right, ${theme.bg}80, transparent)` }}
        >
          <span
            className="text-3xl font-light"
            style={{ color: theme.textColor }}
          >
            ‹
          </span>
        </button>
      )}

      {/* Sağ ok — sonraki */}
      {canNext && (
        <button
          onClick={onNext}
          className="fixed right-0 top-0 bottom-0 w-16 z-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          style={{ background: `linear-gradient(to left, ${theme.bg}80, transparent)` }}
        >
          <span
            className="text-3xl font-light"
            style={{ color: theme.textColor }}
          >
            ›
          </span>
        </button>
      )}
    </>
  );
}
