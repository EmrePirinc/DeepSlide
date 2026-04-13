'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PresentationImage } from '@/types/presentation';
import type { CanvasSlide } from '@/types/slide-object';
import type { PptxImportProgress, WorkerMessage, WorkerRequest, WorkerResult } from '@/lib/pptx/types';
import { usePresentationStore } from '@/stores/presentationStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { saveCanvasSlides } from '@/lib/db/canvas-objects';
import { saveImageBlob } from '@/lib/db/images';
import { renderCanvasSlideToBlob } from '@/lib/pptx/renderSlideToImage';
import { resizeImage, blobToDataURL, THUMBNAIL_WIDTH } from '@/lib/utils/imageProcessing';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const MAX_FILE_MB = 100;

const INITIAL: PptxImportProgress = {
  phase: 'idle',
  totalSlides: 0,
  processedSlides: 0,
  skipped: [],
};

interface UsePptxImportReturn {
  importPptx: (file: File) => Promise<void>;
  progress: PptxImportProgress;
  isImporting: boolean;
  reset: () => void;
}

export function usePptxImport(): UsePptxImportReturn {
  const { currentPresentation, addImages } = usePresentationStore();
  const { loadSlides } = useCanvasStore();
  const [progress, setProgress] = useState<PptxImportProgress>(INITIAL);
  const [isImporting, setIsImporting] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const reset = useCallback(() => setProgress(INITIAL), []);

  const importPptx = useCallback(
    async (file: File) => {
      if (!currentPresentation) {
        setProgress({ ...INITIAL, phase: 'error', error: 'Aktif sunum yok' });
        return;
      }
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_FILE_MB) {
        setProgress({
          ...INITIAL,
          phase: 'error',
          error: `Dosya çok büyük (${sizeMB.toFixed(1)}MB). Maksimum ${MAX_FILE_MB}MB.`,
        });
        return;
      }

      setIsImporting(true);
      setProgress({ ...INITIAL, phase: 'parsing' });

      try {
        const buffer = await file.arrayBuffer();
        const result = await runWorker(
          {
            buffer,
            presentationId: currentPresentation.id,
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
          },
          workerRef,
          (phase, total, processed) => {
            setProgress((prev) => ({ ...prev, phase, totalSlides: total, processedSlides: processed }));
          },
        );

        // Worker resimlerinin blob'larını IndexedDB'ye yaz
        setProgress((prev) => ({ ...prev, phase: 'saving', skipped: result.skipped }));

        const imageMap = new Map<string, string>();
        for (const img of result.images) {
          imageMap.set(img.blobKey, img.dataUrl);
          try {
            const blob = await dataUrlToBlob(img.dataUrl);
            await saveImageBlob(img.blobKey, currentPresentation.id, blob);
          } catch (err) {
            console.error('[PPTX] Image blob kayıt hatası', err);
          }
        }

        // Her CanvasSlide için thumbnail + full render üret, PresentationImage oluştur
        setProgress((prev) => ({ ...prev, phase: 'rendering' }));
        const newImages: PresentationImage[] = [];
        const slideOrderBase = currentPresentation.images.length;

        for (let i = 0; i < result.slides.length; i++) {
          const slide = result.slides[i];
          // Slayt ID'si = image ID (canvas-objects.ts sync pattern)
          const imageId = slide.id;

          try {
            // Full-res PNG (1920x1080)
            const fullBlob = await renderCanvasSlideToBlob(slide, {
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              imageMap,
            });
            const fullFile = new File([fullBlob], `slide-${i + 1}.png`, { type: 'image/png' });
            const blobKey = `${currentPresentation.id}_${imageId}`;
            await saveImageBlob(blobKey, currentPresentation.id, fullFile);

            // Thumbnail
            const thumbBlob = await resizeImage(fullFile, THUMBNAIL_WIDTH, 0.7);
            const thumbnailDataUrl = await blobToDataURL(thumbBlob);

            newImages.push({
              id: imageId,
              presentationId: currentPresentation.id,
              fileName: `${file.name.replace(/\.pptx$/i, '')}-slide-${i + 1}.png`,
              mimeType: 'image/png',
              blobKey,
              thumbnailDataUrl,
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              order: slideOrderBase + i,
              keywords: [],
              analysisStatus: 'pending',
              createdAt: Date.now(),
              source: 'pptx',
            });

            setProgress((prev) => ({ ...prev, processedSlides: i + 1 }));
          } catch (err) {
            console.error('[PPTX] Slayt render hatası', i, err);
          }
        }

        // Slayt ID'lerini PresentationImage ID'leriyle senkronize et
        const finalSlides: CanvasSlide[] = result.slides.map((s, i) => ({
          ...s,
          id: newImages[i]?.id ?? s.id,
          order: slideOrderBase + i,
        }));

        // IndexedDB + stores
        await saveCanvasSlides(finalSlides);
        if (newImages.length > 0) {
          await addImages(newImages);
        }
        loadSlides(currentPresentation.id, finalSlides);

        setProgress((prev) => ({
          ...prev,
          phase: 'done',
          totalSlides: finalSlides.length,
          processedSlides: finalSlides.length,
          skipped: result.skipped,
        }));
      } catch (err) {
        console.error('[PPTX] Import hatası', err);
        setProgress({
          ...INITIAL,
          phase: 'error',
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setIsImporting(false);
      }
    },
    [currentPresentation, addImages, loadSlides],
  );

  return { importPptx, progress, isImporting, reset };
}

// ═══════════════════════════════════════════════════════════════════════════
// Helpers

function runWorker(
  req: WorkerRequest,
  ref: React.MutableRefObject<Worker | null>,
  onProgress: (phase: PptxImportProgress['phase'], total: number, processed: number) => void,
): Promise<WorkerResult> {
  return new Promise((resolve, reject) => {
    // Next.js / Turbopack Worker bundling: new Worker(new URL(...), { type: 'module' })
    const worker = new Worker(
      new URL('../workers/pptxWorker.ts', import.meta.url),
      { type: 'module' },
    );
    ref.current = worker;

    worker.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
      const msg = e.data;
      if (msg.kind === 'progress') {
        onProgress(msg.phase, msg.totalSlides, msg.processedSlides);
      } else if (msg.kind === 'result') {
        worker.terminate();
        ref.current = null;
        resolve(msg.result);
      } else if (msg.kind === 'error') {
        worker.terminate();
        ref.current = null;
        reject(new Error(msg.message));
      }
    });

    worker.addEventListener('error', (err) => {
      worker.terminate();
      ref.current = null;
      reject(err.error ?? new Error('Worker hata'));
    });

    worker.postMessage(req, [req.buffer]);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
