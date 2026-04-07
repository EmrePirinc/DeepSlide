'use client';

import type { PresentationTheme } from '@/lib/themes/types';

interface SlideIndicatorProps {
  total: number;
  current: number;
  theme: PresentationTheme;
  onDotClick?: (index: number) => void;
}

export function SlideIndicator({
  total,
  current,
  theme,
  onDotClick,
}: SlideIndicatorProps) {
  if (total <= 1) return null;

  // Çok fazla görselde sadece etrafındaki 10 noktayı göster
  const maxDots = 15;
  let startIdx = 0;
  let endIdx = total;

  if (total > maxDots) {
    startIdx = Math.max(0, current - Math.floor(maxDots / 2));
    endIdx = Math.min(total, startIdx + maxDots);
    if (endIdx - startIdx < maxDots) {
      startIdx = Math.max(0, endIdx - maxDots);
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5">
      {startIdx > 0 && (
        <span style={{ color: theme.mutedColor }} className="text-xs">...</span>
      )}
      {Array.from({ length: endIdx - startIdx }, (_, i) => {
        const idx = startIdx + i;
        const isActive = idx === current;
        return (
          <button
            key={idx}
            onClick={() => onDotClick?.(idx)}
            className="transition-all duration-200"
            style={{
              width: isActive ? 12 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: isActive ? theme.textColor : theme.mutedColor,
              opacity: isActive ? 1 : 0.5,
            }}
          />
        );
      })}
      {endIdx < total && (
        <span style={{ color: theme.mutedColor }} className="text-xs">...</span>
      )}
    </div>
  );
}
