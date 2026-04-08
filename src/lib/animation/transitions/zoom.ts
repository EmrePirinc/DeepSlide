// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { TransitionProvider } from './types';

export const zoomTransition: TransitionProvider = {
  name: 'Zoom',
  type: 'zoom',
  enter: {
    initial: { scale: 0.2, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 28, mass: 0.8 },
    },
    exit: {
      scale: 0.2,
      opacity: 0,
      transition: { duration: 0.25 },
    },
  },
  exit: {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: 0.2,
      opacity: 0,
      transition: { duration: 0.25 },
    },
    exit: { scale: 1, opacity: 1 },
  },
};
