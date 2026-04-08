'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useState, useCallback } from 'react';
import type { PresentationImage } from '@/types/presentation';
import { usePresentationStore } from '@/stores/presentationStore';
import { saveImageBlob } from '@/lib/db/images';
import {
  resizeImage,
  blobToDataURL,
  getImageDimensions,
  isValidImageType,
  isValidFileSize,
  THUMBNAIL_WIDTH,
  MAX_FILE_SIZE_MB,
} from '@/lib/utils/imageProcessing';
import { useAuth } from '@/hooks/useAuth';
import { canUploadImage } from '@/lib/billing/plans';

interface UploadProgress {
  total: number;
  completed: number;
  failed: number;
  errors: string[];
}

interface UseImageUploadReturn {
  uploadFiles: (files: File[]) => Promise<void>;
  progress: UploadProgress;
  isUploading: boolean;
}

export function useImageUpload(): UseImageUploadReturn {
  const { currentPresentation, addImages } = usePresentationStore();
  const { profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    errors: [],
  });

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!currentPresentation) return;

      const currentImageCount = currentPresentation.images.length;

      if (!canUploadImage(profile.plan, currentImageCount)) {
        setProgress({
          total: 0,
          completed: 0,
          failed: files.length,
          errors: [
            'Maksimum görsel sınırına ulaştınız (500). Bazı görselleri silip tekrar deneyin.',
          ],
        });
        return;
      }

      const maxUpload = profile.plan === 'pro' ? 500 : 500;
      const remainingSlots = maxUpload - currentImageCount;

      // Geçerli dosyaları filtrele
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        if (!isValidImageType(file)) {
          errors.push(`${file.name}: Desteklenmeyen format. (JPG, PNG, GIF, WebP)`);
          continue;
        }
        if (!isValidFileSize(file, MAX_FILE_SIZE_MB)) {
          errors.push(`${file.name}: Dosya boyutu ${MAX_FILE_SIZE_MB}MB'ı aşıyor.`);
          continue;
        }
        validFiles.push(file);
      }

      // Slot sınırı
      const filesToProcess = validFiles.slice(0, remainingSlots);
      if (filesToProcess.length < validFiles.length) {
        errors.push(
          `${validFiles.length - filesToProcess.length} dosya sınır nedeniyle atlandı.`
        );
      }

      setIsUploading(true);
      setProgress({
        total: filesToProcess.length,
        completed: 0,
        failed: errors.length,
        errors,
      });

      const newImages: PresentationImage[] = [];
      const CONCURRENCY = 5;
      let completedCount = 0;

      // Paralel işleme (5'erli)
      const processFile = async (file: File, index: number) => {
        try {
          const id = crypto.randomUUID();
          const blobKey = `${currentPresentation.id}_${id}`;

          // Boyutları al
          const dimensions = await getImageDimensions(file);

          // Thumbnail oluştur
          const thumbnailBlob = await resizeImage(file, THUMBNAIL_WIDTH, 0.7);
          const thumbnailDataUrl = await blobToDataURL(thumbnailBlob);

          // Orijinal blob'u kaydet
          await saveImageBlob(blobKey, currentPresentation.id, file);

          const image: PresentationImage = {
            id,
            presentationId: currentPresentation.id,
            fileName: file.name,
            mimeType: file.type,
            blobKey,
            thumbnailDataUrl,
            width: dimensions.width,
            height: dimensions.height,
            order: currentImageCount + index,
            keywords: [],
            analysisStatus: 'pending',
            createdAt: Date.now(),
          };

          newImages.push(image);
          completedCount++;
          setProgress((prev) => ({ ...prev, completed: completedCount }));
        } catch {
          completedCount++;
          setProgress((prev) => ({
            ...prev,
            completed: completedCount,
            failed: prev.failed + 1,
            errors: [
              ...prev.errors,
              `${file.name}: İşlenirken hata oluştu.`,
            ],
          }));
        }
      };

      // Concurrency-limited queue
      const queue = [...filesToProcess.entries()];
      const workers = Array.from({ length: CONCURRENCY }, async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          if (item) {
            const [index, file] = item;
            await processFile(file, index);
          }
        }
      });

      await Promise.all(workers);

      // Sıralı şekilde store'a ekle
      newImages.sort((a, b) => a.order - b.order);
      if (newImages.length > 0) {
        await addImages(newImages);
      }

      setIsUploading(false);
    },
    [currentPresentation, addImages, profile.plan]
  );

  return { uploadFiles, progress, isUploading };
}
