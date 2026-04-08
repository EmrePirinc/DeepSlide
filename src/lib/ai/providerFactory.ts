// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { AIProviderType } from '@/types/presentation';
import type { ImageAnalysisProvider } from './types';

class ClientAnalysisProvider implements ImageAnalysisProvider {
  name: string;
  private endpoint: string;
  private language: string;
  private keywordCount: number;

  constructor(name: string, endpoint: string, language: string = 'tr', keywordCount: number = 3) {
    this.name = name;
    this.endpoint = endpoint;
    this.language = language;
    this.keywordCount = keywordCount;
  }

  async analyzeImage(imageBase64: string, mimeType: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000); // 2dk timeout

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        mimeType,
        language: this.language,
        keywordCount: this.keywordCount,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${this.name} API error (${response.status}): ${error}`);
    }

    return response.json();
  }
}

export function createAnalysisProvider(
  provider: AIProviderType,
  language: string = 'tr',
  keywordCount: number = 3
): ImageAnalysisProvider {
  switch (provider) {
    case 'gemini':
      return new ClientAnalysisProvider('Gemini', '/api/analyze', language, keywordCount);
    case 'qwen':
      return new ClientAnalysisProvider('Qwen', '/api/analyze-qwen', language, keywordCount);
    case 'gemma':
      return new ClientAnalysisProvider('Gemma4', '/api/analyze-gemma', language, keywordCount);
    default:
      return new ClientAnalysisProvider('Gemini', '/api/analyze', language, keywordCount);
  }
}
