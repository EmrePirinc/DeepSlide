'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * usePptxImport — CloudConvert tabanlı PPTX içe aktarma.
 *
 * Akış:
 *   1. POST /api/pptx/convert {action:'create'} → jobId + uploadForm
 *   2. Client direkt CloudConvert'e multipart POST (Vercel 4.5MB bypass)
 *   3. POST /api/pptx/convert {action:'wait', jobId} → PNG URL listesi
 *   4. Her PNG indirilir → IndexedDB + PresentationImage
 */

import { useCallback, useState } from 'react';
import type { PresentationImage } from '@/types/presentation';
import type { PptxImportProgress } from '@/lib/pptx/types';
import { usePresentationStore } from '@/stores/presentationStore';
import { saveImageBlob } from '@/lib/db/images';
import {
  resizeImage,
  blobToDataURL,
  THUMBNAIL_WIDTH,
} from '@/lib/utils/imageProcessing';

const MAX_FILE_MB = 100;

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

interface UploadForm {
  url: string;
  parameters: Record<string, string>;
}

interface CreateResponse {
  jobId: string;
  uploadForm: UploadForm;
}

interface WaitResponse {
  files: Array<{ url: string; fileName: string; fileSize: number }>;
  slideCount: number;
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
          error: `Dosya çok büyük (${sizeMB.toFixed(1)}MB). Maks ${MAX_FILE_MB}MB.`,
        });
        return;
      }

      setIsImporting(true);
      setProgress({ ...INITIAL, phase: 'uploading' });

      try {
        // 1) Job oluştur — upload form al
        const createRes = await fetch('/api/pptx/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            fileName: file.name,
            fileSize: file.size,
          }),
        });
        if (!createRes.ok) {
          const body = await createRes.json().catch(() => ({ error: createRes.statusText }));
          throw new Error(body.error ?? `HTTP ${createRes.status}`);
        }
        const createData = (await createRes.json()) as CreateResponse;

        // 2) Direkt CloudConvert'e upload — Vercel body limit'i bypass
        const uploadFormData = new FormData();
        for (const [key, value] of Object.entries(createData.uploadForm.parameters)) {
          uploadFormData.append(key, value);
        }
        uploadFormData.append('file', file);

        const uploadRes = await fetch(createData.uploadForm.url, {
          method: 'POST',
          body: uploadFormData,
        });
        if (!uploadRes.ok) {
          throw new Error(`CloudConvert upload başarısız: ${uploadRes.status}`);
        }

        // 3) Conversion sonucunu bekle
        setProgress((prev) => ({ ...prev, phase: 'converting' }));
        const waitRes = await fetch('/api/pptx/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'wait', jobId: createData.jobId }),
        });
        if (!waitRes.ok) {
          const body = await waitRes.json().catch(() => ({ error: waitRes.statusText }));
          throw new Error(body.error ?? `HTTP ${waitRes.status}`);
        }
        const waitData = (await waitRes.json()) as WaitResponse;
        const totalSlides = waitData.files.length;

        // 4) PNG'leri indir + PresentationImage oluştur
        setProgress((prev) => ({
          ...prev,
          phase: 'downloading',
          totalSlides,
        }));

        const newImages: PresentationImage[] = [];
        const slideOrderBase = currentPresentation.images.length;

        for (let i = 0; i < waitData.files.length; i++) {
          const fileInfo = waitData.files[i];
          try {
            const pngRes = await fetch(fileInfo.url);
            if (!pngRes.ok) throw new Error(`PNG indirilemedi (${pngRes.status})`);
            const pngBlob = await pngRes.blob();

            const id = crypto.randomUUID();
            const blobKey = `${currentPresentation.id}_${id}`;
            await saveImageBlob(blobKey, currentPresentation.id, pngBlob);

            const pngFile = new File([pngBlob], fileInfo.fileName, { type: 'image/png' });
            const thumbBlob = await resizeImage(pngFile, THUMBNAIL_WIDTH, 0.7);
            const thumbnailDataUrl = await blobToDataURL(thumbBlob);

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
