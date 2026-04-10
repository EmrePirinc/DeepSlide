// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { RecordingQuality } from './recordingService';

export function getMaxResolution(isPro: boolean): RecordingQuality {
  return isPro ? '1080p' : '480p';
}

export function shouldShowUpgradePrompt(isPro: boolean): boolean {
  return !isPro;
}

export function applyQualityConstraints(isPro: boolean): MediaTrackConstraints {
  if (isPro) {
    return { width: { max: 1920 }, height: { max: 1080 } };
  }
  return { width: { max: 854 }, height: { max: 480 } };
}
