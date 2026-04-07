'use client';

import { useRef, useSyncExternalStore, useCallback } from 'react';
import type { PresentationImage } from '@/types/presentation';
import type { PresentationTheme } from '@/lib/themes/types';

interface KeywordHintProps {
  images: PresentationImage[];
  focusedImageId: string | null;
  isListening: boolean;
  theme: PresentationTheme;
  silenceThresholdMs?: number;
}

/**
 * Sessizlikte keyword ipucu gösterir.
 */
export function KeywordHint({
  images,
  focusedImageId,
  isListening,
  theme,
  silenceThresholdMs = 5000,
}: KeywordHintProps) {
  const visibleRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);

    // Timer'ı başlat/resetle
    if (timerRef.current) clearTimeout(timerRef.current);

    if (isListening) {
      visibleRef.current = false;
      timerRef.current = setTimeout(() => {
        visibleRef.current = true;
        listenersRef.current.forEach((l) => l());
      }, silenceThresholdMs);
    } else {
      visibleRef.current = false;
    }

    return () => {
      listenersRef.current.delete(listener);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isListening, silenceThresholdMs]);

  const getSnapshot = useCallback(() => visibleRef.current, []);

  const visible = useSyncExternalStore(subscribe, getSnapshot, () => false);

  if (!visible || images.length === 0) return null;

  const currentIdx = focusedImageId
    ? images.findIndex((img) => img.id === focusedImageId)
    : -1;

  const relevantImages = focusedImageId && currentIdx >= 0
    ? images.slice(currentIdx, Math.min(images.length, currentIdx + 3))
    : images.slice(0, 4);

  const keywords = relevantImages
    .flatMap((img) => img.keywords.slice(0, 2))
    .map((kw) => kw.text)
    .slice(0, 6);

  if (keywords.length === 0) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
      style={{ opacity: 0.6 }}
    >
      <div
        className="rounded-full px-4 py-2 flex items-center gap-2 text-xs backdrop-blur-sm"
        style={{
          backgroundColor: `${theme.bg}cc`,
          color: theme.mutedColor,
        }}
      >
        <span>Kelimeler:</span>
        {keywords.map((kw, i) => (
          <span
            key={i}
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: theme.badgeColor, color: theme.badgeTextColor }}
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}
