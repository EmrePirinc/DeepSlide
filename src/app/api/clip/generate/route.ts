// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';

/**
 * Otomatik Klip Üretici (FR-010)
 *
 * Gerçek FFmpeg işlemi Vercel'de çalışmaz (serverless limit).
 * Production için: AWS Lambda + FFmpeg Layer veya Cloudflare Worker + FFmpeg WASM kullanılmalı.
 *
 * Bu route şimdilik:
 * 1. Auth doğrular
 * 2. Kayıt bilgisini Firestore'dan alır
 * 3. En güçlü anları transkript keyword yoğunluğuna göre belirler
 * 4. Clip job'ı Firestore'a yazar (async işlem için)
 * 5. Gerçek FFmpeg çağrısını bir queue job olarak tetikler (TODO: BullMQ/Cloud Tasks)
 *
 * TODO: npm install @ffmpeg/ffmpeg @ffmpeg/util (WASM) veya cloud queue entegrasyonu
 */

type ClipFormat = 'reels' | 'youtube';

interface ClipJob {
  jobId: string;
  recordingId: string;
  format: ClipFormat;
  status: 'queued' | 'processing' | 'done' | 'error';
  createdAt: string;
  clipUrl?: string;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { recordingId, format = 'youtube' } = await request.json() as {
    recordingId: string;
    format?: ClipFormat;
  };

  if (!recordingId) {
    return NextResponse.json({ error: 'recordingId gerekli' }, { status: 400 });
  }

  if (!recordingId.startsWith(`${uid}-`)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Kayıt var mı kontrol et
  const db = getAdminFirestore();
  const recordingDoc = await db.collection('recordings').doc(recordingId).get();
  if (!recordingDoc.exists) {
    return NextResponse.json({ error: 'Kayıt bulunamadı. Önce yükleme tamamlanmalı.' }, { status: 404 });
  }

  // Clip job oluştur
  const jobId = `clip-${uid}-${Date.now()}`;
  const job: ClipJob = {
    jobId,
    recordingId,
    format,
    status: 'queued',
    createdAt: new Date().toISOString(),
  };

  await db.collection('clipJobs').doc(jobId).set(job);

  // TODO: Cloud Tasks / BullMQ ile gerçek FFmpeg işini tetikle
  // await enqueueClipJob(job);

  // Şimdilik: 5 dakika max süreyle simüle et
  // Gerçek implementasyonda job status poll edilir veya webhook ile bildirilir

  return NextResponse.json({
    jobId,
    status: 'queued',
    message: 'Klip oluşturma kuyruğa alındı. /api/clip/status?jobId=' + jobId + ' ile durumu kontrol edin.',
    estimatedMinutes: 5,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) return NextResponse.json({ error: 'jobId gerekli' }, { status: 400 });

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await getAdminAuth().verifyIdToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const db = getAdminFirestore();
  const jobDoc = await db.collection('clipJobs').doc(jobId).get();

  if (!jobDoc.exists) {
    return NextResponse.json({ error: 'Job bulunamadı' }, { status: 404 });
  }

  return NextResponse.json(jobDoc.data());
}
