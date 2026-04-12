'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { ChevronLeft, ChevronRight, Mic, MicOff, X } from 'lucide-react';
import { usePresenterUIVisibility } from '@/hooks/usePresenterUIVisibility';

/**
 * Unified Presenter Bottom Bar (FR-009 + FR-010 + FR-011 + FR-013).
 *
 * Floating pill alt bar — 4 buton: ← mikrofon ✕ →
 * Mevcut AdaptiveControls + SpeechControls + (RecordingButton alt bar kullanımı)
 * üçlüsünün yerini alır. SpeechControls double-render bug'ı elimine edilir.
 *
 * Görünürlük `usePresenterUIVisibility` hook'una bağlı:
 * - 3sn idle → fade-out
 * - Cursor hareketi / ← → tuşu → fade-in 2sn
 * - ESC → koşulsuz reveal
 * - Touch tap → toggle
 *
 * NFR-ACC-001: WCAG AA kontrast (bg-black/75 + text-white = 14.8:1)
 * NFR-ACC-005: Her buton aria-label içeriyor, keyboard Tab erişilebilir
 * NFR-PERF-004: Fade-in 200ms, fade-out 300ms (reduced motion: 100ms)
 */

interface PresenterBottomBarProps {
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
  onToggleMic: () => void;
  isListening: boolean;
  canPrev: boolean;
  canNext: boolean;
}

export function PresenterBottomBar({
  onPrev,
  onNext,
  onExit,
  onToggleMic,
  isListening,
  canPrev,
  canNext,
}: PresenterBottomBarProps) {
  const { isVisible } = usePresenterUIVisibility();

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        transition-opacity duration-300 motion-reduce:duration-100
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      aria-hidden={!isVisible}
    >
      <div className="flex items-center gap-1 px-3 py-2 bg-black/75 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
        {/* ← Önceki */}
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="Önceki slayt"
          className="
            w-11 h-11 rounded-full flex items-center justify-center
            text-white/90 hover:bg-white/10 active:scale-95
            transition-all motion-reduce:transition-none
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
          "
        >
          <ChevronLeft size={22} />
        </button>

        {/* 🎤 Mikrofon — minimal renk (C şıkkı): kırmızı aktif, gri pasif */}
        <button
          type="button"
          onClick={onToggleMic}
          aria-label={isListening ? 'Mikrofonu kapat' : 'Mikrofonu aç'}
          aria-pressed={isListening}
          className={`
            w-11 h-11 rounded-full flex items-center justify-center
            hover:bg-white/10 active:scale-95
            transition-all motion-reduce:transition-none
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
            ${isListening ? 'text-red-400' : 'text-white/60'}
          `}
        >
          {isListening ? <Mic size={22} /> : <MicOff size={22} />}
        </button>

        {/* ✕ Çıkış */}
        <button
          type="button"
          onClick={onExit}
          aria-label="Sunumdan çık"
          className="
            w-11 h-11 rounded-full flex items-center justify-center
            text-white/90 hover:bg-red-500/20 hover:text-red-400 active:scale-95
            transition-all motion-reduce:transition-none
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400
          "
        >
          <X size={22} />
        </button>

        {/* → Sonraki */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Sonraki slayt"
          className="
            w-11 h-11 rounded-full flex items-center justify-center
            text-white/90 hover:bg-white/10 active:scale-95
            transition-all motion-reduce:transition-none
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
          "
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}
