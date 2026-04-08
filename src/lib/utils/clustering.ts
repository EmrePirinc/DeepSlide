// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { PresentationImage } from '@/types/presentation';

/**
 * Keyword benzerliğine göre görselleri kümeleyerek sıralar.
 * Jaccard similarity kullanır: |A ∩ B| / |A ∪ B|
 */
export function clusterImagesByKeywords(
  images: PresentationImage[]
): PresentationImage[] {
  if (images.length <= 1) return images;

  // Her görselin keyword setini oluştur
  const keywordSets = images.map((img) => {
    const set = new Set<string>();
    for (const kw of img.keywords) {
      set.add(kw.text.toLowerCase());
      if (kw.category) set.add(kw.category);
    }
    return set;
  });

  // Jaccard similarity hesapla
  function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 && b.size === 0) return 0;
    const intersection = new Set([...a].filter((x) => b.has(x)));
    const union = new Set([...a, ...b]);
    return intersection.size / union.size;
  }

  // Greedy nearest-neighbor sıralama
  const used = new Set<number>();
  const result: PresentationImage[] = [];

  // İlk görseli ekle
  let currentIndex = 0;
  used.add(0);
  result.push(images[0]);

  while (result.length < images.length) {
    let bestIndex = -1;
    let bestSimilarity = -1;

    for (let i = 0; i < images.length; i++) {
      if (used.has(i)) continue;
      const sim = jaccardSimilarity(
        keywordSets[currentIndex],
        keywordSets[i]
      );
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        bestIndex = i;
      }
    }

    if (bestIndex === -1) break;
    used.add(bestIndex);
    result.push(images[bestIndex]);
    currentIndex = bestIndex;
  }

  return result;
}
