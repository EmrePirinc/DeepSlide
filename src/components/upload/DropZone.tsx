'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  /** PPTX dosyası seçilirse tetiklenir. Yoksa PPTX accept listesinden çıkar. */
  onPptxSelected?: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesSelected, onPptxSelected, disabled }: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pptxFiles: File[] = [];
      const imageFiles: File[] = [];
      for (const f of acceptedFiles) {
        const name = f.name.toLowerCase();
        if (
          name.endsWith('.pptx') ||
          f.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ) {
          pptxFiles.push(f);
        } else {
          imageFiles.push(f);
        }
      }
      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
      if (pptxFiles.length > 0 && onPptxSelected) {
        onPptxSelected(pptxFiles[0]);
      }
    },
    [onFilesSelected, onPptxSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      ...(onPptxSelected
        ? { 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] }
        : {}),
    },
    maxFiles: 500,
    disabled,
  });

  return (
    <Card
      {...getRootProps()}
      className={`
        flex flex-col items-center justify-center p-12 border-2 border-dashed
        cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <div className="text-4xl mb-4">
          {isDragActive ? '📥' : '🖼️'}
        </div>
        <p className="text-lg font-medium mb-2">
          {isDragActive
            ? 'Görselleri buraya bırakın...'
            : 'Görselleri sürükle-bırak ile yükleyin'}
        </p>
        <p className="text-sm text-muted-foreground">
          JPG, PNG, GIF, WebP{onPptxSelected ? ', PPTX' : ''} — Maks 20MB/dosya — 500 dosyaya kadar
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          veya tıklayarak dosya seçin
        </p>
      </div>
    </Card>
  );
}
