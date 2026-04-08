// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { Variants } from 'motion/react';

export function createImageCardVariants(zoomScale: number = 1.8): Variants {
  return {
    inactive: {
      scale: 1,
      zIndex: 1,
      filter: 'brightness(0.7)',
      transition: { type: 'spring', stiffness: 200, damping: 25 },
    },
    active: {
      scale: zoomScale,
      zIndex: 10,
      filter: 'brightness(1)',
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    default: {
      scale: 1,
      zIndex: 1,
      filter: 'brightness(1)',
      transition: { type: 'spring', stiffness: 200, damping: 25 },
    },
    spotlight: {
      scale: 1.15,
      zIndex: 5,
      filter: 'brightness(1)',
      boxShadow: '0 0 20px 5px rgba(59, 130, 246, 0.5)',
      transition: { type: 'spring', stiffness: 250, damping: 25 },
    },
  };
}
