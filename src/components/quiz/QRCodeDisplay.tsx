// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  sessionId: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({ sessionId, size = 150, className }: QRCodeDisplayProps) {
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${sessionId}`
    : `/join/${sessionId}`;

  return (
    <div className={className}>
      <div className="rounded-lg overflow-hidden bg-white p-2 inline-block">
        <QRCodeSVG
          value={joinUrl}
          size={size}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
        />
      </div>
      <p className="mt-1 text-center text-xs text-white/50 break-all max-w-[150px]">
        {joinUrl}
      </p>
    </div>
  );
}
