// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { PresentationImage, Keyword } from '@/types/presentation';
import type { MatchResult } from './types';
import { normalizePhrase } from './normalize';
import { stemPhrase } from './stemmer';
import { ensembleScore } from './similarity';

/**
 * Türkçe keyword eşleştirme motoru — ensemble similarity + stem + normalization.
 *
 * Pipeline:
 *   1. buildIndex: her keyword için normalized form, stem form, synonym, suffix forms üretilir.
 *   2. match: söylenen kelimelerden N-gram üretilir, önce exact (hem normalized hem stem),
 *      sonra fuzzy ensemble similarity ile arama yapılır.
 *   3. Kısa kelimeler için dinamik threshold, confusability yüksek keyword'lerde ek sıkılaştırma.
 *
 * Her match çağrısı O(ngrams × indexTerms) — 50 keyword × 15 ngram × ~1ms = <20ms.
 */

/** Index içindeki tek bir girdi — hangi kelime, hangi görseller, normalize/stem. */
interface IndexEntry {
  /** Orijinal (normalize edilmiş) metin — exact match birincil. */
  normalized: string;
  /** Stem'lenmiş form — yol/yolu/yolda birleşir. */
  stemmed: string;
  /** Bu terime bağlı görsel ID'leri. */
  imageIds: Set<string>;
  /** Ana keyword'ün confusability skoru — threshold hesabı için. */
  confusability: number;
  /** Ana keyword'ün uzunluğu (char) — threshold hesabı için. */
  keywordLength: number;
  /** Kaç kelimeden oluştuğu — multi-word skor için. */
  wordCount: number;
  /** Exact match bonus'u uygulanmalı mı — sadece ana form + synonym. */
  exactEligible: boolean;
}

/**
 * Dinamik threshold:
 * - Kısa kelime (≤3 char) → min 0.90
 * - Orta (≤5 char) → min 0.80
 * - Uzun (6+) → base threshold
 * - Confusability > 0.7 → +0.10 (max 0.95)
 */
function dynamicThreshold(
  keywordLength: number,
  confusability: number,
  baseThreshold: number,
): number {
  let t = baseThreshold;
  if (keywordLength <= 3) t = Math.max(t, 0.9);
  else if (keywordLength <= 5) t = Math.max(t, 0.8);

  if (confusability > 0.7) {
    t = Math.min(0.95, t + 0.1);
  }
  return t;
}

export class KeywordMatcher {
  /** Ana arama index'i — normalized form → IndexEntry list. */
  private index = new Map<string, IndexEntry[]>();

  /**
   * Sahnedeki tüm keyword'leri topar — fuzzy fallback ve dinamik threshold için.
   * buildIndex çağrısında doldurulur.
   */
  private allEntries: IndexEntry[] = [];

  /**
   * Görsellerin keyword'lerinden inverted index oluşturur.
   * Her keyword için:
   *   - Ana text
   *   - Synonyms
   *   - Forms (Türkçe ek varyasyonları, Gemini'den)
   * formlarını hem normalized hem stem versiyonuyla index'e ekler.
   */
  buildIndex(images: PresentationImage[]): void {
    this.index.clear();
    this.allEntries = [];

    for (const image of images) {
      for (const kw of image.keywords) {
        this.addKeywordToIndex(image.id, kw);
      }
    }
  }

  private addKeywordToIndex(imageId: string, kw: Keyword): void {
    // Terim toplamı: ana text + synonyms + forms
    const rawTerms = [
      kw.text,
      ...(kw.synonyms ?? []),
      ...(kw.forms ?? []),
    ].filter((t) => t && t.trim().length > 0);

    const confusability = kw.confusability ?? 0.2;
    const mainNormalized = normalizePhrase(kw.text);
    const mainLength = mainNormalized.length;
    const mainWordCount = mainNormalized.split(/\s+/).length;

    for (const rawTerm of rawTerms) {
      const normalized = normalizePhrase(rawTerm);
      if (!normalized) continue;
      const stemmed = normalizePhrase(stemPhrase(normalized));

      const entry: IndexEntry = {
        normalized,
        stemmed,
        imageIds: new Set([imageId]),
        confusability,
        keywordLength: mainLength,
        wordCount: mainWordCount,
        exactEligible: true,
      };

      // Normalized form ile index'e ekle (exact match lookup)
      const existing = this.index.get(normalized);
      if (existing) {
        existing[0].imageIds.add(imageId);
      } else {
        this.index.set(normalized, [entry]);
        this.allEntries.push(entry);
      }

      // Stem'lenmiş form farklıysa ayrı index'e ekle (stem exact match)
      if (stemmed !== normalized) {
        const stemEntry: IndexEntry = {
          ...entry,
          normalized: stemmed,
          imageIds: new Set([imageId]),
          exactEligible: false, // stem match puanı 0.95 (ana form değil)
        };
        const existingStem = this.index.get(stemmed);
        if (existingStem) {
          existingStem[0].imageIds.add(imageId);
        } else {
          this.index.set(stemmed, [stemEntry]);
          this.allEntries.push(stemEntry);
        }
      }
    }
  }

  /**
   * Söylenen kelimelerden N-gram'lar üretir (1, 2, 3 kelimelik kombinasyonlar).
   * "yürüyüş yolu güzel" → ["yürüyüş", "yolu", "güzel", "yürüyüş yolu", "yolu güzel", "yürüyüş yolu güzel"]
   */
  private generateNGrams(words: string[], maxN: number = 3): string[] {
    const ngrams: string[] = [];
    const limit = Math.min(maxN, words.length);
    for (let n = 1; n <= limit; n++) {
      for (let i = 0; i <= words.length - n; i++) {
        ngrams.push(words.slice(i, i + n).join(' '));
      }
    }
    return ngrams;
  }

  /**
   * Söylenen kelimeleri keyword'lerle eşleştirir.
   *
   * Pipeline:
   *   1. Her kelimeyi normalize + stem
   *   2. N-gram üret (1-3 kelime, uzun öncelik)
   *   3. Her n-gram için normalized ve stem formunu index'te ara (O(1) lookup)
   *   4. Exact match bulundu → skor yüksek, kısa devre
   *   5. Bulunmadıysa fuzzy ensemble similarity ile tüm entry'leri tara
   *   6. Keyword-bazında dinamik threshold ile filtrele
   *
   * @param spokenWords Ham (normalize edilmemiş) kelime dizisi
   * @param baseThreshold Global threshold — keyword bazında ayarlanır
   */
  match(spokenWords: string[], baseThreshold: number = 0.7): MatchResult[] {
    if (spokenWords.length === 0 || this.allEntries.length === 0) return [];

    // Normalize edilmiş kelime ve stem formları
    const normalizedWords = spokenWords.map((w) => normalizePhrase(w));
    const stemmedWords = normalizedWords.map((w) => normalizePhrase(stemPhrase(w)));

    // N-gram'ları üret — hem normalized hem stem formunda
    const normalizedNgrams = this.generateNGrams(normalizedWords, 3);
    const stemmedNgrams = this.generateNGrams(stemmedWords, 3);

    // Uzun ifade önceliği için sıralama (kelime sayısı azalan)
    normalizedNgrams.sort((a, b) => b.split(' ').length - a.split(' ').length);
    stemmedNgrams.sort((a, b) => b.split(' ').length - a.split(' ').length);

    const results: MatchResult[] = [];
    const seen = new Set<string>(); // aynı entry.normalized'a tekrar ekleme

    // ========== 1. EXACT MATCH (normalized + stemmed) ==========
    for (const ngram of normalizedNgrams) {
      if (!ngram || ngram.length < 2) continue;
      const exact = this.index.get(ngram);
      if (exact) {
        for (const entry of exact) {
          if (seen.has(entry.normalized)) continue;
          seen.add(entry.normalized);

          // Multi-word bonus: sadece exact match'te + ana form
          const wordBonus = entry.exactEligible
            ? (entry.wordCount - 1) * 0.05
            : -0.05; // stem match → küçük penalty
          const score = Math.min(1.0, 1.0 + wordBonus);

          // Threshold kontrolü
          const th = dynamicThreshold(
            entry.keywordLength,
            entry.confusability,
            baseThreshold,
          );
          if (score >= th) {
            results.push({
              keyword: entry.normalized,
              imageIds: Array.from(entry.imageIds),
              score,
            });
          }
        }
      }
    }

    // Stem n-gram exact match — yol/yolu/yolda birleşimi
    for (const ngram of stemmedNgrams) {
      if (!ngram || ngram.length < 2) continue;
      const exact = this.index.get(ngram);
      if (exact) {
        for (const entry of exact) {
          if (seen.has(entry.normalized)) continue;
          seen.add(entry.normalized);
          const score = 0.9; // stem match → 0.9 sabit (exact'ten düşük)
          const th = dynamicThreshold(
            entry.keywordLength,
            entry.confusability,
            baseThreshold,
          );
          if (score >= th) {
            results.push({
              keyword: entry.normalized,
              imageIds: Array.from(entry.imageIds),
              score,
            });
          }
        }
      }
    }

    // ========== 2. FUZZY FALLBACK — ensemble similarity ==========
    // Sadece exact hiç bulunmadıysa çalışır (performans).
    if (results.length === 0) {
      for (const entry of this.allEntries) {
        if (seen.has(entry.normalized)) continue;

        const th = dynamicThreshold(
          entry.keywordLength,
          entry.confusability,
          baseThreshold,
        );

        let bestScore = 0;
        let bestForm: 'normalized' | 'stemmed' = 'normalized';
        const bothNgrams = [...normalizedNgrams, ...stemmedNgrams];

        for (const ngram of bothNgrams) {
          if (!ngram || ngram.length < 2) continue;

          // Multi-word: sadece aynı kelime sayısındakileri karşılaştır
          const ngramWordCount = ngram.split(' ').length;

          if (entry.wordCount === 1 && ngramWordCount === 1) {
            // Tek kelime fuzzy
            const score = ensembleScore(ngram, entry.normalized);
            if (score > bestScore) {
              bestScore = score;
              bestForm = 'normalized';
            }
          } else if (entry.wordCount > 1 && ngramWordCount === entry.wordCount) {
            // Multi-word: her kelimeyi ayrı karşılaştır + min-aware skor
            const score = this.multiWordScore(ngram, entry.normalized);
            if (score > bestScore) {
              bestScore = score;
              bestForm = 'normalized';
            }
          }
        }

        if (bestScore >= th) {
          seen.add(entry.normalized);
          results.push({
            keyword: entry.normalized,
            imageIds: Array.from(entry.imageIds),
            score: bestScore,
          });
          // bestForm şimdilik sadece debug için — ileride breakdown döneceğiz
          void bestForm;
        }
      }
    }

    // Skora göre sırala (yüksekten düşüğe)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Multi-word skor: "en zayıf kelime baraj" yaklaşımı.
   *
   *   minScore = en zayıf perWordScore
   *   avgScore = ortalama perWordScore
   *   final = 0.6 × min + 0.4 × avg   (minScore >= 0.60 şartıyla)
   *
   * Zayıf kelime cheap-gaming'i önler: "yurumek yolu" → 0.6 + 1.0 ortalama 0.8
   * eski sistemde geçerdi, yeni sistemde min(0.6) hard floor'u var.
   */
  private multiWordScore(ngram: string, keywordNormalized: string): number {
    const ngramWords = ngram.split(' ');
    const keywordWords = keywordNormalized.split(' ');
    if (ngramWords.length !== keywordWords.length) return 0;

    const scores = new Array<number>(ngramWords.length);
    for (let i = 0; i < ngramWords.length; i++) {
      scores[i] = ensembleScore(ngramWords[i], keywordWords[i]);
    }

    let minScore = 1;
    let sum = 0;
    for (const s of scores) {
      if (s < minScore) minScore = s;
      sum += s;
    }
    if (minScore < 0.6) return 0; // hard floor

    const avgScore = sum / scores.length;
    return 0.6 * minScore + 0.4 * avgScore;
  }

  get size(): number {
    return this.index.size;
  }
}
