// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { Variants } from 'motion/react';

export type TransitionType = 'zoom' | 'fade' | 'pan';

export interface TransitionProvider {
  name: string;
  type: TransitionType;
  enter: Variants;
  exit: Variants;
}
