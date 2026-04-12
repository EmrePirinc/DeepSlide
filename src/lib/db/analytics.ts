// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { getDB } from './index';
import type { PresentationSession, PresentationStats, SlideStats } from '@/types/analytics';

export async function saveSession(session: PresentationSession): Promise<void> {
  const db = await getDB();
  await db.put('sessions', session);
}

export async function getSessionsForPresentation(
  presentationId: string,
): Promise<PresentationSession[]> {
  const db = await getDB();
  return db.getAllFromIndex('sessions', 'by-presentation', presentationId);
}

export async function deleteSessionsForPresentation(
  presentationId: string,
): Promise<void> {
  const db = await getDB();
  const keys = await db.getAllKeysFromIndex('sessions', 'by-presentation', presentationId);
  const tx = db.transaction('sessions', 'readwrite');
  for (const key of keys) await tx.store.delete(key);
  await tx.done;
}

export async function computeStats(
  presentationId: string,
): Promise<PresentationStats | null> {
  const sessions = await getSessionsForPresentation(presentationId);
  if (sessions.length === 0) return null;

  const totalDurationMs = sessions.reduce((s, r) => s + r.durationMs, 0);
  const avgDurationMs = Math.round(totalDurationMs / sessions.length);

  // Per-slide aggregation
  const slideMap = new Map<
    string,
    { totalTimeMs: number; totalVisits: number; totalMatchCount: number; count: number }
  >();

  for (const session of sessions) {
    for (const rec of session.slideRecords) {
      const existing = slideMap.get(rec.slideId) ?? {
        totalTimeMs: 0,
        totalVisits: 0,
        totalMatchCount: 0,
        count: 0,
      };
      existing.totalTimeMs += rec.timeSpentMs;
      existing.totalVisits += rec.visitCount;
      existing.totalMatchCount += rec.matchCount;
      existing.count += 1;
      slideMap.set(rec.slideId, existing);
    }
  }

  const slideStats: SlideStats[] = Array.from(slideMap.entries()).map(([slideId, d]) => ({
    slideId,
    avgTimeMs: Math.round(d.totalTimeMs / d.count),
    totalVisits: d.totalVisits,
    avgMatchCount: Math.round((d.totalMatchCount / d.count) * 10) / 10,
  }));

  const totalMatches = sessions.reduce((s, r) => s + r.totalMatches, 0);
  const totalExpected = sessions.reduce((s, r) => s + r.totalSlides, 0);
  const avgMatchRate = totalExpected > 0 ? totalMatches / totalExpected : 0;

  return {
    presentationId,
    sessionCount: sessions.length,
    totalDurationMs,
    avgDurationMs,
    avgMatchRate,
    slideStats,
  };
}
