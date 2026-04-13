// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { Slide, Element } from 'pptxtojson';

export interface ParsedPresentation {
  slides: Slide[];
  themeColors: string[];
  size: { width: number; height: number };
}

export interface RenderOptions {
  width: number;
  height: number;
  /** Turkish-safe font stack */
  fontFamily?: string;
}

export type ImportPhase = 'idle' | 'parsing' | 'rendering' | 'uploading' | 'done' | 'error';

export interface PptxImportProgress {
  phase: ImportPhase;
  totalSlides: number;
  renderedSlides: number;
  skippedElements: SkippedElement[];
  error?: string;
}

export interface SkippedElement {
  slideIndex: number;
  type: Element['type'];
  reason: string;
}
