import { NextRequest, NextResponse } from 'next/server';

/**
 * Gemini ses-metin API proxy.
 * Audio chunk alır, Gemini API'ye gönderir, transkript döndürür.
 * TODO: Gemini Live Audio API entegrasyonu
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get('audio') as Blob | null;
    const lang = formData.get('lang') as string | null;

    if (!audio) {
      return NextResponse.json(
        { error: 'Missing audio data' },
        { status: 400 }
      );
    }

    // TODO: Gemini Live Audio API ile ses-metin çevirisi
    // Şu an placeholder yanıt döndürüyoruz
    // Gerçek implementasyon için Gemini'nin audio processing endpoint'i kullanılacak

    return NextResponse.json({
      text: '',
      confidence: 0,
      lang: lang ?? 'tr-TR',
    });
  } catch (error) {
    console.error('Speech API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
