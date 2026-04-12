// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { create } from 'zustand';
import type { MatchResult } from '@/types/speech';
import type { SpeechProviderType } from '@/types/presentation';

interface SpeechState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  /**
   * WebSpeech / Deepgram / Gemini provider'dan gelen son transkript segmentinin
   * confidence skoru (0-1). Düşük confidence → keyword matcher threshold'u
   * dinamik olarak yükseltilir (useKeywordMatch).
   */
  interimConfidence: number;
  matches: MatchResult[];
  selectedProvider: SpeechProviderType;
  error: string | null;

  setIsListening: (value: boolean) => void;
  setTranscript: (text: string, confidence?: number) => void;
  setInterimTranscript: (text: string, confidence?: number) => void;
  setMatches: (matches: MatchResult[]) => void;
  setSelectedProvider: (provider: SpeechProviderType) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSpeechStore = create<SpeechState>((set) => ({
  isListening: false,
  transcript: '',
  interimTranscript: '',
  interimConfidence: 1, // varsayılan: tam güven — provider confidence yollamıyorsa threshold değişmesin
  matches: [],
  selectedProvider: 'webSpeech',
  error: null,

  setIsListening: (value) => set({ isListening: value }),
  setTranscript: (text, confidence) =>
    set(confidence !== undefined ? { transcript: text, interimConfidence: confidence } : { transcript: text }),
  setInterimTranscript: (text, confidence) =>
    set(confidence !== undefined ? { interimTranscript: text, interimConfidence: confidence } : { interimTranscript: text }),
  setMatches: (matches) => set({ matches }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      isListening: false,
      transcript: '',
      interimTranscript: '',
      interimConfidence: 1,
      matches: [],
      error: null,
    }),
}));
