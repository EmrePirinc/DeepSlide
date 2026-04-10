// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

// RFC 5322 basit email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

interface EmailPayload {
  to: string[];
  summary: string[];
  actionItems: string[];
  shareUrl: string;
  presentationTitle: string;
}

function buildEmailHtml(payload: EmailPayload): string {
  const { summary, actionItems, shareUrl, presentationTitle } = payload;
  const summaryHtml = summary.map((s) => `<li style="margin-bottom:8px;">${s}</li>`).join('');
  const actionsHtml = actionItems.map((a) => `<li style="margin-bottom:8px;">☐ ${a}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f0f0f;color:#e5e5e5;margin:0;padding:40px 20px;">
  <div style="max-width:600px;margin:0 auto;background:#1a1a1a;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);padding:32px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">DeepSlide</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Sunum Özeti</p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 20px;color:#fff;font-size:18px;">${presentationTitle}</h2>

      <h3 style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Özet</h3>
      <ul style="margin:0 0 24px;padding-left:20px;color:#e2e8f0;font-size:15px;line-height:1.6;">${summaryHtml}</ul>

      <h3 style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Aksiyon Listesi</h3>
      <ul style="margin:0 0 32px;padding-left:20px;color:#e2e8f0;font-size:15px;line-height:1.6;">${actionsHtml}</ul>

      <a href="${shareUrl}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px;">Sunumu İzle →</a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #262626;text-align:center;">
      <p style="margin:0;color:#525252;font-size:12px;">DeepSlide — AI destekli sunum platformu</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not configured' }, { status: 500 });
  }

  // Auth
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let replyTo = 'noreply@deepslide.app';
  try {
    const token = authHeader.slice(7);
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(token);
    if (decoded.email) replyTo = decoded.email;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  // Resend: domain doğrulanana kadar onboarding@resend.dev kullan
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

  let payload: EmailPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { to, summary, actionItems, shareUrl, presentationTitle } = payload;

  if (!Array.isArray(to) || to.length === 0) {
    return NextResponse.json({ error: 'Alıcı listesi boş olamaz' }, { status: 400 });
  }

  const invalidEmails = to.filter((email) => !isValidEmail(email));
  if (invalidEmails.length > 0) {
    return NextResponse.json({ error: 'Geçersiz e-posta adresleri', invalidEmails }, { status: 400 });
  }

  const html = buildEmailHtml({ to, summary, actionItems, shareUrl, presentationTitle });

  // Resend API çağrısı
  const results = await Promise.allSettled(
    to.map((recipient) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `DeepSlide <${fromAddress}>`,
          reply_to: replyTo,
          to: [recipient],
          subject: `${presentationTitle} — Sunum Özeti`,
          html,
        }),
      })
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results
    .map((r, i) => (r.status === 'rejected' ? to[i] : null))
    .filter(Boolean) as string[];

  return NextResponse.json({ sent, failed, total: to.length });
}
