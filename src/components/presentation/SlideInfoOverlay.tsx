'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import type { PresentationImage } from '@/types/presentation';
import type { PresentationTheme } from '@/lib/themes/types';

interface SlideInfoOverlayProps {
  image: PresentationImage;
  currentIndex: number;
  totalImages: number;
  matchedKeyword?: string;
  theme: PresentationTheme;
}

export function SlideInfoOverlay({
  image,
  currentIndex,
  totalImages,
  matchedKeyword,
  theme,
}: SlideInfoOverlayProps) {
  // AI açıklamasını bul (ilk analiz sonucundan)
  const description = image.keywords.length > 0
    ? image.keywords.map(k => k.text).join(', ')
    : image.fileName;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-6 pointer-events-none"
      style={{ background: theme.overlayGradient }}
    >
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          {matchedKeyword && (
            <span
              className="inline-block px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: theme.badgeColor,
                color: theme.badgeTextColor,
              }}
            >
              {matchedKeyword}
            </span>
          )}
          <p
            className="text-lg font-medium max-w-lg"
            style={{ color: theme.textColor }}
          >
            {description}
          </p>
        </div>
        <span
          className="text-sm font-mono"
          style={{ color: theme.mutedColor }}
        >
          {currentIndex + 1}/{totalImages}
        </span>
      </div>
    </div>
  );
}
