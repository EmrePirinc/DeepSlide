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

    // Debug — JSON.stringify ile log (Worker console relay [object Object] gösteriyor)
    const debugLines: string[] = [];
    debugLines.push(`size=${JSON.stringify(parsed.size)} totalSlides=${totalSlides}`);
    for (let i = 0; i < Math.min(3, totalSlides); i++) {
      const s = parsed.slides[i];
      debugLines.push(`--- slide[${i}] fill=${JSON.stringify(s.fill)} elCount=${(s.elements ?? []).length} types=${JSON.stringify(countTypes(s.elements ?? []))}`);
      for (const el of s.elements ?? []) {
        const base: Record<string, unknown> = {
          type: el.type,
          l: Math.round(('left' in el ? el.left : 0) as number),
          t: Math.round(('top' in el ? el.top : 0) as number),
          w: Math.round(('width' in el ? el.width : 0) as number),
          h: Math.round(('height' in el ? el.height : 0) as number),
        };
        if (el.type === 'shape') {
          const sh = el as { shapType?: string; fill?: { type?: string; value?: unknown }; content?: string };
          base.shapType = sh.shapType;
          base.fillType = sh.fill?.type;
          const fv = sh.fill?.value;
          base.fillVal = typeof fv === 'string' ? fv : typeof fv === 'object' && fv !== null ? Object.keys(fv).join(',') : '';
          base.content = (sh.content || '').slice(0, 80);
        }
        if (el.type === 'text') {
          const te = el as { content?: string; vAlign?: string };
          base.content = (te.content || '').slice(0, 120);
          base.vAlign = te.vAlign;
        }
        if (el.type === 'image') {
          const im = el as { base64?: string };
          base.hasBase64 = !!im.base64;
        }
        debugLines.push(JSON.stringify(base));
      }
    }
    // eslint-disable-next-line no-console
    console.log('[PPTX WORKER DEBUG]\n' + debugLines.join('\n'));

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
