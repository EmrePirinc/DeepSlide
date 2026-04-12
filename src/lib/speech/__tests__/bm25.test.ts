// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { describe, it, expect } from 'vitest';
import { BM25Matcher, reciprocalRankFusion } from '../bm25';

describe('BM25Matcher', () => {
  it('builds index and returns Turkish stem match', () => {
    const m = new BM25Matcher();
    m.build([
      { id: 'img-path', imageId: 'img-path', text: 'yürüyüş yolu' },
      { id: 'img-hay', imageId: 'img-hay', text: 'saman balyası' },
      { id: 'img-fog', imageId: 'img-fog', text: 'sis' },
    ]);

    // "yolu" stem'i "yol" — "yolunda" da eşleşmeli
    const res = m.search('yolunda');
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].imageId).toBe('img-path');
  });

  it('diacritic-insensitive match', () => {
    const m = new BM25Matcher();
    m.build([
      { id: '1', imageId: 'img-path', text: 'yürüyüş yolu' },
    ]);
    // kullanıcı asciified söyler
    const res = m.search('yuruyus');
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].imageId).toBe('img-path');
  });

  it('prefix search returns partial matches', () => {
    const m = new BM25Matcher();
    m.build([
      { id: '1', imageId: 'img-hay', text: 'saman balyası' },
      { id: '2', imageId: 'img-fog', text: 'sis' },
    ]);
    const res = m.search('sam'); // prefix
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].imageId).toBe('img-hay');
  });

  it('no match returns empty', () => {
    const m = new BM25Matcher();
    m.build([
      { id: '1', imageId: 'img-fog', text: 'sis' },
    ]);
    const res = m.search('araba');
    expect(res).toEqual([]);
  });

  it('deduplicates image ids (same image matched by multiple docs)', () => {
    const m = new BM25Matcher();
    m.build([
      { id: '1', imageId: 'img-path', text: 'yürüyüş yolu' },
      { id: '2', imageId: 'img-path', text: 'yürüyüş patikası' }, // synonym
    ]);
    const res = m.search('yürüyüş');
    // Aynı imageId için tek sonuç
    const imagePathCount = res.filter(r => r.imageId === 'img-path').length;
    expect(imagePathCount).toBe(1);
  });
});

describe('reciprocalRankFusion', () => {
  it('merges two ranked lists with RRF', () => {
    const list1 = [
      { imageId: 'img-a', rank: 0 },
      { imageId: 'img-b', rank: 1 },
    ];
    const list2 = [
      { imageId: 'img-b', rank: 0 },
      { imageId: 'img-a', rank: 1 },
    ];

    const fused = reciprocalRankFusion([list1, list2]);
    expect(fused.length).toBe(2);
    // Her iki liste de a ve b içeriyor, farklı rank'lar → skorları toplanmalı
    const idsByScore = fused.map(f => f.imageId);
    expect(idsByScore).toContain('img-a');
    expect(idsByScore).toContain('img-b');
  });

  it('single list fallback', () => {
    const list1 = [
      { imageId: 'img-x', rank: 0 },
    ];
    const fused = reciprocalRankFusion([list1]);
    expect(fused.length).toBe(1);
    expect(fused[0].imageId).toBe('img-x');
  });

  it('empty input returns empty', () => {
    expect(reciprocalRankFusion([])).toEqual([]);
    expect(reciprocalRankFusion([[], []])).toEqual([]);
  });
});
