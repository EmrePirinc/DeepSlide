// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { PresentationImage } from '@/types/presentation';
import type { MatchResult } from './types';
import { similarity } from '@/lib/utils/levenshtein';

/**
 * Anahtar kelime eşleştirme motoru.
 * Inverted index + fuzzy matching (Levenshtein).
 */
export class KeywordMatcher {
  // keyword veya synonym → imageId[]
  private index = new Map<string, Set<string>>();

  /**
   * Görsellerin keyword'lerinden inverted index oluşturur.
   */
  buildIndex(images: PresentationImage[]): void {
    this.index.clear();

    for (const image of images) {
      for (const kw of image.keywords) {
        const terms = [
          kw.text.toLowerCase(),
          ...kw.synonyms.map((s) => s.toLowerCase()),
        ];

        for (const term of terms) {
          if (!this.index.has(term)) {
            this.index.set(term, new Set());
          }
          this.index.get(term)!.add(image.id);
        }
      }
    }
  }

  /**
   * Söylenen kelimeleri index'teki keyword'lerle eşleştirir.
   * Önce exact match, sonra fuzzy match.
   */
  match(spokenWords: string[], threshold: number = 0.7): MatchResult[] {
    const results: MatchResult[] = [];
    const seen = new Set<string>(); // Aynı keyword için tekrar ekleme

    for (const word of spokenWords) {
      const normalized = word.toLowerCase().trim();
      if (normalized.length < 2) continue; // Çok kısa kelimeleri atla

      // 1. Exact match
      if (this.index.has(normalized)) {
        if (!seen.has(normalized)) {
          seen.add(normalized);
          results.push({
            keyword: normalized,
            imageIds: Array.from(this.index.get(normalized)!),
            score: 1.0,
          });
        }
        continue;
      }

      // 2. Fuzzy match
      for (const [keyword, imageIds] of this.index) {
        if (seen.has(keyword)) continue;

        const score = similarity(normalized, keyword);
        if (score >= threshold) {
          seen.add(keyword);
          results.push({
            keyword,
            imageIds: Array.from(imageIds),
            score,
          });
        }
      }
    }

    // Skora göre sırala (yüksekten düşüğe)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Index'teki toplam keyword sayısını döndürür.
   */
  get size(): number {
    return this.index.size;
  }
}
