// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

interface ConnectionTestModalProps {
  rtmpUrl: string;
  streamKey: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function ConnectionTestModal({ rtmpUrl, streamKey, onSuccess, onClose }: ConnectionTestModalProps) {
  const [status, setStatus] = useState<TestStatus>('idle');
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const runTest = async () => {
    setStatus('testing');
    setErrorMsg(null);
    setSuggestion(null);

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/livestream/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rtmpUrl, streamKey, saveKey: true }),
      });

      const data = await res.json();
      if (data.success) {
        setLatencyMs(data.latencyMs);
        setStatus('success');
      } else {
        setErrorMsg(data.error ?? 'Test başarısız');
        setSuggestion(data.suggestion ?? null);
        setStatus('error');
      }
    } catch {
      setErrorMsg('Sunucuya bağlanılamadı');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Bağlantı Testi</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-2xl leading-none">✕</button>
        </div>

        <div className="rounded-xl bg-white/5 p-4 text-sm text-white/60">
          <p><span className="text-white/30">URL:</span> {rtmpUrl}</p>
          <p className="mt-1"><span className="text-white/30">Key:</span> {'*'.repeat(Math.max(0, streamKey.length - 4))}{streamKey.slice(-4)}</p>
        </div>

        {status === 'idle' && (
          <button
            onClick={runTest}
            className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-400 transition"
          >
            5 Saniyelik Test Başlat
          </button>
        )}

        {status === 'testing' && (
          <div className="flex items-center gap-3 text-sm text-white/60">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Test yapılıyor… (5 saniye)
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-green-300">
              <span className="text-xl">✓</span>
              <span className="text-sm font-semibold">Bağlantı başarılı ({latencyMs}ms)</span>
            </div>
            <button
              onClick={onSuccess}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition"
            >
              Yayını Başlat
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-red-400">{errorMsg}</p>
            {suggestion && <p className="text-xs text-white/40">{suggestion}</p>}
            <button
              onClick={runTest}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition"
            >
              Tekrar Dene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
