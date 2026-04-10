// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore, getAdminStorage } from '@/lib/firebase/admin';
import { randomBytes } from 'crypto';

const SHARE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7));
    const uid = decoded.uid;

    const { recordingId, mimeType, extension, chunkCount } = await request.json() as {
      recordingId: string;
      mimeType: string;
      extension: string;
      chunkCount?: number;
    };

    if (!recordingId || !mimeType || !extension) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (!recordingId.startsWith(`${uid}-`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // İlk chunk için signed okuma URL'i oluştur (chunk-000000 ana dosya)
    const filePath = `recordings/${uid}/${recordingId}/chunk-000000`;
    const bucket = getAdminStorage().bucket();
    const file = bucket.file(filePath);

    const expiresAt = new Date(Date.now() + SHARE_TTL_MS);
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: expiresAt,
    });

    const shareKey = randomBytes(12).toString('hex');

    // Firestore'a kaydet
    const db = getAdminFirestore();
    await db.collection('recordings').doc(recordingId).set({
      recordingId,
      ownerId: uid,
      shareKey,
      signedUrl,
      expiresAt: expiresAt.toISOString(),
      mimeType,
      extension,
      chunkCount: chunkCount ?? 1,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      shareKey,
      shareUrl: `/r/${shareKey}`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Share URL error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
