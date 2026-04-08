// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { KeywordCategory } from './presentation';

export interface AnalysisResult {
  keywords: AnalyzedKeyword[];
  description: string;
}

export interface AnalyzedKeyword {
  text: string;
  confidence: number;
  category: KeywordCategory;
}

export interface ImageAnalysisProvider {
  name: string;
  analyzeImage(imageBase64: string, mimeType: string): Promise<AnalysisResult>;
}

export interface AnalysisProgress {
  total: number;
  completed: number;
  failed: number;
  currentImageId: string | null;
}
