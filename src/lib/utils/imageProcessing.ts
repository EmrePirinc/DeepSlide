// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Görseli belirtilen genişliğe küçültür.
 * Canvas API kullanarak istemci tarafında çalışır.
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  quality: number = 0.8
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(maxWidth / bitmap.width, 1);
  const width = Math.round(bitmap.width * ratio);
  const height = Math.round(bitmap.height * ratio);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality,
  });
  return blob;
}

/**
 * Blob'u base64 string'e çevirir (data URL prefix'siz).
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // "data:image/jpeg;base64," prefix'ini kaldır
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Blob'u dataURL'e çevirir (thumbnail için, prefix dahil).
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Görselin boyutlarını (width, height) döndürür.
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  return { width, height };
}

/**
 * Desteklenen dosya formatı mı kontrol eder.
 */
export function isValidImageType(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return validTypes.includes(file.type);
}

/**
 * Dosya boyutu sınırını kontrol eder (20MB).
 */
export function isValidFileSize(file: File, maxSizeMB: number = 20): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

export const THUMBNAIL_WIDTH = 200;
export const ANALYSIS_WIDTH = 1024;
export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILES_FREE = 100;
export const MAX_FILES_TOTAL = 500;
