// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranscriptStore } from '@/stores/transcriptStore';
import type { SpeechProviderInterface, TranscriptResult } from '@/lib/speech/types';

export type SubtitleProvider = 'webspeech' | 'deepgram';

interface UseSubtitlesOptions {
  language: string;
  provider: SubtitleProvider;
  enabled: boolean;
}

interface UseSubtitlesReturn {
  currentText: string;
  isListening: boolean;
  start: () => void;
  stop: () => void;
  error: string | null;
}

async function createAdapter(provider: SubtitleProvider): Promise<SpeechProviderInterface> {
  if (provider === 'deepgram') {
    const { DeepgramAdapter } = await import('@/lib/speech/providers/deepgramAdapter');
    return new DeepgramAdapter();
  }
  const { WebSpeechAdapter } = await import('@/lib/speech/providers/webSpeechAdapter');
  return new WebSpeechAdapter();
}

export function useSubtitles({ language, provider, enabled }: UseSubtitlesOptions): UseSubtitlesReturn {
  const [currentText, setCurrentText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const adapterRef = useRef<SpeechProviderInterface | null>(null);
  const { addEntry, hasKvkkConsent } = useTranscriptStore();

  const handleTranscript = useCallback((result: TranscriptResult) => {
    setCurrentText(result.text);
    if (result.isFinal && result.text.trim()) {
      addEntry(result.text);
    }
  }, [addEntry]);

  const start = useCallback(async () => {
    if (!enabled) return;
    if (provider === 'deepgram' && !hasKvkkConsent) {
      setError('Deepgram kullanmak için KVKK onayı gerekiyor');
      return;
    }
    setError(null);
    try {
      const adapter = await createAdapter(provider);
      if (!adapter.isAvailable()) {
        setError(`${provider} bu cihazda kullanılamıyor`);
        return;
      }
      adapter.onTranscript = handleTranscript;
      adapter.onError = (err) => setError(err.message);
      adapterRef.current = adapter;
      adapter.start(language);
      setIsListening(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Alt yazı başlatılamadı');
    }
  }, [enabled, provider, language, handleTranscript, hasKvkkConsent]);

  const stop = useCallback(() => {
    adapterRef.current?.stop();
    adapterRef.current = null;
    setIsListening(false);
    setCurrentText('');
  }, []);

  // Dil değişince adapter'ı yeniden başlat
  useEffect(() => {
    if (isListening) {
      stop();
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, provider]);

  // Unmount'ta temizle
  useEffect(() => {
    return () => { adapterRef.current?.stop(); };
  }, []);

  return { currentText, isListening, start, stop, error };
}
