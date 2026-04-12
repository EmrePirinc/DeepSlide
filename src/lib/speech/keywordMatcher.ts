// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { PresentationImage } from '@/types/presentation';
import type { MatchResult } from './types';
import { similarity } from '@/lib/utils/levenshtein';

/**
 * Anahtar kelime eşleştirme motoru.
 * Inverted index + fuzzy matching (Levenshtein) + N-gram (çok kelimeli keyword).
 *
 * Örnek: "yürüyüş yolu" keyword'ü için "yürüyüş", "yolu", "yürüyüş yolu"
 * kombinasyonları denenir. Tam eşleşme en yüksek skoru alır.
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
          kw.text.toLowerCase().trim(),
          ...kw.synonyms.map((s) => s.toLowerCase().trim()),
        ];

        for (const term of terms) {
          if (!term) continue;
          if (!this.index.has(term)) {
            this.index.set(term, new Set());
          }
          this.index.get(term)!.add(image.id);
        }
      }
    }
  }

  /**
   * Söylenen kelimelerden N-gram'lar üretir (1, 2, 3 kelimelik kombinasyonlar).
   * Örnek: ["yürüyüş", "yolu", "güzel"] →
   *   ["yürüyüş", "yolu", "güzel",
   *    "yürüyüş yolu", "yolu güzel",
   *    "yürüyüş yolu güzel"]
   */
  private generateNGrams(words: string[], maxN: number = 3): string[] {
    const ngrams: string[] = [];
    for (let n = 1; n <= Math.min(maxN, words.length); n++) {
      for (let i = 0; i <= words.length - n; i++) {
        ngrams.push(words.slice(i, i + n).join(' '));
      }
    }
    return ngrams;
  }

  /**
   * Söylenen kelimeleri index'teki keyword'lerle eşleştirir.
   * N-gram desteği: çok kelimeli keyword'ler de bulunur.
   * Strateji: Uzun eşleşmeler öncelikli (tam ifade > tek kelime).
   */
  match(spokenWords: string[], threshold: number = 0.7): MatchResult[] {
    const results: MatchResult[] = [];
    const seen = new Set<string>(); // Aynı keyword için tekrar ekleme

    // Tüm N-gram'ları üret (1, 2, 3 kelimelik)
    const ngrams = this.generateNGrams(spokenWords, 3);

    // Uzun ifadeler öncelikli — çünkü daha spesifik eşleşme demek
    ngrams.sort((a, b) => b.split(' ').length - a.split(' ').length);

    for (const ngram of ngrams) {
      const normalized = ngram.toLowerCase().trim();
      if (normalized.length < 2) continue;

      // 1. Exact match
      if (this.index.has(normalized)) {
        if (!seen.has(normalized)) {
          seen.add(normalized);
          // Çok kelimeli eşleşmelere bonus skor: 1.0 + (kelime_sayısı - 1) * 0.05
          // Böylece "yürüyüş yolu" (1.05) > "yolu" (0.75)
          const wordBonus = (normalized.split(' ').length - 1) * 0.05;
          results.push({
            keyword: normalized,
            imageIds: Array.from(this.index.get(normalized)!),
            score: Math.min(1.0, 1.0 + wordBonus),
          });
        }
        continue;
      }

      // 2. Fuzzy match (sadece tek kelime için — N-gram fuzzy çok gürültülü)
      if (!normalized.includes(' ')) {
        for (const [keyword, imageIds] of this.index) {
          if (seen.has(keyword)) continue;
          // Tek kelimeli keyword'leri tek kelime ile karşılaştır
          if (keyword.includes(' ')) continue;

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
      } else {
        // Çok kelimeli N-gram — fuzzy match için her kelime kısmını dene
        const ngramWords = normalized.split(' ');
        for (const [keyword, imageIds] of this.index) {
          if (seen.has(keyword)) continue;
          if (!keyword.includes(' ')) continue; // Sadece çok kelimeli keyword'ler

          const keywordParts = keyword.split(' ');
          if (keywordParts.length !== ngramWords.length) continue;

          // Her kelimeyi ayrı ayrı fuzzy karşılaştır, ortalama al
          let totalScore = 0;
          for (let i = 0; i < keywordParts.length; i++) {
            totalScore += similarity(ngramWords[i], keywordParts[i]);
          }
          const avgScore = totalScore / keywordParts.length;

          if (avgScore >= threshold) {
            seen.add(keyword);
            const wordBonus = (keywordParts.length - 1) * 0.05;
            results.push({
              keyword,
              imageIds: Array.from(imageIds),
              score: Math.min(1.0, avgScore + wordBonus),
            });
          }
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
