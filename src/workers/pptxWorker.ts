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

    // Debug — ilk 3 slaytın ham verisi (base64 kısaltılmış)
    const sanitize = (obj: unknown): unknown => {
      if (typeof obj !== 'object' || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map(sanitize);
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if ((k === 'base64' || k === 'blob') && typeof v === 'string' && v.length > 100) {
          out[k] = v.slice(0, 60) + `… (${v.length})`;
        } else {
          out[k] = sanitize(v);
        }
      }
      return out;
    };
    // eslint-disable-next-line no-console
    console.log('[PPTX WORKER] parsed.size:', parsed.size);
    // eslint-disable-next-line no-console
    console.log('[PPTX WORKER] total slides:', totalSlides);
    for (let i = 0; i < Math.min(3, totalSlides); i++) {
      const s = parsed.slides[i];
      // eslint-disable-next-line no-console
      console.log(`[PPTX WORKER] slide[${i}] fill:`, s.fill, 'elementCount:', (s.elements ?? []).length, 'types:', countTypes(s.elements ?? []));
      // eslint-disable-next-line no-console
      console.log(`[PPTX WORKER] slide[${i}] tüm element'lerin özeti:`, (s.elements ?? []).map((el) => {
        const base: Record<string, unknown> = {
          type: el.type,
          left: Math.round(('left' in el ? el.left : 0) as number),
          top: Math.round(('top' in el ? el.top : 0) as number),
          w: Math.round(('width' in el ? el.width : 0) as number),
          h: Math.round(('height' in el ? el.height : 0) as number),
        };
        if (el.type === 'shape') {
          base.shapType = (el as { shapType?: string }).shapType;
          base.fillType = (el as { fill?: { type?: string } }).fill?.type;
          base.hasContent = !!(el as { content?: string }).content;
        }
        if (el.type === 'text') {
          base.content = ((el as { content?: string }).content || '').slice(0, 60);
        }
        if (el.type === 'image') {
          base.hasBase64 = !!(el as { base64?: string }).base64;
        }
        return base;
      }));
    }
    // eslint-disable-next-line no-console
    console.log('[PPTX WORKER] slide[1] ilk element tam sanitize:', sanitize(parsed.slides[1]?.elements?.[0]));

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
