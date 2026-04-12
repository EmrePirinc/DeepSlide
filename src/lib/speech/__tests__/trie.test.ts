// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { describe, it, expect } from 'vitest';
import { KeywordTrie } from '../trie';
import { normalizePhrase } from '../normalize';
import { stemPhrase } from '../stemmer';

function norm(s: string): string {
  return normalizePhrase(stemPhrase(normalizePhrase(s)));
}

describe('KeywordTrie', () => {
  it('finds unique prefix for a single-image keyword', () => {
    const trie = new KeywordTrie();
    trie.build([
      { text: norm('yürüyüş yolu'), imageId: 'img-path' },
      { text: norm('saman balyası'), imageId: 'img-hay' },
      { text: norm('sis'), imageId: 'img-fog' },
    ]);

    const m = trie.findUniquePrefix('yuru');
    expect(m).not.toBeNull();
    expect(m!.imageId).toBe('img-path');
    expect(m!.depth).toBe(3); // ilk benzersizlik 'yur' / 'yuru' (minimum 3)
  });

  it('returns null for ambiguous prefix', () => {
    const trie = new KeywordTrie();
    trie.build([
      { text: norm('yürüyüş yolu'), imageId: 'img-path' },
      { text: norm('yürüyüş parkuru'), imageId: 'img-walk' },
    ]);

    // "yürü" iki keyword'de de var → ambiguous
    const m = trie.findUniquePrefix('yuruyus');
    expect(m).toBeNull();
  });

  it('enforces minimum depth of 3', () => {
    const trie = new KeywordTrie();
    trie.build([
      { text: norm('sis'), imageId: 'img-fog' },
      { text: norm('dağ'), imageId: 'img-mountain' },
    ]);

    // 2 char çok kısa, null dönmeli
    expect(trie.findUniquePrefix('si')).toBeNull();
    expect(trie.findUniquePrefix('da')).toBeNull();

    // 3 char OK
    const sis = trie.findUniquePrefix('sis');
    expect(sis).not.toBeNull();
    expect(sis!.imageId).toBe('img-fog');

    const dag = trie.findUniquePrefix('dag');
    expect(dag).not.toBeNull();
    expect(dag!.imageId).toBe('img-mountain');
  });

  it('finds unique prefix at shortest depth', () => {
    const trie = new KeywordTrie();
    trie.build([
      { text: norm('saman balyası'), imageId: 'img-hay' },
      { text: norm('bulutlar'), imageId: 'img-cloud' },
    ]);

    // "sam" 3 char, unique ve minimum derinlikte
    const m = trie.findUniquePrefix('saman');
    expect(m).not.toBeNull();
    expect(m!.imageId).toBe('img-hay');
    expect(m!.depth).toBe(3); // 'sam' ilk benzersiz nokta
  });

  it('handles non-matching prefix', () => {
    const trie = new KeywordTrie();
    trie.build([
      { text: norm('sis'), imageId: 'img-fog' },
    ]);

    const m = trie.findUniquePrefix('xyz');
    expect(m).toBeNull();
  });

  it('handles empty input gracefully', () => {
    const trie = new KeywordTrie();
    trie.build([
      { text: norm('sis'), imageId: 'img-fog' },
    ]);

    expect(trie.findUniquePrefix('')).toBeNull();
    expect(trie.findUniquePrefix('ab')).toBeNull(); // below min depth
  });

  it('multiple terminal keywords with same prefix — uniqueness requires single image', () => {
    const trie = new KeywordTrie();
    trie.build([
      // iki farklı image aynı "yol" prefix'ini paylaşıyor
      { text: norm('yol'), imageId: 'img-a' },
      { text: norm('yolcu'), imageId: 'img-b' },
    ]);

    // "yol" hem img-a hem img-b'de → ambiguous
    expect(trie.findUniquePrefix('yol')).toBeNull();

    // "yolc" sadece img-b'de
    const m = trie.findUniquePrefix('yolc');
    expect(m).not.toBeNull();
    expect(m!.imageId).toBe('img-b');
  });

  it('build is fast for realistic sizes', () => {
    const entries = Array.from({ length: 50 }, (_, i) => ({
      text: `kelime${i}kelime`,
      imageId: `img-${i % 10}`,
    }));
    const start = performance.now();
    const trie = new KeywordTrie();
    trie.build(entries);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10); // <10 ms
    expect(trie.nodeCount).toBeGreaterThan(0);
  });
});
