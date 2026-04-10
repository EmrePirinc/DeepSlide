'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { shouldShowPaywall, FREE_VOICE_SLIDES } from '@/lib/billing/plans';

interface SpeechPaywallResult {
  isPaywalled: boolean;
  voiceEnabled: boolean;
  paywallSlideIndex: number;
  trialActive: boolean;
}

export function useSpeechPaywall(
  imageCount: number,
  currentSlideIndex: number,
): SpeechPaywallResult {
  const { profile } = useAuth();

  return useMemo(() => {
    const trialActive = profile.trialRemaining > 0;
    const isPaywalled = shouldShowPaywall(
      profile.plan,
      imageCount,
      currentSlideIndex,
      profile.trialRemaining,
    );

    return {
      isPaywalled,
      voiceEnabled: !isPaywalled,
      paywallSlideIndex: FREE_VOICE_SLIDES,
      trialActive,
    };
  }, [profile.plan, profile.trialRemaining, imageCount, currentSlideIndex]);
}
