// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { PresentationImage, AIProviderType, Keyword } from '@/types/presentation';
import type { AnalysisResult } from './types';
import { createAnalysisProvider } from './providerFactory';
import { resizeImage, blobToBase64 } from '@/lib/utils/imageProcessing';
import { getImageBlob } from '@/lib/db/images';

const MAX_RETRIES = 2;  // 3 → 2: Hızlı fail, hızlı retry

// 1024 → 512: %75 daha az data, %400 hızlı upload
// Keyword çıkarma için 512px yeterli (Gemini vision)
const ANALYSIS_WIDTH_API = 512;

const PROVIDER_CONFIG: Record<string, { concurrency: number; delayMs: number; backoffMs: number; rateLimitBackoffMs: number; imageWidth: number }> = {
  gemini: {
    concurrency: 5,       // 1 → 5: Paralel işlem (5 görsel aynı anda)
    delayMs: 0,           // 5000 → 0: Paralel olduğu için gereksiz
    backoffMs: 2000,      // 4000 → 2000: Hızlı retry
    rateLimitBackoffMs: 30000, // 65s → 30s: Daha agresif recovery
    imageWidth: ANALYSIS_WIDTH_API,
  },
  ollama: {
    concurrency: 3,       // 1 → 3: Yerel GPU'yu daha iyi kullan
    delayMs: 0,
    backoffMs: 1000,
    rateLimitBackoffMs: 3000,
    imageWidth: ANALYSIS_WIDTH_API,
  },
};

export interface BatchProgress {
  imageId: string;
  status: 'analyzing' | 'completed' | 'failed';
  result?: AnalysisResult;
  error?: string;
}

export async function analyzeBatch(
  images: PresentationImage[],
  providerType: AIProviderType,
  onProgress: (progress: BatchProgress) => void,
  language: string = 'tr',
  shouldAbort?: () => boolean,
  ollamaModel?: string
): Promise<void> {
  const provider = createAnalysisProvider(providerType, language, 3, ollamaModel);
  const config = PROVIDER_CONFIG[providerType] ?? PROVIDER_CONFIG.gemini;
  const queue = [...images];

  const processNext = async () => {
    while (queue.length > 0) {
      if (shouldAbort?.()) return;

      const image = queue.shift();
      if (!image) break;

      onProgress({ imageId: image.id, status: 'analyzing' });

      let lastError: string | undefined;
      let success = false;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const blob = await getImageBlob(image.blobKey);
          if (!blob) throw new Error('Image blob not found');

          const file = new File([blob], image.fileName, { type: image.mimeType });
          const resized = await resizeImage(file, config.imageWidth);
          const base64 = await blobToBase64(resized);

          const result = await provider.analyzeImage(base64, 'image/jpeg');

          onProgress({ imageId: image.id, status: 'completed', result });
          success = true;
          break;
        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Unknown error';

          const isPermanentError =
            lastError.includes('not configured') ||
            lastError.includes('401') ||
            lastError.includes('403');
          if (isPermanentError) break;

          const isRateLimit = lastError.includes('429') || lastError.includes('RESOURCE_EXHAUSTED') || lastError.includes('Quota exceeded');
          const delay = isRateLimit
            ? config.rateLimitBackoffMs  // flat 65s wait — quota resets after 1 min
            : config.backoffMs * Math.pow(2, attempt);

          if (attempt < MAX_RETRIES - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      if (!success) {
        onProgress({
          imageId: image.id,
          status: 'failed',
          error: lastError,
        });
      }

      if (success && queue.length > 0 && config.delayMs > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.delayMs)
        );
      }
    }
  };

  const workers = Array.from({ length: config.concurrency }, () => processNext());
  await Promise.all(workers);
}

export function analysisResultToKeywords(result: AnalysisResult): Keyword[] {
  return result.keywords.map((kw) => ({
    id: crypto.randomUUID(),
    text: kw.text,
    confidence: kw.confidence,
    category: kw.category,
    isUserEdited: false,
    synonyms: kw.synonyms ?? [],
    forms: kw.forms,
    confusability: kw.confusability,
    negatives: kw.negatives,
    isHint: kw.isHint,
  }));
}
