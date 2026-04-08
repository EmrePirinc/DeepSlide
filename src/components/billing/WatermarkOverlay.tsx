'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useAuth } from '@/hooks/useAuth';
import { shouldShowWatermark } from '@/lib/billing/plans';

export function WatermarkOverlay() {
  const { profile } = useAuth();

  if (!shouldShowWatermark(profile.plan, profile.trialRemaining)) {
    return null;
  }

  const handleClick = () => {
    window.open(
      'https://deepslide.app/?ref=watermark&source=presentation',
      '_blank',
      'noopener',
    );
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-40 rounded-lg bg-black/20 backdrop-blur-sm px-3 py-1.5 text-xs text-white/60 hover:text-white/90 transition-colors cursor-pointer"
      style={{ opacity: 0.4 }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.4'; }}
      aria-label="Powered by DeepSlide"
    >
      Powered by DeepSlide
    </button>
  );
}
