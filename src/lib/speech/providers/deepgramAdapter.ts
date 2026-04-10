// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { SpeechProviderInterface, TranscriptResult } from '../types';

const DEEPGRAM_WS_URL = 'wss://api.deepgram.com/v1/listen';

export class DeepgramAdapter implements SpeechProviderInterface {
  name = 'deepgram';
  onTranscript: ((result: TranscriptResult) => void) | null = null;
  onError: ((error: Error) => void) | null = null;

  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;

  isAvailable(): boolean {
    return typeof WebSocket !== 'undefined' && !!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
  }

  async start(lang: string): Promise<void> {
    const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
    if (!apiKey) {
      this.onError?.(new Error('DEEPGRAM_API_KEY eksik'));
      return;
    }

    const langMap: Record<string, string> = { tr: 'tr', en: 'en-US', de: 'de', fr: 'fr' };
    const dgLang = langMap[lang] ?? 'tr';

    const params = new URLSearchParams({
      language: dgLang,
      model: 'nova-2',
      punctuate: 'true',
      interim_results: 'true',
      encoding: 'linear16',
      sample_rate: '16000',
    });

    this.ws = new WebSocket(`${DEEPGRAM_WS_URL}?${params}`, ['token', apiKey]);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        const alt = data?.channel?.alternatives?.[0];
        if (!alt) return;

        this.onTranscript?.({
          text: alt.transcript ?? '',
          words: (alt.words ?? []).map((w: { word: string }) => w.word),
          isFinal: data.is_final ?? false,
          confidence: alt.confidence ?? 0,
        });
      } catch {
        // parse hatası — yoksay
      }
    };

    this.ws.onerror = () => {
      this.onError?.(new Error('Deepgram WebSocket bağlantı hatası'));
    };

    this.ws.onopen = async () => {
      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1 } });
        this.audioContext = new AudioContext({ sampleRate: 16000 });
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

        this.processor.onaudioprocess = (e) => {
          if (this.ws?.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const pcm = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcm[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }
          this.ws.send(pcm.buffer);
        };

        source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
      } catch (err) {
        this.onError?.(err instanceof Error ? err : new Error('Mikrofon erişim hatası'));
      }
    };
  }

  stop(): void {
    this.processor?.disconnect();
    this.processor = null;
    this.audioContext?.close();
    this.audioContext = null;
    this.mediaStream?.getTracks().forEach((t) => t.stop());
    this.mediaStream = null;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.ws = null;
  }
}
