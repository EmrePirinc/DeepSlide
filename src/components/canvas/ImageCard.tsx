'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import React from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { KeywordBadge } from '@/components/keywords/KeywordBadge';
import type { PresentationImage } from '@/types/presentation';

interface ImageCardProps {
  image: PresentationImage;
  showKeywords?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

export const ImageCard = React.memo(function ImageCard({
  image,
  showKeywords = true,
  isActive = false,
  onClick,
}: ImageCardProps) {
  return (
    <div
      className={`
        glass-card rounded-[2rem] overflow-hidden cursor-pointer
        border transition-all duration-500 group
        premium-shadow
        hover:-translate-y-3
        ${isActive
          ? 'border-primary/30 slide-thumb-active'
          : 'border-white/5 hover:border-primary/40'}
      `}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.thumbnailDataUrl}
          alt={image.fileName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Status badge — top right */}
        {image.analysisStatus === 'analyzing' && image.keywords.length === 0 && (
          <div className="absolute top-5 right-5 p-2.5 bg-black/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
            <MaterialIcon icon="hourglass_empty" size={18} className="text-amber-400 animate-pulse" />
          </div>
        )}

        {image.analysisStatus === 'failed' && (
          <div className="absolute top-5 right-5 p-2.5 bg-black/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
            <MaterialIcon icon="error" size={18} className="text-rose-400" />
          </div>
        )}

        {image.analysisStatus === 'completed' && image.keywords.length > 0 && (
          <div className="absolute top-5 right-5 p-2.5 bg-black/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
            <MaterialIcon icon="verified" size={18} className="text-emerald-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 space-y-5">
        {/* Keyword chips */}
        {showKeywords && image.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {image.keywords.slice(0, 3).map((kw) => (
              <KeywordBadge key={kw.id} keyword={kw} />
            ))}
            {image.keywords.length > 3 && (
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold text-on-surface-variant bg-white/5 uppercase tracking-widest">
                +{image.keywords.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <p className="text-[15px] text-on-surface-variant leading-relaxed font-medium line-clamp-2">
          {image.fileName}
        </p>
      </div>
    </div>
  );
});
