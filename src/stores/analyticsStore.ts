// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { create } from 'zustand';
import type { SlideSessionRecord } from '@/types/analytics';

interface SlideTracker {
  slideId: string;
  startedAt: number;
  matchCount: number;
}

interface AnalyticsState {
  sessionId: string;
  presentationId: string | null;
  sessionStartedAt: number;
  slideRecords: SlideSessionRecord[];
  currentTracker: SlideTracker | null;
  totalMatches: number;

  startSession: (presentationId: string) => void;
  focusSlide: (slideId: string) => void;
  incrementMatch: () => void;
  endSession: () => {
    sessionId: string;
    presentationId: string;
    startedAt: number;
    durationMs: number;
    records: SlideSessionRecord[];
    totalMatches: number;
  } | null;
  reset: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  sessionId: crypto.randomUUID(),
  presentationId: null,
  sessionStartedAt: Date.now(),
  slideRecords: [],
  currentTracker: null,
  totalMatches: 0,

  startSession: (presentationId) => {
    set({
      sessionId: crypto.randomUUID(),
      presentationId,
      sessionStartedAt: Date.now(),
      slideRecords: [],
      currentTracker: null,
      totalMatches: 0,
    });
  },

  focusSlide: (slideId) => {
    const { currentTracker, slideRecords } = get();
    const now = Date.now();

    let updatedRecords = slideRecords;

    // Close out previous tracker
    if (currentTracker) {
      const timeSpentMs = now - currentTracker.startedAt;
      const existing = updatedRecords.find((r) => r.slideId === currentTracker.slideId);
      if (existing) {
        updatedRecords = updatedRecords.map((r) =>
          r.slideId === currentTracker.slideId
            ? { ...r, timeSpentMs: r.timeSpentMs + timeSpentMs, visitCount: r.visitCount + 1, matchCount: r.matchCount + currentTracker.matchCount }
            : r,
        );
      } else {
        updatedRecords = [
          ...updatedRecords,
          {
            slideId: currentTracker.slideId,
            timeSpentMs,
            visitCount: 1,
            matchCount: currentTracker.matchCount,
          },
        ];
      }
    }

    set({
      slideRecords: updatedRecords,
      currentTracker: { slideId, startedAt: now, matchCount: 0 },
    });
  },

  incrementMatch: () => {
    set((state) => ({
      totalMatches: state.totalMatches + 1,
      currentTracker: state.currentTracker
        ? { ...state.currentTracker, matchCount: state.currentTracker.matchCount + 1 }
        : state.currentTracker,
    }));
  },

  endSession: () => {
    const { sessionId, presentationId, sessionStartedAt, slideRecords, currentTracker, totalMatches } = get();
    if (!presentationId) return null;

    const now = Date.now();
    let finalRecords = slideRecords;

    // Close final tracker
    if (currentTracker) {
      const timeSpentMs = now - currentTracker.startedAt;
      const existing = finalRecords.find((r) => r.slideId === currentTracker.slideId);
      if (existing) {
        finalRecords = finalRecords.map((r) =>
          r.slideId === currentTracker.slideId
            ? { ...r, timeSpentMs: r.timeSpentMs + timeSpentMs, visitCount: r.visitCount + 1, matchCount: r.matchCount + currentTracker.matchCount }
            : r,
        );
      } else {
        finalRecords = [
          ...finalRecords,
          { slideId: currentTracker.slideId, timeSpentMs, visitCount: 1, matchCount: currentTracker.matchCount },
        ];
      }
    }

    return {
      sessionId,
      presentationId,
      startedAt: sessionStartedAt,
      durationMs: now - sessionStartedAt,
      records: finalRecords,
      totalMatches,
    };
  },

  reset: () => {
    set({
      sessionId: crypto.randomUUID(),
      presentationId: null,
      sessionStartedAt: Date.now(),
      slideRecords: [],
      currentTracker: null,
      totalMatches: 0,
    });
  },
}));
