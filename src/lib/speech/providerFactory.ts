// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { SpeechProviderType } from '@/types/presentation';
import type { SpeechProviderInterface } from './types';
import { WebSpeechAdapter } from './providers/webSpeechAdapter';
import { GeminiSpeechAdapter } from './providers/geminiSpeechAdapter';
import { WhisperAdapter } from './providers/whisperAdapter';

export function createSpeechProvider(
  type: SpeechProviderType
): SpeechProviderInterface {
  switch (type) {
    case 'webSpeech':
      return new WebSpeechAdapter();
    case 'gemini':
      return new GeminiSpeechAdapter();
    case 'whisper':
      return new WhisperAdapter();
    default:
      return new WebSpeechAdapter();
  }
}

/**
 * Çevrimdışıysa uygun provider'a fallback yapar.
 */
export function getSpeechProviderWithFallback(
  preferred: SpeechProviderType
): SpeechProviderInterface {
  const provider = createSpeechProvider(preferred);

  if (provider.isAvailable()) {
    return provider;
  }

  // Fallback zinciri: preferred → webSpeech → whisper
  if (preferred !== 'webSpeech') {
    const webSpeech = new WebSpeechAdapter();
    if (webSpeech.isAvailable()) return webSpeech;
  }

  if (preferred !== 'whisper') {
    const whisper = new WhisperAdapter();
    if (whisper.isAvailable()) return whisper;
  }

  // Hiçbiri yoksa yine de web speech döndür (hata mesajı verecek)
  return new WebSpeechAdapter();
}
