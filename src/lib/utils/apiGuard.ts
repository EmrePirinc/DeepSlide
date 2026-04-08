// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './rateLimit';

// Auth endpoint'leri: 5 request / 60 saniye / IP
export function rateLimitAuth(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const result = checkRateLimit(`auth:${ip}`, 5, 60_000);
  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Cok fazla deneme. Lutfen bekleyin.' },
      {
        status: 429,
        headers: { 'Retry-After': String(result.retryAfter) },
      },
    );
  }
  return null;
}

// Billing endpoint'leri: 3 request / 60 saniye / IP
export function rateLimitBilling(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const result = checkRateLimit(`billing:${ip}`, 3, 60_000);
  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Cok fazla istek. Lutfen bekleyin.' },
      {
        status: 429,
        headers: { 'Retry-After': String(result.retryAfter) },
      },
    );
  }
  return null;
}

// Webhook endpoint'leri: 100 request / 60 saniye / IP
export function rateLimitWebhook(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const result = checkRateLimit(`webhook:${ip}`, 100, 60_000);
  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: { 'Retry-After': String(result.retryAfter) },
      },
    );
  }
  return null;
}
