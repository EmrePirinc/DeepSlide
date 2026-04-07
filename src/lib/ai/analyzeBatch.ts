import type { PresentationImage, AIProviderType, Keyword } from '@/types/presentation';
import type { AnalysisResult } from './types';
import { createAnalysisProvider } from './providerFactory';
import { resizeImage, blobToBase64 } from '@/lib/utils/imageProcessing';
import { getImageBlob } from '@/lib/db/images';

const MAX_RETRIES = 3;

// Yerel modeller için küçük görsel göndermek yeterli ve çok daha hızlı
const ANALYSIS_WIDTH_LOCAL = 512;  // Yerel model: 512px (hız için)
const ANALYSIS_WIDTH_API = 1024;   // Cloud API: 1024px (kalite için)

const PROVIDER_CONFIG: Record<string, { concurrency: number; delayMs: number; backoffMs: number; imageWidth: number }> = {
  gemini: {
    concurrency: 2,
    delayMs: 4000,
    backoffMs: 4000,
    imageWidth: ANALYSIS_WIDTH_API,
  },
  qwen: {
    concurrency: 2,       // Qwen 9B hafif, 2 paralel kaldırır
    delayMs: 200,
    backoffMs: 1000,
    imageWidth: ANALYSIS_WIDTH_LOCAL,
  },
  gemma: {
    concurrency: 2,       // Gemma E2B hafif, 2 paralel çalışır
    delayMs: 200,
    backoffMs: 1000,
    imageWidth: ANALYSIS_WIDTH_LOCAL,
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
  shouldAbort?: () => boolean
): Promise<void> {
  const provider = createAnalysisProvider(providerType, language);
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

          const isRateLimit = lastError.includes('429') || lastError.includes('RESOURCE_EXHAUSTED');
          const delay = isRateLimit
            ? config.backoffMs * Math.pow(3, attempt)
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
    synonyms: [],
  }));
}
