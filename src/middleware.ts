// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Tüm response'lara COOP header'ı ekler — Firebase Auth signInWithPopup'ın
 * window.closed / window.close çağrılarını yapabilmesi için gerekli.
 * next.config headers() ile birlikte çalışır (yedekleme).
 */
export function middleware(_req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.headers.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
