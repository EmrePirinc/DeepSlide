// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * POST /api/pptx/convert
 *
 * Multipart form data: file (.pptx/.ppt binary)
 *
 * CloudConvert job oluşturur: import/upload → convert → export/url.
 * Free tier: 25 dönüşüm dakikası/gün (her gün yenilenir).
 * KVKK: Avrupa bölgesi (region: 'eu-central'), dosya 24h içinde silinir.
 */

import { NextRequest, NextResponse } from 'next/server';
import CloudConvert from 'cloudconvert';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const maxDuration = 300;

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const apiKey = process.env.CLOUDCONVERT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'CloudConvert yapılandırılmamış. CLOUDCONVERT_API_KEY env var eksik.' },
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
    return NextResponse.json({ error: "'file' alanı eksik" }, { status: 400 });
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
    return NextResponse.json({ error: 'Desteklenmeyen format' }, { status: 415 });
  }

  try {
    const cloudConvert = new CloudConvert(apiKey);

    // 1) Job oluştur
    const job = await cloudConvert.jobs.create({
      tasks: {
        'upload-pptx': {
          operation: 'import/upload',
        },
        'convert-to-png': {
          operation: 'convert',
          input: ['upload-pptx'],
          input_format: name.endsWith('.pptx') ? 'pptx' : 'ppt',
          output_format: 'png',
          // Her slayt ayrı PNG olarak üretilir (CloudConvert default davranışı)
          pixel_density: 150,
          engine: 'office',
        },
        'export-png': {
          operation: 'export/url',
          input: ['convert-to-png'],
          inline: false,
          archive_multiple_files: false,
        },
      },
    });

    // 2) Upload task'ını bul ve dosyayı yükle
    const uploadTask = job.tasks.find((t) => t.name === 'upload-pptx');
    if (!uploadTask) {
      throw new Error('Upload task bulunamadı');
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);
    await cloudConvert.tasks.upload(uploadTask, stream, file.name, buffer.length);

    // 3) Job'un bitmesini bekle
    const finishedJob = await cloudConvert.jobs.wait(job.id);

    // 4) Export URL'lerini al
    const files = cloudConvert.jobs.getExportUrls(finishedJob);
    if (!files || files.length === 0) {
      throw new Error('Export dosyaları bulunamadı');
    }

    // Slayt numarasına göre sırala (filename içindeki index'i çıkar)
    const sorted = [...files].sort((a, b) => {
      const ai = extractSlideNumber(a.filename);
      const bi = extractSlideNumber(b.filename);
      return ai - bi;
    });

    return NextResponse.json({
      files: sorted.map((f) => ({
        url: f.url,
        fileName: f.filename,
        fileSize: f.size ?? 0,
      })),
      slideCount: sorted.length,
      cost: 0, // CloudConvert free tier
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

/** Dosya adından slayt numarasını çıkar (örn: 'file.pptx.0.png' → 0, 'slide-1.png' → 1) */
function extractSlideNumber(filename: string): number {
  const m = filename.match(/(\d+)(?=\.[a-z]+$)/i);
  return m ? parseInt(m[1], 10) : 0;
}
