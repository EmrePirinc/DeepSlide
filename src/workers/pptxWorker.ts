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

    // Debug — ilk slaytın ham verisi (büyük base64 image'ları temizlenmiş)
    const firstSlide = parsed.slides[0];
    if (firstSlide) {
      const sanitize = (obj: unknown): unknown => {
        if (typeof obj !== 'object' || obj === null) return obj;
        if (Array.isArray(obj)) return obj.map(sanitize);
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
          if (k === 'base64' && typeof v === 'string' && v.length > 100) {
            out[k] = v.slice(0, 80) + '…';
          } else {
            out[k] = sanitize(v);
          }
        }
        return out;
      };
      // eslint-disable-next-line no-console
      console.log('[PPTX WORKER] parsed.size:', parsed.size);
      // eslint-disable-next-line no-console
      console.log('[PPTX WORKER] slide[0] ilk 5 element:', sanitize((firstSlide.elements ?? []).slice(0, 5)));
      // eslint-disable-next-line no-console
      console.log('[PPTX WORKER] slide[0].fill:', firstSlide.fill);
      // eslint-disable-next-line no-console
      console.log('[PPTX WORKER] slide[0] element type counts:', countTypes(firstSlide.elements ?? []));
      // eslint-disable-next-line no-console
      console.log('[PPTX WORKER] slide[0] layoutElements count:', (firstSlide.layoutElements ?? []).length);
    }

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

function countTypes(elements: Array<{ type?: string }>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const el of elements) {
    const t = el?.type ?? 'unknown';
    out[t] = (out[t] ?? 0) + 1;
  }
  return out;
}

export {};
