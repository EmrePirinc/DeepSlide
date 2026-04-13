'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useState, useCallback } from 'react';
import { parsePptx } from '@/lib/pptx/parser';
import { renderSlideToBlob } from '@/lib/pptx/renderer';
import type { PptxImportProgress, SkippedElement } from '@/lib/pptx/types';
import { useImageUpload } from '@/hooks/useImageUpload';

const RENDER_WIDTH = 1920;
const RENDER_HEIGHT = 1080;
const MAX_PPTX_SIZE_MB = 100;
const RENDER_CONCURRENCY = 3;

interface UsePptxImportReturn {
  importPptx: (file: File) => Promise<void>;
  progress: PptxImportProgress;
  isImporting: boolean;
  reset: () => void;
}

const INITIAL_PROGRESS: PptxImportProgress = {
  phase: 'idle',
  totalSlides: 0,
  renderedSlides: 0,
  skippedElements: [],
};

export function usePptxImport(): UsePptxImportReturn {
  const { uploadFiles } = useImageUpload();
  const [progress, setProgress] = useState<PptxImportProgress>(INITIAL_PROGRESS);
  const [isImporting, setIsImporting] = useState(false);

  const reset = useCallback(() => setProgress(INITIAL_PROGRESS), []);

  const importPptx = useCallback(
    async (file: File) => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_PPTX_SIZE_MB) {
        setProgress({
          ...INITIAL_PROGRESS,
          phase: 'error',
          error: `Dosya çok büyük (${sizeMB.toFixed(1)}MB). Maksimum ${MAX_PPTX_SIZE_MB}MB.`,
        });
        return;
      }

      setIsImporting(true);
      setProgress({ ...INITIAL_PROGRESS, phase: 'parsing' });

      try {
        const parsed = await parsePptx(file);
        const totalSlides = parsed.slides.length;

        if (totalSlides === 0) {
          setProgress({
            ...INITIAL_PROGRESS,
            phase: 'error',
            error: 'PPTX içinde hiç slayt bulunamadı.',
          });
          setIsImporting(false);
          return;
        }

        setProgress({
          phase: 'rendering',
          totalSlides,
          renderedSlides: 0,
          skippedElements: [],
        });

        // Her slaydı render et — paralel batch
        const blobs: Array<{ index: number; blob: Blob }> = new Array(totalSlides);
        const allSkipped: SkippedElement[] = [];
        const queue = parsed.slides.map((slide, index) => ({ slide, index }));

        const workers = Array.from({ length: RENDER_CONCURRENCY }, async () => {
          while (queue.length > 0) {
            const item = queue.shift();
            if (!item) break;
            try {
              const result = await renderSlideToBlob(item.slide, item.index, parsed, {
                width: RENDER_WIDTH,
                height: RENDER_HEIGHT,
              });
              blobs[item.index] = { index: item.index, blob: result.blob };
              allSkipped.push(...result.skipped);
              setProgress((prev) => ({
                ...prev,
                renderedSlides: prev.renderedSlides + 1,
                skippedElements: [...prev.skippedElements, ...result.skipped],
              }));
            } catch (err) {
              console.error('[PPTX] Slayt render hatası', item.index, err);
              allSkipped.push({
                slideIndex: item.index,
                type: 'shape',
                reason: `Slayt ${item.index + 1} render edilemedi`,
              });
            }
          }
        });

        await Promise.all(workers);

        // Blob'ları File'a çevir ve mevcut upload akışına gönder
        const baseName = file.name.replace(/\.pptx$/i, '');
        const files: File[] = blobs
          .filter(Boolean)
          .map(({ index, blob }) =>
            new File([blob], `${baseName}-slide-${index + 1}.png`, { type: 'image/png' }),
          );

        setProgress((prev) => ({ ...prev, phase: 'uploading' }));
        await uploadFiles(files);

        setProgress((prev) => ({
          ...prev,
          phase: 'done',
          skippedElements: allSkipped,
        }));
      } catch (err) {
        console.error('[PPTX] Import hatası', err);
        setProgress({
          ...INITIAL_PROGRESS,
          phase: 'error',
          error: err instanceof Error ? err.message : 'PPTX import hatası',
        });
      } finally {
        setIsImporting(false);
      }
    },
    [uploadFiles],
  );

  return { importPptx, progress, isImporting, reset };
}
