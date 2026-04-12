// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

export interface WizardSlide {
  order: number;
  title: string;
  keywords: string[];
  speakerNote: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }

    const { topic, slideCount = 6, language = 'tr' } = await request.json() as {
      topic: string;
      slideCount?: number;
      language?: string;
    };

    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return NextResponse.json({ error: 'topic gerekli (min 3 karakter)' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const langLabel = language === 'tr' ? 'Türkçe' : 'İngilizce';
    const prompt = `Sen bir sunum uzmanısın. "${topic.trim()}" konusunda ${slideCount} slaytlık bir sunum taslağı oluştur.

Her slayt için şunları ver:
- title: Slaytın başlığı (${langLabel}, max 6 kelime)
- keywords: Konuşmacının bu slayttaki konuşmasında geçmesi gereken 5 anahtar kelime (${langLabel} tekil kelime veya kısa ifade)
- speakerNote: Konuşmacı için kısa not (${langLabel}, max 2 cümle)

Sadece JSON dizisi döndür (markdown/açıklama yok):
[
  {"order": 0, "title": "...", "keywords": ["...", "...", "...", "...", "..."], "speakerNote": "..."},
  ...
]`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const raw = response.text ?? '';
    let slides: WizardSlide[] = [];

    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : raw;
      slides = JSON.parse(jsonStr) as WizardSlide[];
    } catch {
      return NextResponse.json({ error: 'Gemini yanıtı ayrıştırılamadı', raw }, { status: 500 });
    }

    // Validate and sanitize
    const sanitized: WizardSlide[] = slides.slice(0, slideCount).map((s, i) => ({
      order: i,
      title: String(s.title ?? `Slayt ${i + 1}`).slice(0, 60),
      keywords: (Array.isArray(s.keywords) ? s.keywords : []).slice(0, 5).map(String),
      speakerNote: String(s.speakerNote ?? '').slice(0, 200),
    }));

    return NextResponse.json({ slides: sanitized });
  } catch (err) {
    console.error('[wizard/generate]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bilinmeyen hata' },
      { status: 500 },
    );
  }
}
