'use client';

import React from 'react';
import { motion } from 'motion/react';
import { KeywordBadge } from '@/components/keywords/KeywordBadge';
import { createImageCardVariants } from '@/lib/animation/variants';
import { useFullImage } from '@/hooks/useFullImage';
import type { PresentationImage } from '@/types/presentation';

interface ImageCardAnimatedProps {
  image: PresentationImage;
  isActive: boolean;
  isPresenting: boolean;
  isSpotlight?: boolean;
  showKeywords?: boolean;
  zoomScale?: number;
  matchedKeywords?: Set<string>;
  onClick?: () => void;
}

export const ImageCardAnimated = React.memo(function ImageCardAnimated({
  image,
  isActive,
  isPresenting,
  isSpotlight = false,
  showKeywords = false,
  zoomScale = 1.8,
  matchedKeywords,
  onClick,
}: ImageCardAnimatedProps) {
  const variants = createImageCardVariants(zoomScale);

  // Aktif olduğunda orijinal görseli yükle (bulanıklığı önle)
  const fullImageUrl = useFullImage(isActive ? image.blobKey : null);
  const imageSrc = fullImageUrl ?? image.thumbnailDataUrl;

  const animateState = isActive
    ? 'active'
    : isSpotlight
      ? 'spotlight'
      : isPresenting
        ? 'inactive'
        : 'default';

  return (
    <motion.div
      layout
      variants={variants}
      animate={animateState}
      className="relative rounded-lg overflow-hidden cursor-pointer"
      style={{ originX: 0.5, originY: 0.5 }}
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={image.fileName}
        className="w-full aspect-square object-cover"
        loading="lazy"
      />

      {showKeywords && image.keywords.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
          <div className="flex flex-wrap gap-0.5">
            {image.keywords.slice(0, 3).map((kw) => (
              <KeywordBadge
                key={kw.id}
                keyword={kw}
                isMatched={matchedKeywords?.has(kw.text)}
              />
            ))}
          </div>
        </div>
      )}

      {isActive && (
        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] rounded px-1.5 py-0.5 font-medium">
          Aktif
        </div>
      )}
    </motion.div>
  );
});
