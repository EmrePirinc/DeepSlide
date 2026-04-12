// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { getImageAnalysisPrompt, type AnalysisLanguage } from '@/lib/ai/prompts';
import { parseAnalysisResponse } from '@/lib/ai/parser';

const OLLAMA_BASE = 'http://localhost:11434';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType, language, keywordCount, model } = await request.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Missing imageBase64 or mimeType' }, { status: 400 });
    }

    const modelId = model || 'gemma4:e2b-it-q4_K_M';
    const prompt = getImageAnalysisPrompt((language as AnalysisLanguage) ?? 'tr', keywordCount ?? 3);

    // Ollama'nın çalışıp çalışmadığını kontrol et
    try {
      const versionRes = await fetch(`${OLLAMA_BASE}/api/version`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!versionRes.ok) throw new Error('Ollama not running');
    } catch {
      return NextResponse.json(
        { error: 'Ollama çalışmıyor. DeepSlide Local AI uygulamasını başlatın.' },
        { status: 503 }
      );
    }

    // Ollama chat API ile vision analizi
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: prompt,
            images: [imageBase64],
          },
        ],
        stream: false,
        options: { temperature: 0.1 },
        format: 'json',
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Ollama API error (${res.status}): ${errText}` },
        { status: res.status }
      );
    }

    const data = (await res.json()) as { message?: { content: string } };
    const rawText = data.message?.content ?? '';

    console.log(`[analyze-ollama] ✓ Model: ${modelId}`);

    const result = parseAnalysisResponse(rawText);
    return NextResponse.json({ ...result, _model: modelId });
  } catch (error) {
    console.error('[analyze-ollama] Hata:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
