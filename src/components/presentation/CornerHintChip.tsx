'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useEffect, useState } from 'react';

/**
 * Köşe ipucu chip'i — önceki veya sonraki slaytın isHint keyword'leri
 * (FR-018, FR-019, FR-020).
 *
 * Pozisyon:
 *   - direction="prev"  → sol-üst (← prefix)
 *   - direction="next"  → sağ-üst (→ suffix)
 *
 * Davranış:
 *   - keywords boşsa null (hiç render edilmez — FR-020)
 *   - Max 3 keyword görünür (FR-017)
 *   - 4+ varsa "+N daha" button → tıkla → popover 3sn
 *
 * NFR-ACC-001: WCAG AA kontrast (text-white on black/75 = ~14:1)
 * NFR-ACC-002: Font ≥16px (text-base = 16px)
 * NFR-ACC-003: motion-reduce friendly
 */

const MAX_VISIBLE = 3;
const POPOVER_AUTO_CLOSE_MS = 3000;

interface CornerHintChipProps {
  direction: 'prev' | 'next';
  keywords: string[];
}

export function CornerHintChip({ direction, keywords }: CornerHintChipProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  // Popover otomatik kapanma
  useEffect(() => {
    if (!isPopoverOpen) return;
    const timer = setTimeout(() => setIsPopoverOpen(false), POPOVER_AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [isPopoverOpen]);

  // FR-020: Null render — keyword yoksa hiç DOM yaratma
  if (keywords.length === 0) return null;

  const visible = keywords.slice(0, MAX_VISIBLE);
  const overflow = keywords.slice(MAX_VISIBLE);

  const positionClass =
    direction === 'prev' ? 'left-4 top-4' : 'right-4 top-4';

  return (
    <div
      className={`fixed ${positionClass} z-40 pointer-events-auto`}
      aria-label={direction === 'prev' ? 'Önceki slayt ipuçları' : 'Sonraki slayt ipuçları'}
    >
      <div className="relative">
        <div
          className="
            flex items-center gap-2
            px-4 py-2 rounded-full
            bg-black/75 backdrop-blur-xl border border-white/10
            shadow-2xl
            text-base font-semibold text-white
            transition-opacity duration-200 motion-reduce:duration-100
          "
        >
          {direction === 'prev' && (
            <span className="text-white/60 text-lg" aria-hidden="true">
              ←
            </span>
          )}

          <span className="flex items-center gap-2">
            {visible.map((kw, i) => (
              <span key={`${kw}-${i}`}>
                {kw}
                {i < visible.length - 1 && <span className="opacity-40 mx-0.5">·</span>}
              </span>
            ))}
          </span>

          {overflow.length > 0 && (
            <button
              type="button"
              onClick={() => setIsPopoverOpen((v) => !v)}
              className="
                ml-1 px-2 py-0.5 rounded-full
                bg-white/10 hover:bg-white/20
                text-xs font-bold text-white/80
                transition-colors motion-reduce:transition-none
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50
              "
              aria-label={`${overflow.length} daha fazla ipucu göster`}
              aria-expanded={isPopoverOpen}
            >
              +{overflow.length}
            </button>
          )}

          {direction === 'next' && (
            <span className="text-white/60 text-lg" aria-hidden="true">
              →
            </span>
          )}
        </div>

        {/* Overflow popover */}
        {isPopoverOpen && overflow.length > 0 && (
          <div
            className={`
              absolute top-full mt-2
              ${direction === 'prev' ? 'left-0' : 'right-0'}
              min-w-[160px]
              px-4 py-3 rounded-xl
              bg-black/90 backdrop-blur-xl border border-white/10
              shadow-2xl
              text-sm text-white
              motion-reduce:transition-none
            `}
            role="dialog"
            aria-label="Diğer ipuçları"
          >
            <div className="text-[10px] uppercase tracking-wider text-white/50 mb-2">
              Diğer ipuçları
            </div>
            <ul className="space-y-1">
              {overflow.map((kw, i) => (
                <li key={`${kw}-${i}`} className="font-medium">
                  {kw}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
