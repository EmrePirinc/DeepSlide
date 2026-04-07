import type { Variants } from 'motion/react';

export type TransitionType = 'zoom' | 'fade' | 'pan';

export interface TransitionProvider {
  name: string;
  type: TransitionType;
  enter: Variants;
  exit: Variants;
}
