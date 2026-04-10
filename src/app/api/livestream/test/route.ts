// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase/admin';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const TEST_DURATION_MS = 5000;
const ENCRYPTION_KEY = process.env.STREAM_KEY_ENCRYPTION_KEY ?? 'deepslide_default_32byte_key_!!!!';
const IV_LENGTH = 16;

function encryptStreamKey(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptStreamKey(encrypted: string): string {
  const [ivHex, dataHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const data = Buffer.from(dataHex, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

function maskStreamKey(key: string): string {
  if (key.length <= 8) return '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
}

async function testRtmpConnection(rtmpUrl: string, streamKey: string): Promise<{ success: boolean; latencyMs?: number; error?: string }> {
  // Simülasyon: gerçek LiveKit Ingress test bağlantısı kurulur
  // Production'da: LiveKit SDK ile test stream başlatılır
  const start = Date.now();
  await new Promise((r) => setTimeout(r, TEST_DURATION_MS));

  // RTMP URL format kontrolü
  if (!rtmpUrl.startsWith('rtmp://') && !rtmpUrl.startsWith('rtmps://')) {
    return { success: false, error: 'Geçersiz RTMP URL formatı. rtmp:// veya rtmps:// ile başlamalı.' };
  }
  if (!streamKey || streamKey.length < 4) {
    return { success: false, error: 'Geçersiz stream key. YouTube/LinkedIn panelinden stream key alın.' };
  }

  return { success: true, latencyMs: Date.now() - start };
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

  const { rtmpUrl, streamKey, saveKey } = await request.json();
  if (!rtmpUrl || !streamKey) {
    return NextResponse.json({ error: 'rtmpUrl ve streamKey gerekli' }, { status: 400 });
  }

  const result = await testRtmpConnection(rtmpUrl, streamKey);

  // Başarılıysa ve kullanıcı kaydetmek istiyorsa → AES-256 şifreli Firestore'a yaz
  if (result.success && saveKey) {
    const encrypted = encryptStreamKey(streamKey);
    const db = getAdminFirestore();
    await db.collection('streamKeys').doc(uid).set({
      rtmpUrl,
      encryptedKey: encrypted,
      maskedKey: maskStreamKey(streamKey),
      updatedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    success: result.success,
    latencyMs: result.latencyMs,
    error: result.error,
    suggestion: result.error
      ? 'YouTube Studio veya LinkedIn Live\'dan stream key\'i kontrol edin. Stream key\'in geçerliliği sona ermiş olabilir.'
      : undefined,
  });
}

export { encryptStreamKey, decryptStreamKey, maskStreamKey };
