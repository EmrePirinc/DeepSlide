// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';

type ClipFormat = 'reels' | 'youtube';
type ClipStatus = 'idle' | 'queuing' | 'queued' | 'error';

interface ClipButtonProps {
  recordingId: string;
  disabled?: boolean;
}

export function ClipButton({ recordingId, disabled }: ClipButtonProps) {
  const [status, setStatus] = useState<ClipStatus>('idle');
  const [format, setFormat] = useState<ClipFormat>('youtube');
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setStatus('queuing');
    setError(null);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch('/api/clip/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ recordingId, format }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Hata');
      setJobId(data.jobId as string);
      setStatus('queued');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Klip oluşturulamadı');
      setStatus('error');
    }
  };

  if (status === 'queued' && jobId) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-green-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          Klip oluşturuluyor… (~5dk)
        </div>
        <p className="text-xs text-white/30">Job: {jobId.slice(-8)}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {(['youtube', 'reels'] as ClipFormat[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              format === f
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/60 hover:text-white'
            }`}
          >
            {f === 'youtube' ? '📺 YouTube' : '📱 Reels'}
          </button>
        ))}
      </div>

      <button
        onClick={handleCreate}
        disabled={disabled || status === 'queuing'}
        className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-40 transition"
      >
        {status === 'queuing' ? (
          <><span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> Kuyruğa alınıyor…</>
        ) : (
          <>✂ Klip Oluştur</>
        )}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
