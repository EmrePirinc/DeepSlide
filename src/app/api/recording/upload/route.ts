// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminStorage } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7));
    const uid = decoded.uid;

    const { recordingId, chunkIndex, totalChunks, mimeType } = await request.json() as {
      recordingId: string;
      chunkIndex: number;
      totalChunks: number;
      mimeType?: string;
    };

    if (!recordingId || chunkIndex === undefined || !totalChunks) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (!recordingId.startsWith(`${uid}-`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const filePath = `recordings/${uid}/${recordingId}/chunk-${String(chunkIndex).padStart(6, '0')}`;
    const bucket = getAdminStorage().bucket();
    const file = bucket.file(filePath);

    const [uploadUrl] = await file.getSignedUrl({
      action: 'write',
      expires: Date.now() + 60 * 60 * 1000, // 1 saat
      contentType: mimeType ?? 'video/webm',
    });

    return NextResponse.json({ uploadUrl, key: filePath });
  } catch (error) {
    console.error('Upload URL generation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
