// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * POST /api/pptx/convert
 *
 * Multipart form data:
 *   - file: .pptx binary
 *
 * ConvertAPI'ye yüklenir, PPTX → PNG dönüşümü yapılır, dosya URL'leri döner.
 * Dosya limiti: 50MB (Vercel Serverless body limit).
 *
 * KVKK: Dosya Avrupa endpoint'i üzerinden ConvertAPI sunucularına gider,
 * dönüşüm sonrası 24 saat içinde silinir (ConvertAPI DPA).
 */

import { NextRequest, NextResponse } from 'next/server';
import ConvertAPI from 'convertapi';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 dakika — büyük deck'ler için

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  const secret = process.env.CONVERTAPI_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'ConvertAPI yapılandırılmamış. CONVERTAPI_SECRET env var eksik.' },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    return NextResponse.json(
      { error: 'Form data okunamadı', detail: String(err) },
      { status: 400 },
    );
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "'file' alanı eksik veya geçersiz" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: 'Dosya boş' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(1)} MB). Maks ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
      { status: 413 },
    );
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith('.pptx') && !name.endsWith('.ppt')) {
    return NextResponse.json({ error: 'Desteklenmeyen format (yalnızca .pptx/.ppt)' }, { status: 415 });
  }

  try {
    const convertapi = new ConvertAPI(secret, {
      conversionTimeout: 240,
      uploadTimeout: 120,
      downloadTimeout: 120,
    });

    // File → Node Readable stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // 1) ConvertAPI'ye yükle
    const uploadResult = await convertapi.upload(stream, file.name);

    // 2) PPTX → PNG dönüşümü (slayt başına 1 PNG)
    const fromFormat = name.endsWith('.pptx') ? 'pptx' : 'ppt';
    const result = await convertapi.convert(
      'png',
      {
        File: uploadResult,
        // ScaleProportions default, OutputFormat png, 150 DPI yaklaşık
      },
      fromFormat,
    );

    const files = result.files.map((f) => ({
      url: f.url,
      fileName: f.fileName,
      fileSize: f.fileSize,
    }));

    return NextResponse.json({
      files,
      slideCount: files.length,
      cost: result.conversionCost,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[pptx/convert] Hata:', message);
    return NextResponse.json(
      { error: 'Dönüşüm başarısız', detail: message },
      { status: 500 },
    );
  }
}
