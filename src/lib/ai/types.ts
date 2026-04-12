// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { KeywordCategory } from '@/types/presentation';

export interface AnalysisResult {
  keywords: AnalyzedKeyword[];
  description: string;
}

export interface AnalyzedKeyword {
  text: string;
  confidence: number;
  category: KeywordCategory;
  /**
   * Eş anlamlı alternatifler (Gemini prompt ile iste).
   * Örnek: "patika" → ["yürüyüş yolu", "keçi yolu"]
   */
  synonyms?: string[];
  /**
   * Türkçe ek varyasyonları — kullanıcının söyleyebileceği formlar.
   * Örnek: "yol" → ["yolu", "yolda", "yoluna", "yollar", "yolları"]
   */
  forms?: string[];
  /**
   * 0-1, başka benzer sesli Türkçe kelimeyle karışma olasılığı.
   * Match threshold dinamik olarak bu değere göre yükseltilir.
   * Yüksek örnekler: "sis" (siz), "bal" (bel), "kar" (kır) → ~0.85
   * Düşük: "yürüyüş yolu", "bulut"                         → ~0.2
   */
  confusability?: number;
  /**
   * Negative keyword list. Söylenen bu kelimeler eşleşmeyi bozar.
   * Ör: "sis" için ["siz", "his", "sus"]. Gemini'nin bu listeyi üretmesi beklenir.
   */
  negatives?: string[];
}

export interface ImageAnalysisProvider {
  name: string;
  analyzeImage(imageBase64: string, mimeType: string): Promise<AnalysisResult>;
}
