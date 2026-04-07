import type { KeywordCategory } from '@/types/presentation';

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
