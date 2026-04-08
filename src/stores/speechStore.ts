// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { create } from 'zustand';
import type { MatchResult } from '@/types/speech';
import type { SpeechProviderType } from '@/types/presentation';

interface SpeechState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  matches: MatchResult[];
  selectedProvider: SpeechProviderType;
  error: string | null;

  setIsListening: (value: boolean) => void;
  setTranscript: (text: string) => void;
  setInterimTranscript: (text: string) => void;
  setMatches: (matches: MatchResult[]) => void;
  setSelectedProvider: (provider: SpeechProviderType) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSpeechStore = create<SpeechState>((set) => ({
  isListening: false,
  transcript: '',
  interimTranscript: '',
  matches: [],
  selectedProvider: 'webSpeech',
  error: null,

  setIsListening: (value) => set({ isListening: value }),
  setTranscript: (text) => set({ transcript: text }),
  setInterimTranscript: (text) => set({ interimTranscript: text }),
  setMatches: (matches) => set({ matches }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      isListening: false,
      transcript: '',
      interimTranscript: '',
      matches: [],
      error: null,
    }),
}));
