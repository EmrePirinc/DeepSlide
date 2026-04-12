'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { motion, AnimatePresence } from 'motion/react';
import { useFullImage } from '@/hooks/useFullImage';
import { SlideInfoOverlay } from './SlideInfoOverlay';
import { SlideIndicator } from './SlideIndicator';
import { getTransition } from '@/lib/animation/transitions/factory';
import type { PresentationImage, TransitionType } from '@/types/presentation';
import type { PresentationTheme } from '@/lib/themes/types';

interface FocusedSlideProps {
  image: PresentationImage;
  allImages: PresentationImage[];
  transitionType: TransitionType;
  theme: PresentationTheme;
  matchedKeyword?: string;
  onImageClick?: (id: string) => void;
}

export function FocusedSlide({
  image,
  allImages,
  transitionType,
  theme,
  matchedKeyword,
  onImageClick,
}: FocusedSlideProps) {
  const fullImageUrl = useFullImage(image.blobKey);
  const imageSrc = fullImageUrl ?? image.thumbnailDataUrl;
  const transition = getTransition(transitionType);
  const currentIndex = allImages.findIndex((img) => img.id === image.id);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ backgroundColor: theme.bg }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={image.id}
          layoutId={`slide-${image.id}`}
          className="relative w-full h-full flex items-center justify-center"
          variants={transition.enter}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <div className="relative inline-flex items-center justify-center" style={{ maxHeight: '85vh' }}>
            <img
              src={imageSrc}
              alt={image.fileName}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: '85vh' }}
            />
            {/* Text Overlays — Faz 3 */}
            {(image.textOverlays ?? []).map((overlay) => (
              <span
                key={overlay.id}
                className="absolute pointer-events-none select-none"
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  fontSize: `${overlay.fontSize}px`,
                  color: overlay.color,
                  fontWeight: overlay.bold ? 700 : 400,
                  textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {overlay.text}
              </span>
            ))}
          </div>

          <SlideInfoOverlay
            image={image}
            currentIndex={currentIndex}
            totalImages={allImages.length}
            matchedKeyword={matchedKeyword}
            theme={theme}
          />
        </motion.div>
      </AnimatePresence>

      <SlideIndicator
        total={allImages.length}
        current={currentIndex}
        theme={theme}
        onDotClick={(index) => onImageClick?.(allImages[index].id)}
      />
    </div>
  );
}
