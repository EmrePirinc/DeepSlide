'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import React, { useCallback, useRef, useState } from 'react';
import { ImageCard } from './ImageCard';
import type { PresentationImage } from '@/types/presentation';

interface PresentationCanvasProps {
  images: PresentationImage[];
  columnCount: 3 | 4 | 5;
  activeImageIds?: Set<string>;
  showKeywords?: boolean;
  onImageClick?: (image: PresentationImage) => void;
  onReorder?: (imageIds: string[]) => void;
}

export function PresentationCanvas({
  images,
  columnCount,
  activeImageIds,
  showKeywords = true,
  onImageClick,
  onReorder,
}: PresentationCanvasProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    dragItemRef.current = index;
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (dragItemRef.current !== null && dragItemRef.current !== index) {
        setDragOverIndex(index);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const dragIndex = dragItemRef.current;
      if (dragIndex === null || dragIndex === dropIndex || !onReorder) return;

      const newImages = [...images];
      const [dragged] = newImages.splice(dragIndex, 1);
      newImages.splice(dropIndex, 0, dragged);
      onReorder(newImages.map((img) => img.id));

      dragItemRef.current = null;
      setDragOverIndex(null);
    },
    [images, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    dragItemRef.current = null;
    setDragOverIndex(null);
  }, []);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg text-muted-foreground">
        Henüz görsel yok
      </div>
    );
  }

  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {images.map((image, index) => (
        <div
          key={image.id}
          draggable={!!onReorder}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            transition-transform
            ${dragOverIndex === index ? 'scale-105 ring-2 ring-primary' : ''}
          `}
        >
          <ImageCard
            image={image}
            showKeywords={showKeywords}
            isActive={activeImageIds?.has(image.id) ?? false}
            onClick={() => onImageClick?.(image)}
          />
        </div>
      ))}
    </div>
  );
}
