// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Virtuoso } from 'react-virtuoso';
import type { PresentationImage } from '@/types/presentation';

interface SlideThumbnailPanelProps {
  images: PresentationImage[];
  activeSlideId: string | null;
  onSlideSelect: (id: string) => void;
}

export function SlideThumbnailPanel({
  images,
  activeSlideId,
  onSlideSelect,
}: SlideThumbnailPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'ArrowDown' && index < images.length - 1) {
        e.preventDefault();
        onSlideSelect(images[index + 1].id);
      } else if (e.key === 'ArrowUp' && index > 0) {
        e.preventDefault();
        onSlideSelect(images[index - 1].id);
      }
    },
    [images, onSlideSelect],
  );

  const renderItem = useCallback(
    (index: number) => {
      const img = images[index];
      if (!img) return null;
      const isActive = img.id === activeSlideId;

      return (
        <motion.button
          layout
          onClick={() => onSlideSelect(img.id)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          tabIndex={0}
          aria-label={`Slayt ${index + 1}`}
          className={`relative w-full rounded-xl overflow-hidden transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 ring-primary group ${
            isActive ? 'slide-thumb-active ring-4 ring-primary/30 z-10' : 'hover:ring-2 hover:ring-white/20'
          }`}
        >
          <div className="aspect-video relative">
            {img.thumbnailDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.thumbnailDataUrl}
                  alt={`Slayt ${index + 1}`}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'
                  }`}
                />
                <div className={`absolute inset-0 transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-t from-primary/60 via-transparent to-transparent'
                    : 'bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60'
                }`} />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-variant">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-2xl">image</span>
              </div>
            )}

            {/* Slide number badge */}
            <span className={`absolute bottom-3 left-3 text-[10px] font-black px-2.5 rounded-md ${
              isActive
                ? 'bg-primary text-white py-1 shadow-lg'
                : 'bg-black/60 text-white/70 backdrop-blur-md py-0.5 border border-white/10'
            }`}>
              {index + 1}
            </span>
          </div>
        </motion.button>
      );
    },
    [images, activeSlideId, onSlideSelect, handleKeyDown],
  );

  if (images.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="w-64 bg-surface/20 border-r border-white/5 flex flex-col overflow-hidden shrink-0 z-20"
      aria-label="Slayt listesi"
    >
      <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1">
        {/* Header */}
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-black tracking-[0.2em] text-on-surface-variant uppercase">
            SLAYTLAR
          </span>
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] text-primary font-black">
            {images.findIndex(img => img.id === activeSlideId) + 1 || '—'} / {images.length}
          </span>
        </div>

        {/* Thumbnails */}
        {images.length > 50 ? (
          <Virtuoso
            style={{ flex: 1 }}
            totalCount={images.length}
            itemContent={renderItem}
          />
        ) : (
          <div className="space-y-6">
            {images.map((_, index) => (
              <div key={images[index].id}>{renderItem(index)}</div>
            ))}
          </div>
        )}

        {/* Add Slide Button */}
        <button className="mt-4 w-full py-8 border-2 border-dashed border-white/5 rounded-2xl text-on-surface-variant flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 hover:text-white transition-all group">
          <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">add_circle</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Slayt Ekle</span>
        </button>
      </div>
    </div>
  );
}
