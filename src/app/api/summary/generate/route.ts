// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getAdminAuth } from '@/lib/firebase/admin';
import type { TranscriptEntry } from '@/stores/transcriptStore';

const SUMMARY_TIMEOUT_MS = 30_000;

function buildPrompt(transcript: string, slideTimestamps: number[]): string {
  const slideTimesStr = slideTimestamps
    .map((ts, i) => `Slayt ${i + 1}: ${new Date(ts).toISOString()}`)
    .join('\n');

  return `Sen profesyonel bir sunum koçusun. Aşağıdaki sunum transkriptini analiz et ve Türkçe özet çıkar.

SLAYT GEÇİŞ ZAMANLARI:
${slideTimesStr}

TRANSKRİPT:
${transcript}

ÇIKTI FORMATI (JSON):
{
  "summary": ["madde 1", "madde 2", "madde 3", "madde 4 (opsiyonel)", "madde 5 (opsiyonel)"],
  "actionItems": ["aksiyon 1", "aksiyon 2", "aksiyon 3"]
}

Kurallar:
- Özet: 3-5 madde, her madde 1-2 cümle
- Aksiyon listesi: somut, ölçülebilir adımlar
- Yalnızca JSON döndür, başka metin ekleme`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
  }

  // Auth kontrolü
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const token = authHeader.slice(7);
    const auth = getAdminAuth();
    await auth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  let body: { transcript: TranscriptEntry[]; slideTimestamps: number[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { transcript, slideTimestamps } = body;

  if (!Array.isArray(transcript) || transcript.length === 0) {
    return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
  }

  const wordCount = transcript.reduce((sum, e) => sum + e.text.split(/\s+/).filter(Boolean).length, 0);
  if (wordCount < 100) {
    return NextResponse.json({ error: 'Yetersiz içerik (en az 100 kelime gerekli)' }, { status: 400 });
  }

  const transcriptText = transcript.map((e) => e.text).join(' ');
  const prompt = buildPrompt(transcriptText, slideTimestamps ?? []);

  const ai = new GoogleGenAI({ apiKey });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), SUMMARY_TIMEOUT_MS)
  );

  try {
    const geminiPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = await Promise.race([geminiPromise, timeoutPromise]);
    const text = response.text ?? '';

    // JSON parse
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid Gemini response format');

    const parsed = JSON.parse(jsonMatch[0]) as { summary: string[]; actionItems: string[] };
    if (!Array.isArray(parsed.summary) || !Array.isArray(parsed.actionItems)) {
      throw new Error('Invalid response structure');
    }

    return NextResponse.json({ summary: parsed.summary, actionItems: parsed.actionItems });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'TIMEOUT') {
      return NextResponse.json({ error: 'Özet oluşturma zaman aşımına uğradı. Tekrar deneyin.' }, { status: 408 });
    }
    console.error('Summary generation error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
