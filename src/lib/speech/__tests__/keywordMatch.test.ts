// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { describe, it, expect, beforeEach } from 'vitest';
import { normalizeAndAsciify, fastTurkishStemmer } from '../turkishNLP';
import { AhoCorasickAutomaton } from '../ahoCorasick';

// ============================================================================
// 1. turkishNLP
// ============================================================================

describe('turkishNLP.normalizeAndAsciify', () => {
  it('converts all Turkish diacritics to ASCII', () => {
    expect(normalizeAndAsciify('yürüyüş')).toBe('yuruyus');
    expect(normalizeAndAsciify('ağaç')).toBe('agac');
    expect(normalizeAndAsciify('İstanbul')).toBe('istanbul');
    expect(normalizeAndAsciify('çığlık')).toBe('ciglik');
    expect(normalizeAndAsciify('örnek')).toBe('ornek');
  });

  it('lowercases and collapses whitespace', () => {
    expect(normalizeAndAsciify('  Yürüyüş   Yolu  ')).toBe('yuruyus yolu');
    expect(normalizeAndAsciify('YüRüYüŞ YoLu')).toBe('yuruyus yolu');
  });

  it('removes punctuation', () => {
    expect(normalizeAndAsciify('sis, vardı!')).toBe('sis vardi');
    expect(normalizeAndAsciify('yolu... mu?')).toBe('yolu mu');
  });

  it('handles empty input', () => {
    expect(normalizeAndAsciify('')).toBe('');
    expect(normalizeAndAsciify('   ')).toBe('');
  });

  it('handles circumflex (â, î, û)', () => {
    expect(normalizeAndAsciify('kâr')).toBe('kar');
    expect(normalizeAndAsciify('hâlâ')).toBe('hala');
  });
});

describe('turkishNLP.fastTurkishStemmer', () => {
  // NOT: stemmer asciified input bekler. Prod pipeline'da zaten
  // normalizeAndAsciify → split → stem sırasıyla çalıştırılır.
  // Bu testler asciified form üzerinde doğrular.

  it('strips common locative/possessive suffixes', () => {
    expect(fastTurkishStemmer('yolunda')).toBe('yol');
    expect(fastTurkishStemmer('yoluna')).toBe('yol');
    expect(fastTurkishStemmer('yollari')).toBe('yol');
  });

  it('strips plural suffixes', () => {
    expect(fastTurkishStemmer('daglar')).toBe('dag');
    expect(fastTurkishStemmer('kuslar')).toBe('kus');
  });

  it('reverses consonant softening (postlude)', () => {
    // kitabı → kitab stripped → kitap postlude
    expect(fastTurkishStemmer('kitabi')).toBe('kitap');
  });

  it('preserves short words (≤3 chars)', () => {
    expect(fastTurkishStemmer('ev')).toBe('ev');
    expect(fastTurkishStemmer('su')).toBe('su');
    expect(fastTurkishStemmer('yol')).toBe('yol');
  });

  it('returns original when no suffix matches', () => {
    expect(fastTurkishStemmer('kalem')).toBe('kalem');
    expect(fastTurkishStemmer('masa')).toBe('mas'); // "a" suffix kesilir
  });

  it('handles multi-syllable stems correctly', () => {
    expect(fastTurkishStemmer('yuruyusunde')).toBe('yuruyus');
    expect(fastTurkishStemmer('balyalari')).toBe('balya');
  });
});

// ============================================================================
// 2. Aho-Corasick
// ============================================================================

describe('AhoCorasickAutomaton', () => {
  let automaton: AhoCorasickAutomaton;

  beforeEach(() => {
    automaton = new AhoCorasickAutomaton();
  });

  it('finds a single pattern', () => {
    automaton.addPattern('kw1', 'img-a', 'sis');
    automaton.buildAutomaton();
    const matches = automaton.search('sabahleyin sis vardi');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].imageId).toBe('img-a');
    expect(matches[0].keywordId).toBe('kw1');
  });

  it('finds multiple non-overlapping patterns', () => {
    automaton.addPattern('kw1', 'img-a', 'dag');
    automaton.addPattern('kw2', 'img-b', 'yol');
    automaton.buildAutomaton();
    const matches = automaton.search('dagda yolu vardi');
    const imageIds = matches.map((m) => m.imageId);
    expect(imageIds).toContain('img-a');
    expect(imageIds).toContain('img-b');
  });

  it('returns longer pattern via patternLength metadata', () => {
    automaton.addPattern('kw1', 'img-a', 'yol');
    automaton.addPattern('kw2', 'img-b', 'yuruyus yol');
    automaton.buildAutomaton();
    const matches = automaton.search('dagda yuruyus yol var');
    const longest = matches.reduce((a, b) =>
      b.patternLength > a.patternLength ? b : a,
    );
    expect(longest.imageId).toBe('img-b');
    expect(longest.patternLength).toBe(11);
  });

  it('finds overlapping patterns via failure links', () => {
    automaton.addPattern('kw1', 'img-a', 'hersey');
    automaton.addPattern('kw2', 'img-b', 'ersey');
    automaton.buildAutomaton();
    const matches = automaton.search('hersey guzel');
    const imageIds = matches.map((m) => m.imageId);
    expect(imageIds).toContain('img-a');
    expect(imageIds).toContain('img-b');
  });

  it('returns empty for no match', () => {
    automaton.addPattern('kw1', 'img-a', 'sis');
    automaton.buildAutomaton();
    expect(automaton.search('hava guzel')).toEqual([]);
  });

  it('search before buildAutomaton returns empty safely', () => {
    automaton.addPattern('kw1', 'img-a', 'sis');
    // buildAutomaton ÇAĞRILMADI
    expect(automaton.search('sis vardi')).toEqual([]);
  });

  it('deduplicates identical patterns', () => {
    automaton.addPattern('kw1', 'img-a', 'sis');
    automaton.addPattern('kw1', 'img-a', 'sis'); // duplicate
    automaton.buildAutomaton();
    const matches = automaton.search('sis');
    expect(matches.length).toBe(1);
  });

  it('handles empty text', () => {
    automaton.addPattern('kw1', 'img-a', 'sis');
    automaton.buildAutomaton();
    expect(automaton.search('')).toEqual([]);
  });
});

// ============================================================================
// 3. End-to-end scenarios — araştırma dosyasındaki 15 senaryo
// ============================================================================
// Not: useKeywordMatch bir React hook. Burada hook yerine match mantığını
// direkt çalıştırıyoruz (Aho-Corasick + turkishNLP). Hook integration'u
// present mode manuel testte doğrulanır.

interface TestKeyword {
  id: string;
  text: string;
  synonyms?: string[];
  forms?: string[];
  negatives?: string[];
}

interface TestScene {
  imageId: string;
  keywords: TestKeyword[];
}

/** Test helper — scene'den automaton + negatives kur, text'i match et. */
function runMatch(
  scene: TestScene[],
  spoken: string,
): { imageId: string; patternLength: number } | null {
  const automaton = new AhoCorasickAutomaton();
  const negatives = new Set<string>();

  for (const img of scene) {
    for (const kw of img.keywords) {
      const variations = [kw.text, ...(kw.synonyms ?? []), ...(kw.forms ?? [])];
      for (const v of variations) {
        const asciified = normalizeAndAsciify(v);
        if (!asciified) continue;
        automaton.addPattern(kw.id, img.imageId, asciified);
        const stemmed = asciified.split(' ').map(fastTurkishStemmer).join(' ');
        if (stemmed !== asciified) {
          automaton.addPattern(kw.id, img.imageId, stemmed);
        }
      }
      for (const neg of kw.negatives ?? []) {
        const normalized = normalizeAndAsciify(neg);
        if (normalized) negatives.add(normalized);
      }
    }
  }

  automaton.buildAutomaton();

  const normalized = normalizeAndAsciify(spoken);
  const tokens = normalized.split(' ').filter(Boolean);

  for (const token of tokens) {
    if (negatives.has(token)) return null;
  }

  const stemmedText = tokens.map(fastTurkishStemmer).join(' ');
  const matches = automaton.search(stemmedText);
  if (matches.length === 0) return null;

  let best = matches[0];
  for (const m of matches) {
    if (m.patternLength > best.patternLength) {
      best = m;
    } else if (m.patternLength === best.patternLength && m.endIndex > best.endIndex) {
      best = m;
    }
  }
  return { imageId: best.imageId, patternLength: best.patternLength };
}

describe('useKeywordMatch integration — 15 senaryo', () => {
  const scene: TestScene[] = [
    { imageId: 'img-fog', keywords: [{ id: 'k1', text: 'sis', negatives: ['siz', 'his'] }] },
    { imageId: 'img-hay', keywords: [{ id: 'k2', text: 'saman balyası' }] },
    { imageId: 'img-mountain', keywords: [{ id: 'k3', text: 'dağ' }] },
    { imageId: 'img-path', keywords: [{ id: 'k4', text: 'yürüyüş yolu' }] },
    { imageId: 'img-forest', keywords: [{ id: 'k5', text: 'orman' }] },
    { imageId: 'img-water', keywords: [{ id: 'k6', text: 'su' }] },
    { imageId: 'img-road', keywords: [{ id: 'k7', text: 'yol' }] },
  ];

  it('1. Tam eşleşme: "sabahleyin sis vardı" → img-fog', () => {
    expect(runMatch(scene, 'sabahleyin sis vardı')?.imageId).toBe('img-fog');
  });

  it('2. Çoğul + iyelik: "saman balyaları sırada" → img-hay', () => {
    expect(runMatch(scene, 'saman balyaları sırada')?.imageId).toBe('img-hay');
  });

  it('3. Plural suffix: "ilerideki dağlar bulutlu" → img-mountain', () => {
    expect(runMatch(scene, 'ilerideki dağlar bulutlu')?.imageId).toBe('img-mountain');
  });

  it('4. Combined suffix: "yürüyüş yolunda ilerledik" → img-path', () => {
    expect(runMatch(scene, 'yürüyüş yolunda ilerledik')?.imageId).toBe('img-path');
  });

  it('5. Missing diacritic: "yuruyus yolu" → img-path', () => {
    expect(runMatch(scene, 'yuruyus yolu')?.imageId).toBe('img-path');
  });

  it('6. Case tolerance: "YüRüYüŞ YoLu" → img-path', () => {
    expect(runMatch(scene, 'YüRüYüŞ YoLu')?.imageId).toBe('img-path');
  });

  it('7. Negative list: "siz de gelir misiniz" → null', () => {
    expect(runMatch(scene, 'siz de gelir misiniz')).toBeNull();
  });

  it('8. Unrelated: "hava bugün soğuk" → null', () => {
    expect(runMatch(scene, 'hava bugün soğuk')).toBeNull();
  });

  it('9. Short word: "su içmek için durduk" → img-water', () => {
    expect(runMatch(scene, 'su içmek için durduk')?.imageId).toBe('img-water');
  });

  it('10. Flicker interim 1 (partial): "or" → null (kısa, yetersiz)', () => {
    // "or" 2 karakter, "orman" pattern'ına eşleşmez (Aho-Corasick tam char match)
    expect(runMatch(scene, 'or')).toBeNull();
  });

  it('11. Flicker interim 2 (partial): "orma" → null', () => {
    // "orma" orman pattern'ının prefix'i ama full match değil
    expect(runMatch(scene, 'orma')).toBeNull();
  });

  it('12. Flicker interim 3 (wrong): "sahil" → null (keyword yok)', () => {
    expect(runMatch(scene, 'sahil')).toBeNull();
  });

  it('13. Final commit: "orman çok güzel" → img-forest', () => {
    expect(runMatch(scene, 'orman çok güzel')?.imageId).toBe('img-forest');
  });

  it('14. Longest wins: "dağda yürüyüş yolu var" → img-path (11 > 3)', () => {
    const result = runMatch(scene, 'dağda yürüyüş yolu var');
    expect(result?.imageId).toBe('img-path');
    expect(result?.patternLength).toBeGreaterThanOrEqual(11);
  });

  it('15. Negative: "his var havada" → null', () => {
    expect(runMatch(scene, 'his var havada')).toBeNull();
  });

  it('Bonus: "yolda yürüyorduk" → img-road (stem match)', () => {
    expect(runMatch(scene, 'yolda yürüyorduk')?.imageId).toBe('img-road');
  });

  it('Bonus: "daglar cok guzel" → img-mountain (asciified input)', () => {
    expect(runMatch(scene, 'daglar cok guzel')?.imageId).toBe('img-mountain');
  });

  it('Bonus: "yuruyus yoluna girdik" → img-path', () => {
    expect(runMatch(scene, 'yuruyus yoluna girdik')?.imageId).toBe('img-path');
  });
});
