// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useEffect, useRef } from 'react';
import { useSpeechStore } from '@/stores/speechStore';
import { useTranscriptStore } from '@/stores/transcriptStore';

/**
 * speechStore'daki final transcript'leri transcriptStore'a kaydeden köprü hook.
 * Sunum sayfasında aktif olduğunda her final cümleyi zaman damgasıyla kaydeder.
 */
export function useTranscriptCapture(enabled: boolean) {
  const { transcript } = useSpeechStore();
  const { addEntry } = useTranscriptStore();
  const lastCapturedRef = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;
    if (!transcript || transcript === lastCapturedRef.current) return;
    lastCapturedRef.current = transcript;
    addEntry(transcript);
  }, [transcript, enabled, addEntry]);
}
