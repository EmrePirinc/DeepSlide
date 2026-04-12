// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Test için fixture-backed embedder. Vitest+jsdom ortamında Transformers.js
 * ve WebGPU çalışmaz — onun yerine scripts/generate-embedding-fixtures.mjs
 * tarafından Node'da bir kez encode edilen vektörleri JSON'dan yükler.
 *
 * Test K kategorisi vakalarının her query ve passage'ı için fixture'da
 * vektör olmalıdır. Yoksa `embedQuery` / `embedPassage` Error fırlatır —
 * testler bu durumu yakalayıp fallback davranışını doğrular.
 */

import fixtures from './fixtures/mE5-embeddings.json' with { type: 'json' };
import type { Embedder } from '../embedder';

interface Fixtures {
  model: string;
  dtype: string;
  dim: number;
  queries: Record<string, number[]>;
  passages: Record<string, number[]>;
}

const F = fixtures as Fixtures;

function toFloat32(arr: number[]): Float32Array {
  return new Float32Array(arr);
}

export class FixtureEmbedder implements Embedder {
  isReady(): boolean {
    return true;
  }

  async embedQuery(text: string): Promise<Float32Array> {
    const vec = F.queries[text];
    if (!vec) {
      throw new Error(`FixtureEmbedder: query "${text}" not in fixture`);
    }
    return toFloat32(vec);
  }

  async embedPassage(text: string): Promise<Float32Array> {
    const vec = F.passages[text];
    if (!vec) {
      throw new Error(`FixtureEmbedder: passage "${text}" not in fixture`);
    }
    return toFloat32(vec);
  }
}
