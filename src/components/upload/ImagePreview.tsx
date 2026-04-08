'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import type { PresentationImage } from '@/types/presentation';

interface ImagePreviewProps {
  images: PresentationImage[];
  columnCount?: number;
}

export function ImagePreview({ images, columnCount = 4 }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {images.map((image) => (
        <div
          key={image.id}
          className="relative aspect-square rounded-md overflow-hidden bg-muted"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.thumbnailDataUrl}
            alt={image.fileName}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
            <p className="text-[10px] text-white truncate">{image.fileName}</p>
          </div>
          {image.analysisStatus === 'analyzing' && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {image.analysisStatus === 'completed' && image.keywords.length > 0 && (
            <div className="absolute top-1 right-1 bg-green-500 text-white text-[9px] rounded px-1">
              {image.keywords.length}
            </div>
          )}
          {image.analysisStatus === 'failed' && (
            <div className="absolute top-1 right-1 bg-destructive text-white text-[9px] rounded px-1">
              !
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
