'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { useRef, useCallback, useEffect } from 'react';
import { useSpeechStore } from '@/stores/speechStore';
import type { SpeechProviderType } from '@/types/presentation';
import { getSpeechProviderWithFallback } from '@/lib/speech/providerFactory';
import type { SpeechProviderInterface } from '@/lib/speech/types';

export function useSpeechRecognition() {
  const providerRef = useRef<SpeechProviderInterface | null>(null);
  const {
    isListening,
    setIsListening,
    setTranscript,
    setInterimTranscript,
    setError,
    reset,
  } = useSpeechStore();

  const start = useCallback(
    (providerType: SpeechProviderType, lang: string) => {
      // Önceki provider'ı temizle
      if (providerRef.current) {
        providerRef.current.stop();
      }

      const provider = getSpeechProviderWithFallback(providerType);
      providerRef.current = provider;

      provider.onTranscript = (result) => {
        // Confidence'ı store'a geçir — useKeywordMatch dinamik threshold için kullanır.
        // Bazı provider'lar confidence vermez (0 döner); 0'ı yüksek (1) olarak varsay.
        const confidence = result.confidence > 0 ? result.confidence : 1;
        if (result.isFinal) {
          setTranscript(result.text, confidence);
          setInterimTranscript('', confidence);
        } else {
          setInterimTranscript(result.text, confidence);
        }
      };

      provider.onError = (error) => {
        setError(error.message);
      };

      provider.start(lang);
      setIsListening(true);
      setError(null);
    },
    [setIsListening, setTranscript, setInterimTranscript, setError]
  );

  const stop = useCallback(() => {
    providerRef.current?.stop();
    providerRef.current = null;
    setIsListening(false);
  }, [setIsListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      providerRef.current?.stop();
      providerRef.current = null;
    };
  }, []);

  return { isListening, start, stop, reset };
}
