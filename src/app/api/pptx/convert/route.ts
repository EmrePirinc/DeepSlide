// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * POST /api/pptx/convert
 *
 * İki mod:
 *   1. action=create (body: { fileName, fileSize })
 *      → CloudConvert job oluşturur, upload form URL'ini istemciye döner.
 *        İstemci dosyayı direkt CloudConvert'e yükler (Vercel 4.5MB limit'i bypass).
 *   2. action=wait (body: { jobId })
 *      → Job'un bitmesini bekler, export URL'lerini döner.
 *
 * KVKK: CloudConvert Avrupa default, dosya 24h içinde silinir.
 */

import { NextRequest, NextResponse } from 'next/server';
import CloudConvert from 'cloudconvert';

export const runtime = 'nodejs';
export const maxDuration = 300;

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB (CloudConvert üst sınırı)

interface CreateBody {
  action: 'create';
  fileName: string;
  fileSize: number;
}

interface WaitBody {
  action: 'wait';
  jobId: string;
}

type Body = CreateBody | WaitBody;

export async function POST(req: NextRequest) {
  const apiKey = process.env.CLOUDCONVERT_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'CLOUDCONVERT_API_KEY eksik' }, { status: 500 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON body' }, { status: 400 });
  }

  const cloudConvert = new CloudConvert(apiKey);

  if (body.action === 'create') {
    // Validasyon
    if (!body.fileName || typeof body.fileSize !== 'number') {
      return NextResponse.json({ error: 'fileName/fileSize eksik' }, { status: 400 });
    }
    if (body.fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Dosya çok büyük (${(body.fileSize / 1024 / 1024).toFixed(1)} MB). Maks ${MAX_FILE_SIZE / 1024 / 1024} MB.` },
        { status: 413 },
      );
    }
    const name = body.fileName.toLowerCase();
    if (!name.endsWith('.pptx') && !name.endsWith('.ppt')) {
      return NextResponse.json({ error: 'Yalnızca .pptx/.ppt' }, { status: 415 });
    }

    try {
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

      const uploadTask = job.tasks.find((t) => t.name === 'upload-pptx');
      if (!uploadTask || !uploadTask.result?.form) {
        throw new Error('Upload form alınamadı');
      }

      return NextResponse.json({
        jobId: job.id,
        uploadForm: uploadTask.result.form, // { url, parameters }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[pptx/convert create] Hata:', message);
      return NextResponse.json({ error: 'Job oluşturulamadı', detail: message }, { status: 500 });
    }
  }

  if (body.action === 'wait') {
    if (!body.jobId) {
      return NextResponse.json({ error: 'jobId eksik' }, { status: 400 });
    }
    try {
      const finishedJob = await cloudConvert.jobs.wait(body.jobId);
      const files = cloudConvert.jobs.getExportUrls(finishedJob);
      if (!files || files.length === 0) {
        throw new Error('Export dosyaları bulunamadı');
      }
      const sorted = [...files].sort((a, b) => extractSlideNumber(a.filename) - extractSlideNumber(b.filename));
      return NextResponse.json({
        files: sorted.map((f) => ({
          url: f.url,
          fileName: f.filename,
          fileSize: f.size ?? 0,
        })),
        slideCount: sorted.length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[pptx/convert wait] Hata:', message);
      return NextResponse.json({ error: 'Dönüşüm bekleme hatası', detail: message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Bilinmeyen action' }, { status: 400 });
}

function extractSlideNumber(filename: string): number {
  const m = filename.match(/(\d+)(?=\.[a-z]+$)/i);
  return m ? parseInt(m[1], 10) : 0;
}
