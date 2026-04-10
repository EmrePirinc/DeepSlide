// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getAdminAuth } from '@/lib/firebase/admin';

const QUIZ_TIMEOUT_MS = 10_000;

function buildQuizPrompt(keywords: string[], imageDescription?: string): string {
  const context = imageDescription
    ? `Slayt açıklaması: ${imageDescription}\n`
    : '';
  return `${context}Anahtar kelimeler: ${keywords.join(', ')}

Bu slayt içeriğine dayalı 1-3 adet Türkçe çoktan seçmeli soru oluştur.

ÇIKTI FORMATI (JSON dizisi):
[
  {
    "text": "Soru metni?",
    "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"],
    "correct": 0
  }
]

Kurallar:
- Her soru için tam olarak 4 seçenek
- "correct" = doğru seçeneğin indeksi (0-3)
- Sorular açık ve anlaşılır olmalı
- Yalnızca JSON dizisi döndür`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await getAdminAuth().verifyIdToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { imageId, keywords, imageDescription } = await request.json();
  if (!imageId || !Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: 'imageId ve keywords gerekli' }, { status: 400 });
  }

  const prompt = buildQuizPrompt(keywords, imageDescription);
  const ai = new GoogleGenAI({ apiKey });

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), QUIZ_TIMEOUT_MS)
  );

  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
      timeout,
    ]);

    const text = response.text ?? '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('Invalid response format');

    const questions = JSON.parse(jsonMatch[0]) as Array<{
      text: string;
      options: string[];
      correct: number;
    }>;

    // Validate
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions generated');
    }

    return NextResponse.json({ imageId, questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'TIMEOUT') {
      return NextResponse.json({ error: 'Soru üretme zaman aşımına uğradı' }, { status: 408 });
    }
    console.error('Quiz generation error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
