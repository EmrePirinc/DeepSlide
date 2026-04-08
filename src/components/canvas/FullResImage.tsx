'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useFullImage } from '@/hooks/useFullImage';

interface FullResImageProps {
  blobKey: string;
  thumbnailUrl: string;
  alt: string;
  className?: string;
}

/**
 * Orijinal çözünürlükte görsel gösterir.
 * IndexedDB'den blob yükler, yüklenene kadar thumbnail gösterir.
 */
export function FullResImage({
  blobKey,
  thumbnailUrl,
  alt,
  className = '',
}: FullResImageProps) {
  const fullUrl = useFullImage(blobKey);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fullUrl ?? thumbnailUrl}
      alt={alt}
      className={className}
      loading="eager"
    />
  );
}
