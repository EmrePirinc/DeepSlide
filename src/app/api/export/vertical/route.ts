// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';

/**
 * Vertical Video Export (FR-030 — Faz 3)
 *
 * Generates a job to create a 9:16 vertical video from slide thumbnails.
 * Real FFmpeg processing runs async (Cloud Tasks / Lambda).
 * This route validates input, queues the job, and returns a job ID.
 *
 * Client sends:
 *   presentationId: string
 *   thumbnailUrls: string[]   (data URLs from IndexedDB — sent as array)
 *   durationPerSlide?: number  (seconds, default 3)
 *   audioUrl?: string          (optional background music)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      presentationId?: string;
      thumbnailUrls?: string[];
      durationPerSlide?: number;
    };

    const { presentationId, thumbnailUrls, durationPerSlide = 3 } = body;

    if (!presentationId || typeof presentationId !== 'string') {
      return NextResponse.json({ error: 'presentationId gerekli' }, { status: 400 });
    }
    if (!Array.isArray(thumbnailUrls) || thumbnailUrls.length === 0) {
      return NextResponse.json({ error: 'thumbnailUrls dizisi boş olamaz' }, { status: 400 });
    }
    if (thumbnailUrls.length > 100) {
      return NextResponse.json({ error: 'Maksimum 100 slayt destekleniyor' }, { status: 400 });
    }

    const jobId = crypto.randomUUID();
    const estimatedDurationSec = thumbnailUrls.length * Math.min(10, Math.max(1, durationPerSlide));

    // TODO: Queue real FFmpeg job (Cloud Tasks / BullMQ)
    // For now, return a job stub with instructions for client-side canvas export
    return NextResponse.json({
      jobId,
      status: 'queued',
      message: 'Dikey video işlemi sıraya alındı.',
      estimatedDurationSec,
      slideCount: thumbnailUrls.length,
      // Client-side fallback: use the canvas recorder approach
      clientFallback: true,
      clientFallbackConfig: {
        width: 1080,
        height: 1920,
        durationPerSlideMs: durationPerSlide * 1000,
        format: 'video/webm;codecs=vp9',
      },
    });
  } catch (err) {
    console.error('[export/vertical]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bilinmeyen hata' },
      { status: 500 },
    );
  }
}
