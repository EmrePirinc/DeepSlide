// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { create } from 'zustand';
import type { AIProviderType, SpeechProviderType } from '@/types/presentation';

interface UIState {
  sidebarOpen: boolean;
  columnCount: 3 | 4 | 5;
  selectedImageProvider: AIProviderType;
  selectedSpeechProvider: SpeechProviderType;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setColumnCount: (count: 3 | 4 | 5) => void;
  setSelectedImageProvider: (provider: AIProviderType) => void;
  setSelectedSpeechProvider: (provider: SpeechProviderType) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  columnCount: 4,
  selectedImageProvider: 'gemini',
  selectedSpeechProvider: 'webSpeech',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setColumnCount: (count) => set({ columnCount: count }),
  setSelectedImageProvider: (provider) =>
    set({ selectedImageProvider: provider }),
  setSelectedSpeechProvider: (provider) =>
    set({ selectedSpeechProvider: provider }),
}));
