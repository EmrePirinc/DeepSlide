'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * usePptxImport — Sunucu tabanlı PPTX içe aktarma.
 *
 * Akış:
 *   1. File → Vercel /api/pptx/convert (multipart)
 *   2. Sunucu ConvertAPI'ye proxy → PNG URL listesi
 *   3. İstemci her PNG'yi indirir → IndexedDB blob + thumbnail
 *   4. PresentationImage[] store'a eklenir
 */

import { useCallback, useState } from 'react';
import type { PresentationImage } from '@/types/presentation';
import type { PptxImportProgress, PptxConvertResponse } from '@/lib/pptx/types';
import { usePresentationStore } from '@/stores/presentationStore';
import { saveImageBlob } from '@/lib/db/images';
import {
  resizeImage,
  blobToDataURL,
  THUMBNAIL_WIDTH,
} from '@/lib/utils/imageProcessing';

const MAX_FILE_MB = 50;

const INITIAL: PptxImportProgress = {
  phase: 'idle',
  totalSlides: 0,
  processedSlides: 0,
};

interface UsePptxImportReturn {
  importPptx: (file: File) => Promise<void>;
  progress: PptxImportProgress;
  isImporting: boolean;
  reset: () => void;
}

export function usePptxImport(): UsePptxImportReturn {
  const { currentPresentation, addImages } = usePresentationStore();
  const [progress, setProgress] = useState<PptxImportProgress>(INITIAL);
  const [isImporting, setIsImporting] = useState(false);

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
      setProgress({ ...INITIAL, phase: 'uploading' });

      try {
        // 1) Multipart upload → Vercel API
        const formData = new FormData();
        formData.append('file', file);

        setProgress((prev) => ({ ...prev, phase: 'converting' }));
        const res = await fetch('/api/pptx/convert', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }

        const data = (await res.json()) as PptxConvertResponse;
        const totalSlides = data.files.length;

        setProgress((prev) => ({
          ...prev,
          phase: 'downloading',
          totalSlides,
        }));

        // 2) Her PNG'yi indir + IndexedDB blob + thumbnail + PresentationImage
        const newImages: PresentationImage[] = [];
        const slideOrderBase = currentPresentation.images.length;

        for (let i = 0; i < data.files.length; i++) {
          const fileInfo = data.files[i];
          try {
            const pngRes = await fetch(fileInfo.url);
            if (!pngRes.ok) throw new Error(`PNG indirilemedi (${pngRes.status})`);
            const pngBlob = await pngRes.blob();

            const id = crypto.randomUUID();
            const blobKey = `${currentPresentation.id}_${id}`;
            await saveImageBlob(blobKey, currentPresentation.id, pngBlob);

            // Thumbnail
            const pngFile = new File([pngBlob], fileInfo.fileName, { type: 'image/png' });
            const thumbBlob = await resizeImage(pngFile, THUMBNAIL_WIDTH, 0.7);
            const thumbnailDataUrl = await blobToDataURL(thumbBlob);

            // Boyutları al
            const bitmap = await createImageBitmap(pngBlob);
            const width = bitmap.width;
            const height = bitmap.height;
            bitmap.close();

            newImages.push({
              id,
              presentationId: currentPresentation.id,
              fileName: `${file.name.replace(/\.(pptx|ppt)$/i, '')}-slide-${i + 1}.png`,
              mimeType: 'image/png',
              blobKey,
              thumbnailDataUrl,
              width,
              height,
              order: slideOrderBase + i,
              keywords: [],
              analysisStatus: 'pending',
              createdAt: Date.now(),
              source: 'pptx',
            });

            setProgress((prev) => ({ ...prev, processedSlides: i + 1 }));
          } catch (err) {
            console.error('[PPTX] Slayt indirme hatası', i, err);
          }
        }

        if (newImages.length === 0) {
          throw new Error('Hiç slayt oluşturulamadı');
        }

        setProgress((prev) => ({ ...prev, phase: 'saving' }));
        await addImages(newImages);

        setProgress((prev) => ({
          ...prev,
          phase: 'done',
          totalSlides,
          processedSlides: newImages.length,
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
    [currentPresentation, addImages],
  );

  return { importPptx, progress, isImporting, reset };
}
