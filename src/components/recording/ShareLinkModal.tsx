// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';

interface ShareLinkModalProps {
  shareUrl: string;
  expiresAt: string;
  onClose: () => void;
}

export function ShareLinkModal({ shareUrl, expiresAt, onClose }: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== 'undefined' ? window.location.origin + shareUrl : shareUrl;
  const expiryDate = new Date(expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Sunum Linki</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-xl">✕</button>
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/5 p-3">
          <span className="flex-1 truncate font-mono text-sm text-white/70">{fullUrl}</span>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-400"
          >
            {copied ? '✓ Kopyalandı!' : 'Linki Kopyala'}
          </button>
        </div>

        <p className="text-xs text-white/40">{expiryDate} tarihine kadar geçerli</p>
      </div>
    </div>
  );
}
