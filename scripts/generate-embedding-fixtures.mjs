// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Tek seferlik script: gold set K kategorisindeki tüm terim ve keyword'leri
 * mE5-small ile encode edip fixture JSON'a yazar. Bu fixture test'lerde
 * mock embedder'a injectlenir — testler WebGPU veya model download gerektirmez.
 *
 * Kullanım:
 *   node scripts/generate-embedding-fixtures.mjs
 *
 * Çıktı:
 *   src/lib/speech/__tests__/fixtures/mE5-embeddings.json
 *
 * İlk çalıştırmada ~45 MB model indirir (bir kez), ~30 saniye. Sonraki
 * çağrılarda Hugging Face cache'i kullanır, <5 saniye.
 */

import { pipeline, env } from '@xenova/transformers';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// __dirname polyfill for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Node ortamında model cache'i proje içinde tutalım
env.cacheDir = join(__dirname, '..', '.transformers-cache');
env.allowRemoteModels = true;
env.useBrowserCache = false;

/**
 * K kategori + ilgili test vakaları için encode edilecek terimler.
 * Her terim hem "query: ..." hem "passage: ..." olarak embed edilir
 * (E5 convention).
 */
const TERMS = [
  // K1
  'araba', 'ev', 'otomobil',
  // K2 (revised): laptop ↔ bilgisayar
  'bilgisayar', 'araba', 'laptop',
  // K3
  'kitap', 'telefon', 'roman',
  // K4 (revised): gül ↔ çiçek
  'çiçek', 'araba', 'gül',
  // K5
  'müzik', 'resim', 'şarkı',
  // K6
  'köpek', 'kedi', 'kuçu',
  // K7
  'kış', 'yaz', 'soğuk',
  // K8
  'yemek', 'içecek', 'lezzetli',
];

/** Test cümleleri (query olarak encode edilir). */
const QUERIES = [
  'otomobil geldi',
  'laptop aldım',
  'roman okudum',
  'gül kırmızı',
  'şarkı çalıyor',
  'kuçu kuçu',
  'soğuk hava',
  'lezzetli bir şey',
];

async function main() {
  console.log('[fixtures] Loading Xenova/multilingual-e5-small (q8)...');
  const pipe = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small', {
    dtype: 'q8',
  });
  console.log('[fixtures] Model loaded.');

  const queries = {};
  const passages = {};

  for (const term of TERMS) {
    const out = await pipe(`passage: ${term}`, { pooling: 'mean', normalize: true });
    passages[term] = Array.from(out.data);
  }
  console.log(`[fixtures] Encoded ${TERMS.length} passages.`);

  for (const query of QUERIES) {
    const out = await pipe(`query: ${query}`, { pooling: 'mean', normalize: true });
    queries[query] = Array.from(out.data);
  }
  console.log(`[fixtures] Encoded ${QUERIES.length} queries.`);

  const outDir = join(__dirname, '..', 'src', 'lib', 'speech', '__tests__', 'fixtures');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'mE5-embeddings.json');
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        model: 'Xenova/multilingual-e5-small',
        dtype: 'q8',
        dim: passages[TERMS[0]]?.length ?? 0,
        queries,
        passages,
      },
      null,
      2,
    ),
  );
  console.log(`[fixtures] Saved to ${outPath}`);
}

main().catch((err) => {
  console.error('[fixtures] FAILED:', err);
  process.exit(1);
});
