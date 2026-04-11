// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { Variants } from 'motion/react';

export type TransitionType =
  | 'zoom'
  | 'fade'
  | 'pan'
  | 'fadeBlack'
  | 'slideRight'
  | 'slideLeft'
  | 'flip'
  | 'cube'
  | 'gallery'
  | 'none';

export type TransitionSpeed = 'slow' | 'medium' | 'fast';

export interface TransitionProvider {
  name: string;
  type: TransitionType;
  enter: Variants;
  exit: Variants;
}

export const SPEED_DURATIONS: Record<TransitionSpeed, number> = {
  slow: 1.5,
  medium: 1.0,
  fast: 0.5,
};
