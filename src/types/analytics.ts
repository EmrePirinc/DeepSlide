// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export interface SlideSessionRecord {
  slideId: string;
  timeSpentMs: number;
  matchCount: number;
  visitCount: number;
}

export interface PresentationSession {
  id: string;               // UUID
  presentationId: string;
  startedAt: number;        // epoch ms
  durationMs: number;
  slideRecords: SlideSessionRecord[];
  totalMatches: number;
  totalSlides: number;
}

export interface PresentationStats {
  presentationId: string;
  sessionCount: number;
  totalDurationMs: number;
  avgDurationMs: number;
  avgMatchRate: number;     // 0–1
  slideStats: SlideStats[];
}

export interface SlideStats {
  slideId: string;
  avgTimeMs: number;
  totalVisits: number;
  avgMatchCount: number;
}
