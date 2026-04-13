// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/// <reference lib="webworker" />

/**
 * PPTX ayrıştırma + DeepSlide CanvasSlide mapping — ana iplikten ayrı çalışır.
 * UI donmaz, 50MB+ deck'lerde bile stabil.
 */

import { parse } from 'pptxtojson';
import { mapPresentationToCanvas } from '@/lib/pptx/mapToCanvas';
import type { WorkerRequest, WorkerMessage } from '@/lib/pptx/types';

declare const self: DedicatedWorkerGlobalScope;

self.addEventListener('message', async (event: MessageEvent<WorkerRequest>) => {
  const { buffer, presentationId, canvasWidth, canvasHeight } = event.data;
  try {
    post({ kind: 'progress', phase: 'parsing', totalSlides: 0, processedSlides: 0 });

    const parsed = await parse(buffer, {
      imageMode: 'base64',
      videoMode: 'none',
      audioMode: 'none',
    });
    const totalSlides = parsed.slides.length;

    post({
      kind: 'progress',
      phase: 'mapping',
      totalSlides,
      processedSlides: 0,
    });

    const result = mapPresentationToCanvas(
      parsed.slides,
      parsed.size,
      presentationId,
      canvasWidth,
      canvasHeight,
    );

    post({
      kind: 'result',
      result: {
        slides: result.slides,
        images: result.images,
        skipped: result.skipped,
        sourceSize: parsed.size,
      },
    });
  } catch (err) {
    post({
      kind: 'error',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});

function post(msg: WorkerMessage): void {
  self.postMessage(msg);
}

export {};
