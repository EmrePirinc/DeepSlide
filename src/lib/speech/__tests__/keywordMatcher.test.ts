// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { describe, it, expect } from 'vitest';
import type { PresentationImage, Keyword } from '@/types/presentation';
import { KeywordMatcher } from '../keywordMatcher';
import { evaluateGoldSet, GOLD_SET, type SceneImage, type KeywordSpec } from './goldset';
import { normalizePhrase, asciifyTurkish, areConfusable } from '../normalize';
import { ensembleScore, jaroWinkler, trigramCosine, confusableAwareSimilarity } from '../similarity';
import { stemWord, stemPhrase } from '../stemmer';
import { FixtureEmbedder } from './fixtureEmbedder';

// Helper: GoldCase sahnesini PresentationImage[]'e çevir
function toPresentationImages(scene: SceneImage[]): PresentationImage[] {
  return scene.map((img, idx) => ({
    id: img.id,
    presentationId: 'test',
    fileName: `${img.id}.jpg`,
    mimeType: 'image/jpeg',
    blobKey: img.id,
    thumbnailDataUrl: '',
    width: 100,
    height: 100,
    order: idx,
    keywords: img.keywords.map((kw: KeywordSpec, kIdx) => ({
      id: `${img.id}-kw-${kIdx}`,
      text: kw.text,
      confidence: 0.9,
      isUserEdited: false,
      synonyms: kw.synonyms ?? [],
      forms: kw.forms,
      confusability: kw.confusability,
      negatives: kw.negatives,
    } satisfies Keyword)),
    analysisStatus: 'completed' as const,
    createdAt: Date.now(),
  }));
}

// Gold set runner — matcher'ı her vaka için yeniden kur, en iyi matchi döndür.
// J kategori (streaming prefix) vakalarında matchStreamingPrefix çağrılır.
// K kategori (semantic rerank) sync runner'da SKIP edilir — K vakaları için
// ayrı async runner (K-only test block) vardır.
function matchScene(
  scene: SceneImage[],
  spoken: string,
  caseInfo?: { streamingPrefix?: boolean; semanticRerank?: boolean },
): string | null {
  const matcher = new KeywordMatcher();
  matcher.buildIndex(toPresentationImages(scene));

  if (caseInfo?.streamingPrefix) {
    const m = matcher.matchStreamingPrefix(spoken, 0.7);
    return m?.imageIds[0] ?? null;
  }

  // K vakaları: sync runner string metrikleriyle match dener, çoğu null döner
  // → baseline. Gerçek rerank async test block'unda yapılır.
  const words = spoken.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
  const recentWords = words.slice(-8); // gold set'te cümleler daha uzun, window'u genişlet
  const matches = matcher.match(recentWords, 0.7);
  if (matches.length === 0) return null;
  return matches[0].imageIds[0] ?? null;
}

describe('normalize.ts', () => {
  it('asciifyTurkish converts diacritics', () => {
    expect(asciifyTurkish('yürüyüş')).toBe('yuruyus');
    expect(asciifyTurkish('ağaç')).toBe('agac');
    expect(asciifyTurkish('İstanbul')).toBe('istanbul');
    expect(asciifyTurkish('ÇıĞrı')).toBe('cigri');
  });

  it('normalizePhrase lowercases + asciifies + trims', () => {
    expect(normalizePhrase('  Yürüyüş Yolu  ')).toBe('yuruyus yolu');
    expect(normalizePhrase('SİS!!')).toBe('sis');
  });

  it('areConfusable detects ASR confusion pairs', () => {
    expect(areConfusable('s', 'z')).toBe(true);
    expect(areConfusable('b', 'p')).toBe(true);
    expect(areConfusable('k', 'g')).toBe(true);
    expect(areConfusable('s', 's')).toBe(true);
    expect(areConfusable('a', 'k')).toBe(false);
  });
});

describe('stemmer.ts', () => {
  it('stems Turkish suffixed words', () => {
    expect(stemWord('yolu')).toBe('yol');
    expect(stemWord('yolunda')).toBe('yol');
    expect(stemWord('yoluna')).toBe('yol');
    expect(stemWord('yolları')).toBe('yol');
  });

  it('stems multi-word phrases', () => {
    // "yürüyüş yolunda" → "yürüyüş yol"
    const result = stemPhrase('yürüyüş yolunda');
    expect(result).toContain('yol');
  });
});

describe('similarity.ts', () => {
  it('Jaro-Winkler gives high score for prefix match (Turkish suffix case)', () => {
    // yol/yolu — prefix aynı, suffix eklenmiş
    const score = jaroWinkler('yolu', 'yol');
    expect(score).toBeGreaterThan(0.9);
  });

  it('trigramCosine high for token-order independent', () => {
    const s1 = trigramCosine('yuruyus yolu', 'yolu yuruyus');
    expect(s1).toBeGreaterThanOrEqual(0.69); // kelime sırası farklı ama karakter örüntüsü aynı
  });

  it('confusableAwareSimilarity sis vs siz higher than plain', () => {
    // Normal Lev: 1 edit / 3 char = 0.67 similarity
    // Confusable-aware: 0.5 edit / 3 char = 0.83 similarity
    const score = confusableAwareSimilarity('sis', 'siz');
    expect(score).toBeGreaterThan(0.75);
  });

  it('ensembleScore identical inputs returns 1', () => {
    expect(ensembleScore('yol', 'yol')).toBe(1);
  });

  it('ensembleScore completely different returns low', () => {
    const score = ensembleScore('araba', 'dag');
    expect(score).toBeLessThan(0.4);
  });
});

describe('keywordMatcher gold set', () => {
  const result = evaluateGoldSet(matchScene);

  it('reports metrics', () => {
    console.log('\n=== GOLD SET RESULT ===');
    console.log(`Total:     ${result.total}`);
    console.log(`TP:        ${result.truePositive}`);
    console.log(`TN:        ${result.trueNegative}`);
    console.log(`FP:        ${result.falsePositive}`);
    console.log(`FN:        ${result.falseNegative}`);
    console.log(`Wrong:     ${result.wrongMatch}`);
    console.log(`Precision: ${result.precision.toFixed(3)}`);
    console.log(`Recall:    ${result.recall.toFixed(3)}`);
    console.log(`F1:        ${result.f1.toFixed(3)}`);
    console.log('\nBy category:');
    for (const [cat, stat] of Object.entries(result.byCategory)) {
      console.log(`  ${cat}: ${stat.pass}/${stat.pass + stat.fail}`);
    }
    if (result.failures.length > 0) {
      console.log('\nFailures:');
      for (const f of result.failures) {
        console.log(`  [${f.id}] "${f.spoken}" → expected=${f.expected} got=${f.got}`);
      }
    }
    expect(result.total).toBeGreaterThan(0);
  });

  it('F1 >= 0.85', () => {
    expect(result.f1).toBeGreaterThanOrEqual(0.85);
  });

  it('all hard negatives (G category) correctly rejected', () => {
    const g = result.byCategory.G ?? { pass: 0, fail: 0 };
    expect(g.fail).toBe(0);
  });

  it('streaming prefix (J category) all pass', () => {
    const j = result.byCategory.J ?? { pass: 0, fail: 0 };
    expect(j.fail).toBe(0);
    expect(j.pass).toBeGreaterThan(0);
  });

  // K kategori (semantic synonym) — sync runner'da çoğunluk DÜŞMELI.
  // Bu BASELINE ölçümü; embedding rerank eklenmeden string metrikleri ile
  // çözülemez. Gerçek rerank async block'ta doğrulanır.
  it('semantic (K category) baseline — string-only fails most cases', () => {
    const k = result.byCategory.K ?? { pass: 0, fail: 0 };
    // En fazla 2 vaka geçebilir (sadece negatif testler); çoğu düşmeli
    expect(k.fail).toBeGreaterThanOrEqual(4);
  });
});

describe('keywordMatcher — semantic rerank (K category, fixture-backed)', () => {
  // K kategorisi vakalarını al
  const kCases = GOLD_SET.filter((g) => g.category === 'K');

  it('loads fixture and covers all K cases', () => {
    expect(kCases.length).toBeGreaterThan(0);
  });

  for (const gc of kCases) {
    it(`${gc.id}: ${gc.spoken} → ${gc.expected}`, async () => {
      const matcher = new KeywordMatcher();
      matcher.buildIndex(toPresentationImages(gc.scene));

      // Fixture embedder ile passage'ları prefetch et
      const embedder = new FixtureEmbedder();
      await matcher.prefetchEmbeddings(embedder);

      // Semantic-only match (K vakaları pure semantic testleri)
      const result = await matcher.matchSemanticOnly(gc.spoken, embedder);
      expect(result).not.toBeNull();
      expect(result!.imageIds[0]).toBe(gc.expected);
    });
  }
});

describe('keywordMatcher — streaming prefix (unit)', () => {
  const scene: SceneImage[] = [
    { id: 'img-path', keywords: [{ text: 'yürüyüş yolu' }] },
    { id: 'img-hay', keywords: [{ text: 'saman balyası' }] },
    { id: 'img-fog', keywords: [{ text: 'sis' }] },
  ];

  const matcher = new KeywordMatcher();
  matcher.buildIndex(toPresentationImages(scene));

  it('triggers early on unique prefix', () => {
    const m = matcher.matchStreamingPrefix('yuru', 0.7);
    expect(m).not.toBeNull();
    expect(m!.imageIds[0]).toBe('img-path');
    expect(m!.score).toBe(0.85);
  });

  it('returns null on ambiguous prefix', () => {
    const ambScene: SceneImage[] = [
      { id: 'img-a', keywords: [{ text: 'yürüyüş yolu' }] },
      { id: 'img-b', keywords: [{ text: 'yürüyüş parkuru' }] },
    ];
    const ambMatcher = new KeywordMatcher();
    ambMatcher.buildIndex(toPresentationImages(ambScene));
    expect(ambMatcher.matchStreamingPrefix('yuruyus', 0.7)).toBeNull();
  });

  it('enforces minimum depth of 3 chars', () => {
    expect(matcher.matchStreamingPrefix('sa', 0.7)).toBeNull();
    expect(matcher.matchStreamingPrefix('s', 0.7)).toBeNull();
    expect(matcher.matchStreamingPrefix('', 0.7)).toBeNull();
  });
});
