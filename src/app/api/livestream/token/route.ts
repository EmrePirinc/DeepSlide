// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  const livekitApiKey = process.env.LIVEKIT_API_KEY;
  const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

  if (!livekitApiKey || !livekitApiSecret) {
    return NextResponse.json({ error: 'LiveKit credentials not configured' }, { status: 500 });
  }

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

  const { roomName } = await request.json() as { roomName: string };
  if (!roomName) {
    return NextResponse.json({ error: 'roomName gerekli' }, { status: 400 });
  }

  // Oda adı her zaman kullanıcıya kilitli — başka kullanıcının odasına girilemiyor
  const safeRoomName = `${uid}-${roomName}`;

  try {
    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: uid,
      ttl: '1h',
    });

    token.addGrant({
      roomJoin: true,
      room: safeRoomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      token: jwt,
      roomName: safeRoomName,
      livekitUrl: process.env.LIVEKIT_URL,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
