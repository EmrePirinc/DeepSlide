import { NextRequest, NextResponse } from 'next/server';
import { getImageAnalysisPrompt, type AnalysisLanguage } from '@/lib/ai/prompts';
import { parseAnalysisResponse } from '@/lib/ai/parser';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const GEMMA_MODEL = process.env.GEMMA_MODEL ?? 'gemma4:e2b';

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType, language, keywordCount } = await request.json();
    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: 'Missing imageBase64 or mimeType' },
        { status: 400 }
      );
    }

    const prompt = getImageAnalysisPrompt((language as AnalysisLanguage) ?? 'tr', keywordCount ?? 3);

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: GEMMA_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
            images: [imageBase64],
          },
        ],
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 1024,
          num_ctx: 4096,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemma4 Ollama error:', error);
      return NextResponse.json(
        { error: `Gemma4 error (${response.status}): ${error}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text = data.message?.content ?? '';
    const result = parseAnalysisResponse(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Gemma4 local analysis error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { error: 'Ollama çalışmıyor. "ollama serve" komutunu çalıştırın.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
