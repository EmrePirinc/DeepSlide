// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export type ImportPhase =
  | 'idle'
  | 'uploading'
  | 'converting'
  | 'downloading'
  | 'saving'
  | 'done'
  | 'error';

export interface PptxImportProgress {
  phase: ImportPhase;
  totalSlides: number;
  processedSlides: number;
  error?: string;
}

/** Sunucunun döndürdüğü conversion sonucu */
export interface PptxConvertResponse {
  files: Array<{
    url: string;
    fileName: string;
    fileSize: number;
  }>;
  slideCount: number;
  cost: number;
}
