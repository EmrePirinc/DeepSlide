// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useCallback, useMemo } from 'react';

const FLAG_KEY_PREFIX = 'deepslide_onboarding_v1_';

export function useOnboarding(userId: string | undefined, presentationCount: number) {
  const flagKey = userId ? `${FLAG_KEY_PREFIX}${userId}` : null;

  const shouldShow = useMemo(() => {
    if (!flagKey || typeof window === 'undefined') return false;
    if (presentationCount > 0) return false;
    return !localStorage.getItem(flagKey);
  }, [flagKey, presentationCount]);

  const markCompleted = useCallback(() => {
    if (!flagKey) return;
    localStorage.setItem(flagKey, '1');
  }, [flagKey]);

  return { shouldShow, markCompleted };
}
