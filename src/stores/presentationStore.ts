// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { create } from 'zustand';
import type {
  Presentation,
  PresentationImage,
  Keyword,
  PresentationSettings,
} from '@/types/presentation';
import {
  getPresentation,
  updatePresentation,
  listPresentations,
  createPresentation as dbCreate,
  deletePresentation as dbDelete,
  clonePresentation as dbClone,
} from '@/lib/db/presentations';

interface PresentationState {
  presentations: Presentation[];
  currentPresentation: Presentation | null;
  activeImageIds: Set<string>;
  isPresenting: boolean;
  isLoading: boolean;
  viewMode: 'overview' | 'focused';
  focusedImageId: string | null;

  // Presentation CRUD
  loadPresentations: () => Promise<void>;
  loadPresentation: (id: string) => Promise<void>;
  createPresentation: (title: string, description?: string) => Promise<string>;
  deletePresentation: (id: string) => Promise<void>;
  clonePresentation: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<PresentationSettings>) => Promise<void>;

  // Image management
  addImages: (images: PresentationImage[]) => Promise<void>;
  updateImage: (imageId: string, updates: Partial<PresentationImage>) => Promise<void>;
  reorderImages: (imageIds: string[]) => Promise<void>;

  // Keyword management
  updateKeyword: (imageId: string, keywordId: string, updates: Partial<Keyword>) => void;
  deleteKeyword: (imageId: string, keywordId: string) => void;
  addKeyword: (imageId: string, keyword: Keyword) => void;
  addSynonym: (imageId: string, keywordId: string, synonym: string) => void;

  // Presentation mode
  setActiveImages: (ids: string[]) => void;
  clearActiveImages: () => void;
  setIsPresenting: (value: boolean) => void;
  setFocusedImage: (id: string | null) => void;
  setViewMode: (mode: 'overview' | 'focused') => void;

  /**
   * Şu anki odaklanılan görsel + komşuları (±1 slayt) ID listesi.
   * useKeywordMatch locality prior hesabı için kullanılır — komşu
   * slaytlardaki keyword'lere hafif (+0.03) boost verir, böylece
   * sunum akışı içinde tie-break doğal kalır.
   */
  getActiveSlideImageIds: () => string[];
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  presentations: [],
  currentPresentation: null,
  activeImageIds: new Set<string>(),
  isPresenting: false,
  isLoading: false,
  viewMode: 'overview' as const,
  focusedImageId: null,

  loadPresentations: async () => {
    set({ isLoading: true });
    const presentations = await listPresentations();
    set({ presentations, isLoading: false });
  },

  loadPresentation: async (id: string) => {
    set({ isLoading: true });
    const presentation = await getPresentation(id);
    // Takılı "analyzing" durumlarını düzelt
    if (presentation) {
      let needsUpdate = false;
      presentation.images = presentation.images.map((img) => {
        if (img.analysisStatus === 'analyzing') {
          needsUpdate = true;
          return {
            ...img,
            analysisStatus: img.keywords.length > 0 ? 'completed' as const : 'pending' as const,
          };
        }
        return img;
      });
      if (needsUpdate) {
        await updatePresentation(presentation);
      }
    }
    set({ currentPresentation: presentation ?? null, isLoading: false });
  },

  createPresentation: async (title: string, description?: string) => {
    const presentation = await dbCreate(title, description);
    set((state) => ({
      presentations: [presentation, ...state.presentations],
    }));
    return presentation.id;
  },

  deletePresentation: async (id: string) => {
    await dbDelete(id);
    set((state) => ({
      presentations: state.presentations.filter((p) => p.id !== id),
      currentPresentation:
        state.currentPresentation?.id === id ? null : state.currentPresentation,
    }));
  },

  clonePresentation: async (id: string) => {
    const cloned = await dbClone(id);
    set((state) => ({ presentations: [cloned, ...state.presentations] }));
  },

  updateSettings: async (settings: Partial<PresentationSettings>) => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;
    const updated = {
      ...currentPresentation,
      settings: { ...currentPresentation.settings, ...settings },
    };
    await updatePresentation(updated);
    set({ currentPresentation: updated });
  },

  addImages: async (images: PresentationImage[]) => {
    set((state) => {
      if (!state.currentPresentation) return state;
      return {
        currentPresentation: {
          ...state.currentPresentation,
          images: [...state.currentPresentation.images, ...images],
        },
      };
    });
    const { currentPresentation } = get();
    if (currentPresentation) {
      await updatePresentation(currentPresentation);
    }
  },

  updateImage: async (imageId: string, updates: Partial<PresentationImage>) => {
    // Fonksiyonel set ile race condition önleme
    set((state) => {
      if (!state.currentPresentation) return state;
      return {
        currentPresentation: {
          ...state.currentPresentation,
          images: state.currentPresentation.images.map((img) =>
            img.id === imageId ? { ...img, ...updates } : img
          ),
        },
      };
    });
    // DB'yi güncel state'den yaz
    const { currentPresentation } = get();
    if (currentPresentation) {
      await updatePresentation(currentPresentation);
    }
  },

  reorderImages: async (imageIds: string[]) => {
    const { currentPresentation } = get();
    if (!currentPresentation) return;
    const imageMap = new Map(
      currentPresentation.images.map((img) => [img.id, img])
    );
    const reordered = imageIds
      .map((id, index) => {
        const img = imageMap.get(id);
        return img ? { ...img, order: index } : null;
      })
      .filter((img): img is PresentationImage => img !== null);
    const updated = { ...currentPresentation, images: reordered };
    await updatePresentation(updated);
    set({ currentPresentation: updated });
  },

  updateKeyword: (imageId, keywordId, updates) => {
    set((state) => {
      if (!state.currentPresentation) return state;
      return {
        currentPresentation: {
          ...state.currentPresentation,
          images: state.currentPresentation.images.map((img) =>
            img.id === imageId
              ? { ...img, keywords: img.keywords.map((kw) =>
                  kw.id === keywordId ? { ...kw, ...updates, isUserEdited: true } : kw
                )}
              : img
          ),
        },
      };
    });
    const { currentPresentation } = get();
    if (currentPresentation) updatePresentation(currentPresentation);
  },

  deleteKeyword: (imageId, keywordId) => {
    set((state) => {
      if (!state.currentPresentation) return state;
      return {
        currentPresentation: {
          ...state.currentPresentation,
          images: state.currentPresentation.images.map((img) =>
            img.id === imageId
              ? { ...img, keywords: img.keywords.filter((kw) => kw.id !== keywordId) }
              : img
          ),
        },
      };
    });
    const { currentPresentation } = get();
    if (currentPresentation) updatePresentation(currentPresentation);
  },

  addKeyword: (imageId, keyword) => {
    set((state) => {
      if (!state.currentPresentation) return state;
      return {
        currentPresentation: {
          ...state.currentPresentation,
          images: state.currentPresentation.images.map((img) =>
            img.id === imageId
              ? { ...img, keywords: [...img.keywords, keyword] }
              : img
          ),
        },
      };
    });
    const { currentPresentation } = get();
    if (currentPresentation) updatePresentation(currentPresentation);
  },

  addSynonym: (imageId, keywordId, synonym) => {
    const normalizedSyn = synonym.toLowerCase().trim();
    set((state) => {
      if (!state.currentPresentation) return state;
      return {
        currentPresentation: {
          ...state.currentPresentation,
          images: state.currentPresentation.images.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  keywords: img.keywords.map((kw) =>
                    kw.id === keywordId && !kw.synonyms.includes(normalizedSyn)
                      ? { ...kw, synonyms: [...kw.synonyms, normalizedSyn] }
                      : kw
                  ),
                }
              : img
          ),
        },
      };
    });
    const { currentPresentation } = get();
    if (currentPresentation) updatePresentation(currentPresentation);
  },

  setActiveImages: (ids) => set({ activeImageIds: new Set(ids) }),
  clearActiveImages: () => set({ activeImageIds: new Set() }),
  setIsPresenting: (value) => set({ isPresenting: value }),
  setFocusedImage: (id) => set({
    focusedImageId: id,
    viewMode: id ? 'focused' : 'overview',
  }),
  setViewMode: (mode) => set({
    viewMode: mode,
    focusedImageId: mode === 'overview' ? null : get().focusedImageId,
  }),

  getActiveSlideImageIds: () => {
    const state = get();
    const images = state.currentPresentation?.images ?? [];
    if (images.length === 0) return [];
    const focused = state.focusedImageId;
    if (!focused) {
      // Henüz bir focus yok → tüm görseller eşit
      return images.map((i) => i.id);
    }
    const idx = images.findIndex((i) => i.id === focused);
    if (idx === -1) return [focused];
    // Mevcut + ±1 komşu
    const neighbors: string[] = [];
    if (idx - 1 >= 0) neighbors.push(images[idx - 1].id);
    neighbors.push(images[idx].id);
    if (idx + 1 < images.length) neighbors.push(images[idx + 1].id);
    return neighbors;
  },
}));
