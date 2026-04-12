// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Multilingual-e5-small embedding encoder — cascaded semantic rerank için.
 *
 * Mimari:
 *   - Production (browser): @xenova/transformers v3 + WebGPU/WASM fallback
 *     Model: Xenova/multilingual-e5-small (q4, ~45 MB lazy chunk)
 *   - Test (Node/vitest): fixture JSON (precomputed) + mock pipeline
 *     scripts/generate-embedding-fixtures.mjs bir kez Node'da mE5 çalıştırıp
 *     gold set kelime vektörlerini JSON'a yazar, testler bu JSON'dan okur.
 *
 * Cascaded rerank stratejisi:
 *   - Ensemble skoru [0.55, 0.80] aralığındaysa (belirsiz band) → rerank
 *   - Dışarıdaki skorlar direkt geçer, rerank çağrılmaz
 *   - Rerank sonucu: final = 0.55 × ensemble + 0.45 × embedding cosine
 *
 * Neden mE5-small:
 *   - MTEB multilingual 64.4 (Türkçe için iyi)
 *   - 384 dim → küçük, hızlı cosine
 *   - 120 MB (q8) / 45 MB (q4) — browser'da kabul edilebilir
 *
 * Neden E5 prefix convention:
 *   - query için "query: ..."
 *   - passage için "passage: ..."
 *   - E5 fine-tuning'inde bu prefixler kullanıldı, performansa gerekli
 */

/** mE5-small hidden size. */
export const EMBEDDING_DIM = 384;

/** Ensemble skorunun [lower, upper] aralığı → rerank band. */
export const UNCERTAINTY_BAND: readonly [number, number] = [0.55, 0.8];

/** Ensemble + embedding blend weights (grid-search post-hoc). */
export const RERANK_BLEND = {
  ensemble: 0.55,
  embedding: 0.45,
} as const;

/**
 * Embedder interface — production (real Transformers.js) ve test (fixture)
 * için ortak API.
 */
export interface Embedder {
  /** Query metnini encode et ve normalized vektör döndür. */
  embedQuery(text: string): Promise<Float32Array>;
  /** Passage metnini encode et. */
  embedPassage(text: string): Promise<Float32Array>;
  /** Hazır mı? (false ise yükleniyor / hata). */
  isReady(): boolean;
}

/** Cosine similarity for normalized vectors — sadece dot product. */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, dot));
}

/** İki vektörü L2 normalize eder (mE5 çıktısı zaten normalize ama garanti). */
export function l2Normalize(vec: Float32Array): Float32Array {
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm);
  if (norm === 0) return vec;
  const out = new Float32Array(vec.length);
  for (let i = 0; i < vec.length; i++) out[i] = vec[i] / norm;
  return out;
}

// ============================================================================
// Production embedder — browser lazy-load
// ============================================================================

type XenovaPipeline = (
  input: string,
  opts: { pooling: 'mean'; normalize: true },
) => Promise<{ data: Float32Array }>;

let pipelineInstance: XenovaPipeline | null = null;
let loadPromise: Promise<XenovaPipeline> | null = null;
let loadError: Error | null = null;

async function detectDevice(): Promise<'webgpu' | 'wasm'> {
  if (typeof navigator === 'undefined') return 'wasm';
  const navWithGPU = navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } };
  if (!navWithGPU.gpu) return 'wasm';
  try {
    const adapter = await navWithGPU.gpu.requestAdapter();
    return adapter ? 'webgpu' : 'wasm';
  } catch {
    return 'wasm';
  }
}

/**
 * Transformers.js pipeline'ı lazy initialize eder.
 * İlk çağrı model indirir (~45 MB q4), sonraki çağrılar cache kullanır.
 */
async function ensurePipeline(): Promise<XenovaPipeline> {
  if (pipelineInstance) return pipelineInstance;
  if (loadPromise) return loadPromise;
  if (loadError) throw loadError;

  loadPromise = (async () => {
    try {
      // Dynamic import — bundle ana chunk'a girmez, ilk kullanımda indirilir
      const transformers = await import('@xenova/transformers');
      const { pipeline, env } = transformers as unknown as {
        pipeline: (
          task: string,
          model: string,
          opts?: { dtype?: string; device?: string },
        ) => Promise<XenovaPipeline>;
        env: { useBrowserCache: boolean; allowRemoteModels: boolean };
      };

      env.useBrowserCache = true;
      env.allowRemoteModels = true;

      const device = await detectDevice();
      const dtype = device === 'webgpu' ? 'q4' : 'q8';

      const pipe = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small', {
        dtype,
        device,
      });
      pipelineInstance = pipe;
      return pipe;
    } catch (err) {
      loadError = err instanceof Error ? err : new Error(String(err));
      loadPromise = null;
      throw loadError;
    }
  })();

  return loadPromise;
}

class ProductionEmbedder implements Embedder {
  isReady(): boolean {
    return pipelineInstance !== null;
  }

  async embedQuery(text: string): Promise<Float32Array> {
    const pipe = await ensurePipeline();
    const out = await pipe(`query: ${text}`, { pooling: 'mean', normalize: true });
    return l2Normalize(new Float32Array(out.data));
  }

  async embedPassage(text: string): Promise<Float32Array> {
    const pipe = await ensurePipeline();
    const out = await pipe(`passage: ${text}`, { pooling: 'mean', normalize: true });
    return l2Normalize(new Float32Array(out.data));
  }
}

// ============================================================================
// Shared singleton + factory
// ============================================================================

let activeEmbedder: Embedder = new ProductionEmbedder();

/**
 * Test ortamında veya özel senaryoda embedder'ı değiştir.
 * Test fixture embedder'ı inject etmek için.
 */
export function setActiveEmbedder(embedder: Embedder): void {
  activeEmbedder = embedder;
}

/** Varsayılan embedder'a geri dön (production). */
export function resetEmbedder(): void {
  activeEmbedder = new ProductionEmbedder();
}

/** Şu anki aktif embedder'ı döndür — keywordMatcher bunu kullanır. */
export function getEmbedder(): Embedder {
  return activeEmbedder;
}

/**
 * Manuel prefetch tetikleyici — sunum açıldığında background download.
 * Blocking değil, hata fırlatmaz.
 */
export function prefetchEmbedder(): void {
  ensurePipeline().catch((err) => {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[embedder] prefetch failed', err);
    }
  });
}
