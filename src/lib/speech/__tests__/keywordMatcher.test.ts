// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { describe, it, expect } from 'vitest';
import type { PresentationImage, Keyword } from '@/types/presentation';
import { KeywordMatcher } from '../keywordMatcher';
import { evaluateGoldSet, type SceneImage, type KeywordSpec } from './goldset';
import { normalizePhrase, asciifyTurkish, areConfusable } from '../normalize';
import { ensembleScore, jaroWinkler, trigramCosine, confusableAwareSimilarity } from '../similarity';
import { stemWord, stemPhrase } from '../stemmer';

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
    } satisfies Keyword)),
    analysisStatus: 'completed' as const,
    createdAt: Date.now(),
  }));
}

// Gold set runner — matcher'ı her vaka için yeniden kur, en iyi matchi döndür
function matchScene(scene: SceneImage[], spoken: string): string | null {
  const matcher = new KeywordMatcher();
  matcher.buildIndex(toPresentationImages(scene));
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
});
