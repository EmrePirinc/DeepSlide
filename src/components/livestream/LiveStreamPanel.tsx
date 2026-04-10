// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { liveStreamService } from '@/lib/livestream/liveStreamService';
import { LiveStatusBadge } from './LiveStatusBadge';
import { ConnectionTestModal } from './ConnectionTestModal';
import type { LiveStreamStatus } from '@/lib/livestream/liveStreamService';

export function LiveStreamPanel() {
  const [rtmpUrl, setRtmpUrl] = useState('rtmp://a.rtmp.youtube.com/live2');
  const [streamKey, setStreamKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<LiveStreamStatus>('idle');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  liveStreamService.on('statusChange', setStatus);
  liveStreamService.on('disconnect', () => {
    setError('Yayın kesildi — kayda geçildi');
    setStatus('error');
  });

  const handleStartStream = async () => {
    setError(null);
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Oturum açmanız gerekiyor');
      await liveStreamService.startStream(streamKey, rtmpUrl, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yayın başlatılamadı');
    }
  };

  const handleStopStream = async () => {
    await liveStreamService.stopStream();
    setTestPassed(false);
    setError(null);
  };

  const isLive = status === 'live';
  const isConnecting = status === 'connecting';
  const canStart = testPassed && streamKey.length >= 4 && !isLive && !isConnecting;

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white/5 p-5 w-full max-w-md">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Canlı Yayın</h3>
        <LiveStatusBadge status={status} />
      </div>

      {!isLive && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/40">RTMP URL</label>
            <input
              type="text"
              value={rtmpUrl}
              onChange={(e) => { setRtmpUrl(e.target.value); setTestPassed(false); }}
              placeholder="rtmp://a.rtmp.youtube.com/live2"
              className="rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-blue-400/50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/40">Stream Key</label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={streamKey}
                onChange={(e) => { setStreamKey(e.target.value); setTestPassed(false); }}
                placeholder="YouTube/LinkedIn stream key"
                className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-blue-400/50"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="rounded-xl bg-white/10 px-3 text-xs text-white/60 hover:text-white transition"
              >
                {showKey ? 'Gizle' : 'Göster'}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowTestModal(true)}
              disabled={!streamKey || !rtmpUrl}
              className="flex-1 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-40 transition"
            >
              {testPassed ? '✓ Test Geçti' : 'Bağlantıyı Test Et'}
            </button>
            <button
              onClick={handleStartStream}
              disabled={!canStart}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-40 transition"
            >
              Yayını Başlat
            </button>
          </div>
        </>
      )}

      {isLive && (
        <button
          onClick={handleStopStream}
          className="rounded-xl bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-600 transition"
        >
          Yayını Durdur
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {showTestModal && (
        <ConnectionTestModal
          rtmpUrl={rtmpUrl}
          streamKey={streamKey}
          onSuccess={() => {
            setTestPassed(true);
            setShowTestModal(false);
          }}
          onClose={() => setShowTestModal(false)}
        />
      )}
    </div>
  );
}
