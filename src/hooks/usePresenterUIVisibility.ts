'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Present page UI görünürlük yönetimi (FR-010, FR-011, FR-012, FR-013).
 *
 * Davranış:
 *   - İlk render: görünür, 3sn idle timer başlar
 *   - 3sn boyunca hiçbir event yoksa fade-out
 *   - mousemove / ArrowLeft / ArrowRight → 2sn fade-in reveal (yeni timer)
 *   - Escape → koşulsuz 2sn reveal (emergency)
 *   - touchstart → toggle (hedef buton değilse)
 *
 * Tek yerden event management — PresenterBottomBar, SlidePositionBar,
 * CornerHintChip gibi component'ler `isVisible` state'ine subscribe olur.
 */

const INITIAL_HIDE_DELAY = 3000;
const REVEAL_DURATION = 2000;

export function usePresenterUIVisibility(): {
  isVisible: boolean;
  reveal: () => void;
  hide: () => void;
} {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // isVisibleRef keeps in-sync so event listeners (stale closure) okuyabilir
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  const clearHideTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(
    (ms: number) => {
      clearHideTimer();
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        timerRef.current = null;
      }, ms);
    },
    [clearHideTimer],
  );

  const reveal = useCallback(() => {
    setIsVisible(true);
    scheduleHide(REVEAL_DURATION);
  }, [scheduleHide]);

  const hide = useCallback(() => {
    clearHideTimer();
    setIsVisible(false);
  }, [clearHideTimer]);

  // İlk mount: 3sn sonra gizle
  useEffect(() => {
    scheduleHide(INITIAL_HIDE_DELAY);
    return clearHideTimer;
  }, [scheduleHide, clearHideTimer]);

  // Global event listeners
  useEffect(() => {
    const handleMouseMove = () => {
      reveal();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        reveal();
      } else if (e.key === 'Escape') {
        // ESC emergency — her durumda göster, timer reset
        reveal();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Buton üzerine tap yapılırsa toggle yapma (butonun kendi onClick çalışır)
      const target = e.target as HTMLElement | null;
      if (target?.closest('button')) return;

      if (isVisibleRef.current) {
        // Görünürse gizle
        hide();
      } else {
        // Gizliyse göster
        reveal();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [reveal, hide]);

  return { isVisible, reveal, hide };
}
