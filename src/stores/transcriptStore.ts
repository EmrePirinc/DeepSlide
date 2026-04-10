// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { create } from 'zustand';

export interface TranscriptEntry {
  timestamp: number;
  text: string;
}

interface TranscriptState {
  entries: TranscriptEntry[];
  hasKvkkConsent: boolean;

  addEntry: (text: string) => void;
  clear: () => void;
  getWordCount: () => number;
  setKvkkConsent: (value: boolean) => void;
  exportText: () => string;
}

export const useTranscriptStore = create<TranscriptState>((set, get) => ({
  entries: [],
  hasKvkkConsent: false,

  addEntry: (text) =>
    set((state) => ({
      entries: [...state.entries, { timestamp: Date.now(), text: text.trim() }],
    })),

  clear: () => set({ entries: [] }),

  getWordCount: () => {
    const { entries } = get();
    return entries.reduce((sum, e) => sum + e.text.split(/\s+/).filter(Boolean).length, 0);
  },

  setKvkkConsent: (value) => set({ hasKvkkConsent: value }),

  exportText: () => get().entries.map((e) => e.text).join(' '),
}));
