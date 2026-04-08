'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import React from 'react';
import { Card } from '@/components/ui/card';
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
    <Card
      className={`
        overflow-hidden cursor-pointer transition-all
        ${isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-primary/50'}
      `}
      onClick={onClick}
    >
      <div className="relative aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.thumbnailDataUrl}
          alt={image.fileName}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {image.analysisStatus === 'analyzing' && image.keywords.length === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {image.analysisStatus === 'failed' && (
          <div className="absolute top-1 right-1 bg-destructive text-white text-xs rounded px-1.5 py-0.5">
            Hata
          </div>
        )}

        {image.analysisStatus === 'completed' && image.keywords.length > 0 && (
          <div className="absolute top-1 right-1 bg-green-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
            {image.keywords.length}
          </div>
        )}
      </div>

      {showKeywords && image.keywords.length > 0 && (
        <div className="p-1.5 flex flex-wrap gap-0.5">
          {image.keywords.slice(0, 4).map((kw) => (
            <KeywordBadge key={kw.id} keyword={kw} />
          ))}
          {image.keywords.length > 4 && (
            <span className="text-[10px] text-muted-foreground self-center">
              +{image.keywords.length - 4}
            </span>
          )}
        </div>
      )}
    </Card>
  );
});
