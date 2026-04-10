// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { recordingService } from '@/lib/recording/recordingService';

export type LiveStreamStatus = 'idle' | 'connecting' | 'live' | 'error';

type StatusCallback = (status: LiveStreamStatus) => void;
type DisconnectCallback = () => void;

/**
 * LiveKit Ingress yöneticisi.
 * livekit-client kurulunca tam implementasyon eklenir.
 *
 * TODO: npm install livekit-client livekit-server-sdk
 *
 * Mevcut implementasyon:
 * 1. LiveKit token alır (API route)
 * 2. LiveKit room'a bağlanır (TODO: livekit-client)
 * 3. RTMP Ingress üzerinden yayın başlatır
 * 4. Kopunca otomatik olarak kayda geçer
 */
class LiveStreamService {
  private status: LiveStreamStatus = 'idle';
  private onStatusChange: StatusCallback | null = null;
  private onDisconnectCb: DisconnectCallback | null = null;
  private reconnectAttempts = 0;
  private maxReconnects = 3;

  getStatus(): LiveStreamStatus {
    return this.status;
  }

  private setStatus(status: LiveStreamStatus) {
    this.status = status;
    this.onStatusChange?.(status);
  }

  on(event: 'statusChange', cb: StatusCallback): void;
  on(event: 'disconnect', cb: DisconnectCallback): void;
  on(event: string, cb: unknown): void {
    if (event === 'statusChange') this.onStatusChange = cb as StatusCallback;
    if (event === 'disconnect') this.onDisconnectCb = cb as DisconnectCallback;
  }

  async startStream(streamKey: string, rtmpUrl: string, authToken: string): Promise<void> {
    if (this.status !== 'idle') throw new Error('Stream already active');

    this.setStatus('connecting');
    this.reconnectAttempts = 0;

    try {
      // 1. LiveKit token al
      const tokenRes = await fetch('/api/livestream/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ roomName: `stream-${Date.now()}` }),
      });

      if (!tokenRes.ok) throw new Error('LiveKit token alınamadı');
      const { token, livekitUrl } = await tokenRes.json();

      // 2. LiveKit Room bağlantısı (livekit-client kurulunca aktif edilir)
      // const { Room } = await import('livekit-client');
      // const room = new Room();
      // await room.connect(livekitUrl, token);

      // Simülasyon — gerçek implementasyon livekit-client ile
      console.log('[LiveStream] Connecting...', { livekitUrl, token: token.slice(0, 20) + '...' });

      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (streamKey && rtmpUrl) resolve();
          else reject(new Error('Invalid stream config'));
        }, 2000);
      });

      this.setStatus('live');

      // 3. Kopma simülasyonu (gerçekte WebSocket event'leri dinlenir)
      // room.on(RoomEvent.Disconnected, () => this.handleDisconnect());

    } catch (err) {
      this.setStatus('error');
      throw err;
    }
  }

  async stopStream(): Promise<void> {
    // room.disconnect() çağrılır
    this.setStatus('idle');
    this.reconnectAttempts = 0;
  }

  private async handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnects) {
      this.reconnectAttempts++;
      this.setStatus('connecting');
      // Yeniden bağlanmayı dene
    } else {
      // Otomatik kayda geç
      this.setStatus('error');
      this.onDisconnectCb?.();
      if (recordingService.getState() === 'idle') {
        // recordingService.start() çağrısı buraya
      }
    }
  }
}

export const liveStreamService = new LiveStreamService();
