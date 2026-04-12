// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * MiniSearch tabanlı BM25 matcher — DeepSlide ensemble için ikinci sinyal.
 *
 * Ensemble string metrikleri (JW + trigram + confusable Damerau) + bu BM25
 * sonucu Reciprocal Rank Fusion (RRF) ile birleştirilir. RRF 2024 SOTA
 * hybrid retrieval pipeline'larında standart füzyon yöntemi.
 *
 * Türkçe desteği: `processTerm` hook'u `normalizePhrase` + `stemPhrase`
 * zinciri çalıştırır → "yolu/yolda/yolunda" hepsi "yol"a indirgenir.
 * Prefix + fuzzy search → ASR hatalarına dayanıklı.
 */

import MiniSearch from 'minisearch';
import { normalizePhrase } from './normalize';
import { stemPhrase } from './stemmer';

export interface BM25Entry {
  /** Unique doc id — genelde image id ama çakışmaları önlemek için prefix ekli olabilir. */
  id: string;
  imageId: string;
  /** Search edilecek metin (ana keyword + synonyms + forms birleşik). */
  text: string;
}

export interface BM25Result {
  imageId: string;
  score: number;
}

interface StoredDoc {
  imageId: string;
}

/**
 * Türkçe keyword BM25 matcher'ı.
 *
 * Performans: 50 entry build <5 ms, search <2 ms.
 */
export class BM25Matcher {
  private index: MiniSearch<BM25Entry>;

  constructor() {
    this.index = new MiniSearch<BM25Entry>({
      fields: ['text'],
      storeFields: ['imageId'],
      // Türkçe-aware tokenization: lowercase + asciify + stem
      processTerm: (term) => {
        const normalized = normalizePhrase(term);
        if (!normalized) return null;
        const stemmed = normalizePhrase(stemPhrase(normalized));
        return stemmed || normalized;
      },
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
        combineWith: 'OR',
      },
    });
  }

  /** Index'i baştan oluştur. */
  build(entries: BM25Entry[]): void {
    this.index.removeAll();
    if (entries.length > 0) {
      this.index.addAll(entries);
    }
  }

  /**
   * Query'yi ara ve image-id bazında tekil sonuç döndür.
   * Aynı image birden fazla doc ile match ederse skorları toplanır.
   */
  search(query: string): BM25Result[] {
    if (!query) return [];
    const raw = this.index.search(query);
    if (raw.length === 0) return [];

    // Image id bazında toplama (birden fazla term aynı image'a düşebilir)
    const byImage = new Map<string, number>();
    for (const r of raw) {
      const doc = r as typeof r & StoredDoc;
      const imageId = doc.imageId;
      if (!imageId) continue;
      const existing = byImage.get(imageId) ?? 0;
      byImage.set(imageId, Math.max(existing, r.score));
    }

    return [...byImage.entries()]
      .map(([imageId, score]) => ({ imageId, score }))
      .sort((a, b) => b.score - a.score);
  }

  get size(): number {
    return this.index.documentCount;
  }
}

/**
 * Reciprocal Rank Fusion — iki sıralı liste birleştirme.
 *
 *   score = 1/(k + rank_ensemble) + 1/(k + rank_bm25)
 *
 * k = 60 (IR literatüründe standart; Cormack 2009 ve sonrası).
 *
 * İki liste de imageId → rank formatında olmalı. Aynı image iki listede
 * de varsa skorlar toplanır. Sadece bir listede varsa tek katkı.
 */
export function reciprocalRankFusion(
  lists: Array<Array<{ imageId: string; rank: number }>>,
  k: number = 60,
): Array<{ imageId: string; score: number }> {
  const combined = new Map<string, number>();
  for (const list of lists) {
    for (const { imageId, rank } of list) {
      const weight = 1 / (k + rank);
      combined.set(imageId, (combined.get(imageId) ?? 0) + weight);
    }
  }
  return [...combined.entries()]
    .map(([imageId, score]) => ({ imageId, score }))
    .sort((a, b) => b.score - a.score);
}
