'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { Button } from '@/components/ui/button';

interface CanvasControlsProps {
  columnCount: 3 | 4 | 5;
  onColumnCountChange: (count: 3 | 4 | 5) => void;
  onAutoArrange?: () => void;
  imageCount: number;
}

export function CanvasControls({
  columnCount,
  onColumnCountChange,
  onAutoArrange,
  imageCount,
}: CanvasControlsProps) {
  const columns = [3, 4, 5] as const;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground mr-1">Sütun:</span>
        {columns.map((col) => (
          <Button
            key={col}
            variant={columnCount === col ? 'default' : 'outline'}
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => onColumnCountChange(col)}
          >
            {col}
          </Button>
        ))}
      </div>

      {onAutoArrange && imageCount > 0 && (
        <Button variant="outline" size="sm" onClick={onAutoArrange}>
          Otomatik Düzenle
        </Button>
      )}

      <span className="text-xs text-muted-foreground ml-auto">
        {imageCount} görsel
      </span>
    </div>
  );
}
