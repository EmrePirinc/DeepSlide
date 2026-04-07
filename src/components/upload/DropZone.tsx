'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesSelected, disabled }: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
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
          JPG, PNG, GIF, WebP — Maks 20MB/dosya — 500 dosyaya kadar
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          veya tıklayarak dosya seçin
        </p>
      </div>
    </Card>
  );
}
