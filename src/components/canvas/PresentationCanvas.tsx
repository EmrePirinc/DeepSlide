'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import React, { useCallback, useRef, useState } from 'react';
import { ImageCard } from './ImageCard';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { PresentationImage } from '@/types/presentation';

interface PresentationCanvasProps {
  images: PresentationImage[];
  columnCount: 3 | 4 | 5;
  activeImageIds?: Set<string>;
  showKeywords?: boolean;
  onImageClick?: (image: PresentationImage) => void;
  onReorder?: (imageIds: string[]) => void;
  onUploadFiles?: (files: File[]) => void;
}

export function PresentationCanvas({
  images,
  columnCount,
  activeImageIds,
  showKeywords = true,
  onImageClick,
  onReorder,
  onUploadFiles,
}: PresentationCanvasProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onUploadFiles) {
      onUploadFiles(Array.from(files));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [onUploadFiles]);

  // File drop on empty area
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0 && onUploadFiles) {
      onUploadFiles(files);
    }
  }, [onUploadFiles]);

  if (images.length === 0) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={handleFileSelect}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="w-full flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-2xl text-on-surface-variant hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
        >
          <MaterialIcon icon="add_photo_alternate" size={48} className="mb-3 opacity-40 group-hover:opacity-70 group-hover:text-primary transition-all" />
          <p className="text-sm font-semibold group-hover:text-white transition-colors">Görsel yüklemek için tıklayın</p>
          <p className="text-xs mt-1 opacity-60">veya sürükle-bırak ile yükleyin · JPG, PNG, WebP</p>
        </button>
      </>
    );
  }

  return (
    <div
      className="grid gap-10 pb-20"
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
            transition-all duration-300
            ${dragOverIndex === index ? 'scale-105 ring-2 ring-primary rounded-2xl' : ''}
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
