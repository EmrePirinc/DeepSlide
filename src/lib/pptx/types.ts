// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { CanvasSlide } from '@/types/slide-object';

export type ImportPhase =
  | 'idle'
  | 'parsing'
  | 'mapping'
  | 'rendering'
  | 'saving'
  | 'done'
  | 'error';

export interface PptxImportProgress {
  phase: ImportPhase;
  totalSlides: number;
  processedSlides: number;
  skipped: SkippedElement[];
  error?: string;
}

export interface SkippedElement {
  slideIndex: number;
  kind: string;
  reason: string;
}

/** Worker'dan main thread'e aktarılan ham blob (base64 data URL) */
export interface MappedImageBlob {
  blobKey: string;
  dataUrl: string;
  mimeType: string;
}

/** Worker → main sonuç */
export interface WorkerResult {
  slides: CanvasSlide[];
  images: MappedImageBlob[];
  skipped: SkippedElement[];
  sourceSize: { width: number; height: number };
}

/** Main → Worker istek */
export interface WorkerRequest {
  buffer: ArrayBuffer;
  presentationId: string;
  canvasWidth: number;
  canvasHeight: number;
}

/** Worker → Main mesaj */
export type WorkerMessage =
  | { kind: 'progress'; phase: ImportPhase; totalSlides: number; processedSlides: number }
  | { kind: 'result'; result: WorkerResult }
  | { kind: 'error'; message: string };
