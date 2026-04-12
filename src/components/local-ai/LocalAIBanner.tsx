'use client';

import { useState } from 'react';
import { X, Download, Zap } from 'lucide-react';

interface LocalAIBannerProps {
  onDismiss?: () => void;
}

const DOWNLOAD_URLS: Record<string, string> = {
  win32: 'https://github.com/deepslide/local-ai-releases/releases/latest/download/DeepSlide-Local-AI-Setup.exe',
  darwin: 'https://github.com/deepslide/local-ai-releases/releases/latest/download/DeepSlide-Local-AI.dmg',
  linux: 'https://github.com/deepslide/local-ai-releases/releases/latest/download/DeepSlide-Local-AI.AppImage',
};

function detectPlatform(): string {
  if (typeof navigator === 'undefined') return 'linux';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('win')) return 'win32';
  if (ua.includes('mac')) return 'darwin';
  return 'linux';
}

export function LocalAIBanner({ onDismiss }: LocalAIBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const platform = detectPlatform();
  const downloadUrl = DOWNLOAD_URLS[platform] ?? DOWNLOAD_URLS.linux;

  const platformLabel: Record<string, string> = {
    win32: 'Windows (.exe)',
    darwin: 'macOS (.dmg)',
    linux: 'Linux (.AppImage)',
  };

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/20">
        <Zap className="h-4 w-4 text-indigo-400" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-indigo-200">
          Local AI ile ücretsiz, gizli AI kullan
        </p>
        <p className="mt-0.5 text-xs text-indigo-300/80">
          DeepSlide Local AI'ı kur — modeller bilgisayarında çalışır, hiçbir veri gönderilmez.
        </p>
        <a
          href={downloadUrl}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <Download className="h-3.5 w-3.5" />
          {platformLabel[platform] ?? 'İndir'} için İndir
        </a>
      </div>

      <button
        onClick={handleDismiss}
        className="flex-shrink-0 rounded-md p-1 text-indigo-400 transition-colors hover:bg-indigo-500/20 hover:text-indigo-200"
        aria-label="Kapat"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
