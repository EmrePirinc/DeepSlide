// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { getImageAnalysisPrompt, type AnalysisLanguage } from '@/lib/ai/prompts';
import { parseAnalysisResponse } from '@/lib/ai/parser';

// SDK yerine direkt REST API: europe-west1 bölgesel routing sorununu bypass eder
// HIZ ÖNCELİKLİ FALLBACK ZİNCİRİ (en hızlıdan en yavaşa):
// 1. gemini-2.0-flash         → 0.53s TTFT, 169 t/s (en hızlı)
// 2. gemini-2.5-flash-lite    → çok hızlı, yüksek kota (15 RPM free)
// 3. gemini-2.5-flash         → kaliteli ama yavaş
// 4. gemini-1.5-flash         → son çare fallback
// NOT: gemini-2.0-flash yeni kullanıcılara kapatıldı (404) — çıkarıldı
const MODEL_FALLBACK_CHAIN = [
  'gemini-2.5-flash-lite',                 // Hızlı + yüksek kota
  'gemini-2.5-flash',                      // Kaliteli fallback
  'gemini-flash-latest',                   // Google'ın latest alias'ı
  'gemini-1.5-flash',                      // Son çare
];

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: { code: number; message: string; status: string };
}

async function callGeminiREST(
  apiKey: string,
  model: string,
  contents: object[],
): Promise<{ text: string; model: string }> {
  const url = `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      // Hız optimizasyonu: düşük token limit + düşük temperature
      generationConfig: {
        maxOutputTokens: 256,       // 8192 → 256: %97 daha az token
        temperature: 0.1,           // 1.0 → 0.1: Deterministik, hızlı
        topP: 0.8,
        topK: 10,
        responseMimeType: 'application/json', // JSON mode → parse hızlı
      },
    }),
  });

  const data = await res.json() as GeminiResponse;

  if (!res.ok) {
    const msg = data.error?.message ?? `HTTP ${res.status}`;
    const err = Object.assign(new Error(msg), { status: res.status, data });
    throw err;
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return { text, model };
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('429') ||
      error.message.includes('Quota exceeded') ||
      error.message.includes('RESOURCE_EXHAUSTED') ||
      error.message.includes('RATE_LIMIT_EXCEEDED')
    );
  }
  const e = error as { status?: number };
  return e?.status === 429;
}

/** Model mevcut değil / erişim yok — fallback chain'de sıradakine geç */
function isModelUnavailableError(error: unknown): boolean {
  const e = error as { status?: number; message?: string };
  if (e?.status === 404 || e?.status === 403) return true;
  if (error instanceof Error) {
    return (
      error.message.includes('no longer available') ||
      error.message.includes('NOT_FOUND') ||
      error.message.includes('not found') ||
      error.message.includes('PERMISSION_DENIED')
    );
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const { imageBase64, mimeType, language, keywordCount } = await request.json();
    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Missing imageBase64 or mimeType' }, { status: 400 });
    }

    const prompt = getImageAnalysisPrompt((language as AnalysisLanguage) ?? 'tr', keywordCount ?? 3);

    const contents = [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
        ],
      },
    ];

    let lastError: unknown;
    for (const model of MODEL_FALLBACK_CHAIN) {
      try {
        const { text, model: usedModel } = await callGeminiREST(apiKey, model, contents);
        console.log(`[analyze] ✓ Model: ${usedModel}`);
        const result = parseAnalysisResponse(text);
        return NextResponse.json({ ...result, _model: usedModel });
      } catch (err) {
        lastError = err;
        if (isRateLimitError(err)) {
          console.warn(`[analyze] ${model} → 429, sıradaki modele geçiliyor...`);
          continue;
        }
        if (isModelUnavailableError(err)) {
          console.warn(`[analyze] ${model} → mevcut değil (404/403), sıradaki modele geçiliyor...`);
          continue;
        }
        throw err;
      }
    }

    // Tüm modeller başarısız
    throw lastError;
  } catch (error) {
    console.error('[analyze] Hata:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = isRateLimitError(error) ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
