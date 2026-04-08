// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { TransitionProvider } from './types';

export const panTransition: TransitionProvider = {
  name: 'Pan',
  type: 'pan',
  enter: {
    initial: { x: '100%', opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30, mass: 0.8 },
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.25, ease: 'easeIn' },
    },
  },
  exit: {
    initial: { x: 0, opacity: 1 },
    animate: {
      x: '-100%',
      opacity: 0,
      transition: { duration: 0.25, ease: 'easeIn' },
    },
    exit: { x: 0, opacity: 1 },
  },
};
