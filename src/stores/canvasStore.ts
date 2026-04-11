// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type {
  SlideObject,
  CanvasSlide,
  SlideBackground,
} from '@/types/slide-object';
import { DEFAULT_BACKGROUND } from '@/types/slide-object';

// ─── State Arayüzü ────────────────────────────────────

interface CanvasState {
  /** Aktif sunumun tüm slaytları */
  slides: CanvasSlide[];
  /** Aktif slayt ID'si */
  activeSlideId: string | null;
  /** Seçili nesne ID'leri */
  selectedIds: string[];
  /** Kopyalanan nesneler (clipboard) */
  clipboard: SlideObject[];
  /** Aktif araç */
  activeTool: ActiveTool;
  /** Zoom seviyesi (0.25 - 3.0) */
  zoom: number;

  // ─── Slayt İşlemleri ─────────────────────

  /** Sunumu yükle — slaytları set et */
  loadSlides: (presentationId: string, slides: CanvasSlide[]) => void;
  /** Yeni boş slayt ekle */
  addSlide: (afterSlideId?: string) => string;
  /** Slaytı çoğalt (deep clone) */
  duplicateSlide: (slideId: string) => string;
  /** Slaytı sil */
  deleteSlide: (slideId: string) => void;
  /** Slayt sırasını değiştir */
  reorderSlides: (slideIds: string[]) => void;
  /** Aktif slaytı değiştir */
  setActiveSlide: (slideId: string) => void;
  /** Slayt arka planını güncelle */
  updateSlideBackground: (slideId: string, bg: Partial<SlideBackground>) => void;
  /** Slayt gizliliğini toggle */
  toggleSlideHidden: (slideId: string) => void;

  // ─── Nesne İşlemleri ─────────────────────

  /** Aktif slayta nesne ekle */
  addObject: (object: SlideObject) => void;
  /** Nesne güncelle */
  updateObject: (objectId: string, updates: Partial<SlideObject>) => void;
  /** Nesne sil */
  deleteObject: (objectId: string) => void;
  /** Birden fazla nesne sil */
  deleteObjects: (objectIds: string[]) => void;

  // ─── Seçim İşlemleri ─────────────────────

  /** Tek nesne seç */
  selectObject: (objectId: string) => void;
  /** Seçime ekle (Shift+tıklama) */
  addToSelection: (objectId: string) => void;
  /** Tüm seçimi kaldır */
  deselectAll: () => void;
  /** Tüm nesneleri seç */
  selectAll: () => void;

  // ─── Konum/Boyut İşlemleri ───────────────

  /** Nesneyi taşı */
  moveObject: (objectId: string, x: number, y: number) => void;
  /** Nesneyi boyutlandır */
  resizeObject: (objectId: string, width: number, height: number) => void;
  /** Nesneyi döndür */
  rotateObject: (objectId: string, angle: number) => void;

  // ─── Z-Index İşlemleri ───────────────────

  /** Öne getir */
  bringForward: (objectId: string) => void;
  /** En öne getir */
  bringToFront: (objectId: string) => void;
  /** Arkaya gönder */
  sendBackward: (objectId: string) => void;
  /** En arkaya gönder */
  sendToBack: (objectId: string) => void;

  // ─── Clipboard İşlemleri ─────────────────

  /** Seçili nesneleri kopyala */
  copySelected: () => void;
  /** Yapıştır */
  paste: () => void;
  /** Seçili nesneleri çoğalt (yerinde kopya) */
  duplicateSelected: () => void;

  // ─── Araç & Zoom ────────────────────────

  setActiveTool: (tool: ActiveTool) => void;
  setZoom: (zoom: number) => void;
}

export type ActiveTool =
  | 'select'
  | 'text'
  | 'shape'
  | 'line'
  | 'image'
  | 'hand';

// ─── Yardımcı Fonksiyonlar ─────────────────────────────

function getActiveSlideObjects(state: CanvasState): SlideObject[] {
  const slide = state.slides.find(s => s.id === state.activeSlideId);
  return slide?.objects ?? [];
}

function updateActiveSlideObjects(
  slides: CanvasSlide[],
  activeSlideId: string | null,
  updater: (objects: SlideObject[]) => SlideObject[]
): CanvasSlide[] {
  return slides.map(slide =>
    slide.id === activeSlideId
      ? { ...slide, objects: updater(slide.objects) }
      : slide
  );
}

function getNextZIndex(objects: SlideObject[]): number {
  if (objects.length === 0) return 1;
  return Math.max(...objects.map(o => o.zIndex)) + 1;
}

function deepCloneObject(obj: SlideObject): SlideObject {
  return { ...JSON.parse(JSON.stringify(obj)), id: nanoid(10) };
}

// ─── Store ─────────────────────────────────────────────

export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      slides: [],
      activeSlideId: null,
      selectedIds: [],
      clipboard: [],
      activeTool: 'select',
      zoom: 1,

      // ─── Slayt İşlemleri ─────────────────

      loadSlides: (presentationId, slides) => {
        set({
          slides,
          activeSlideId: slides[0]?.id ?? null,
          selectedIds: [],
        });
      },

      addSlide: (afterSlideId) => {
        const id = nanoid(10);
        const { slides } = get();
        const insertIndex = afterSlideId
          ? slides.findIndex(s => s.id === afterSlideId) + 1
          : slides.length;
        const presentationId = slides[0]?.presentationId ?? '';

        const newSlide: CanvasSlide = {
          id,
          presentationId,
          order: insertIndex,
          objects: [],
          background: { ...DEFAULT_BACKGROUND },
          hidden: false,
        };

        const newSlides = [...slides];
        newSlides.splice(insertIndex, 0, newSlide);
        // Sıralamayı güncelle
        newSlides.forEach((s, i) => { s.order = i; });

        set({ slides: newSlides, activeSlideId: id, selectedIds: [] });
        return id;
      },

      duplicateSlide: (slideId) => {
        const { slides } = get();
        const source = slides.find(s => s.id === slideId);
        if (!source) return slideId;

        const id = nanoid(10);
        const clonedObjects = source.objects.map(deepCloneObject);
        const insertIndex = slides.findIndex(s => s.id === slideId) + 1;

        const newSlide: CanvasSlide = {
          ...JSON.parse(JSON.stringify(source)),
          id,
          objects: clonedObjects,
          order: insertIndex,
        };

        const newSlides = [...slides];
        newSlides.splice(insertIndex, 0, newSlide);
        newSlides.forEach((s, i) => { s.order = i; });

        set({ slides: newSlides, activeSlideId: id, selectedIds: [] });
        return id;
      },

      deleteSlide: (slideId) => {
        const { slides, activeSlideId } = get();
        if (slides.length <= 1) return; // Son slayt silinemez

        const newSlides = slides.filter(s => s.id !== slideId);
        newSlides.forEach((s, i) => { s.order = i; });

        const newActiveId = activeSlideId === slideId
          ? newSlides[Math.max(0, slides.findIndex(s => s.id === slideId) - 1)]?.id ?? newSlides[0]?.id ?? null
          : activeSlideId;

        set({ slides: newSlides, activeSlideId: newActiveId, selectedIds: [] });
      },

      reorderSlides: (slideIds) => {
        const { slides } = get();
        const reordered = slideIds
          .map(id => slides.find(s => s.id === id))
          .filter((s): s is CanvasSlide => !!s);
        reordered.forEach((s, i) => { s.order = i; });
        set({ slides: reordered });
      },

      setActiveSlide: (slideId) => {
        set({ activeSlideId: slideId, selectedIds: [] });
      },

      updateSlideBackground: (slideId, bg) => {
        set({
          slides: get().slides.map(s =>
            s.id === slideId ? { ...s, background: { ...s.background, ...bg } } : s
          ),
        });
      },

      toggleSlideHidden: (slideId) => {
        set({
          slides: get().slides.map(s =>
            s.id === slideId ? { ...s, hidden: !s.hidden } : s
          ),
        });
      },

      // ─── Nesne İşlemleri ─────────────────

      addObject: (object) => {
        const { activeSlideId } = get();
        const objects = getActiveSlideObjects(get());
        const withZIndex = { ...object, zIndex: getNextZIndex(objects) };
        set({
          slides: updateActiveSlideObjects(get().slides, activeSlideId, objs => [...objs, withZIndex]),
          selectedIds: [object.id],
        });
      },

      updateObject: (objectId, updates) => {
        const { activeSlideId } = get();
        set({
          slides: updateActiveSlideObjects(get().slides, activeSlideId, objs =>
            objs.map(o => o.id === objectId ? { ...o, ...updates } as SlideObject : o)
          ),
        });
      },

      deleteObject: (objectId) => {
        const { activeSlideId, selectedIds } = get();
        set({
          slides: updateActiveSlideObjects(get().slides, activeSlideId, objs =>
            objs.filter(o => o.id !== objectId)
          ),
          selectedIds: selectedIds.filter(id => id !== objectId),
        });
      },

      deleteObjects: (objectIds) => {
        const { activeSlideId, selectedIds } = get();
        const idSet = new Set(objectIds);
        set({
          slides: updateActiveSlideObjects(get().slides, activeSlideId, objs =>
            objs.filter(o => !idSet.has(o.id))
          ),
          selectedIds: selectedIds.filter(id => !idSet.has(id)),
        });
      },

      // ─── Seçim İşlemleri ─────────────────

      selectObject: (objectId) => set({ selectedIds: [objectId] }),

      addToSelection: (objectId) => {
        const { selectedIds } = get();
        if (selectedIds.includes(objectId)) {
          set({ selectedIds: selectedIds.filter(id => id !== objectId) });
        } else {
          set({ selectedIds: [...selectedIds, objectId] });
        }
      },

      deselectAll: () => set({ selectedIds: [] }),

      selectAll: () => {
        const objects = getActiveSlideObjects(get());
        set({ selectedIds: objects.map(o => o.id) });
      },

      // ─── Konum/Boyut İşlemleri ───────────

      moveObject: (objectId, x, y) => {
        const { activeSlideId } = get();
        set({
          slides: updateActiveSlideObjects(get().slides, activeSlideId, objs =>
            objs.map(o => o.id === objectId ? { ...o, x, y } as SlideObject : o)
          ),
        });
      },

      resizeObject: (objectId, width, height) => {
        const { activeSlideId } = get();
        set({
          slides: updateActiveSlideObjects(get().slides, activeSlideId, objs =>
            objs.map(o => o.id === objectId ? { ...o, width: Math.max(10, width), height: Math.max(10, height) } as SlideObject : o)
          ),
        });
      },

      rotateObject: (objectId, angle) => {
        const { activeSlideId } = get();
        set({
          slides: updateActiveSlideObjects(get().slides, activeSlideId, objs =>
            objs.map(o => o.id === objectId ? { ...o, rotation: angle % 360 } as SlideObject : o)
          ),
        });
      },

      // ─── Z-Index İşlemleri ───────────────

      bringForward: (objectId) => {
        const { activeSlideId } = get();
        set({
          slides: updateActiveSlideObjects(get().slides, activeSlideId, objs => {
            const sorted = [...objs].sort((a, b) => a.zIndex - b.zIndex);
            const idx = sorted.findIndex(o => o.id === objectId);
            if (idx < 0 || idx >= sorted.length - 1) return objs;
            // Swap z-index with next
            const current = sorted[idx].zIndex;
            const next = sorted[idx + 1].zIndex;
            return objs.map(o => {
              if (o.id === objectId) return { ...o, zIndex: next } as SlideObject;
              if (o.id === sorted[idx + 1].id) return { ...o, zIndex: current } as SlideObject;
              return o;
            });
          }),
        });
      },

      bringToFront: (objectId) => {
        const objects = getActiveSlideObjects(get());
        const maxZ = getNextZIndex(objects);
        get().updateObject(objectId, { zIndex: maxZ } as Partial<SlideObject>);
      },

      sendBackward: (objectId) => {
        const { activeSlideId } = get();
        set({
          slides: updateActiveSlideObjects(get().slides, activeSlideId, objs => {
            const sorted = [...objs].sort((a, b) => a.zIndex - b.zIndex);
            const idx = sorted.findIndex(o => o.id === objectId);
            if (idx <= 0) return objs;
            const current = sorted[idx].zIndex;
            const prev = sorted[idx - 1].zIndex;
            return objs.map(o => {
              if (o.id === objectId) return { ...o, zIndex: prev } as SlideObject;
              if (o.id === sorted[idx - 1].id) return { ...o, zIndex: current } as SlideObject;
              return o;
            });
          }),
        });
      },

      sendToBack: (objectId) => {
        const objects = getActiveSlideObjects(get());
        const minZ = objects.length > 0 ? Math.min(...objects.map(o => o.zIndex)) - 1 : 0;
        get().updateObject(objectId, { zIndex: minZ } as Partial<SlideObject>);
      },

      // ─── Clipboard İşlemleri ─────────────

      copySelected: () => {
        const { selectedIds } = get();
        const objects = getActiveSlideObjects(get());
        const copied = objects.filter(o => selectedIds.includes(o.id));
        set({ clipboard: copied });
      },

      paste: () => {
        const { clipboard } = get();
        if (clipboard.length === 0) return;
        const cloned = clipboard.map(obj => ({
          ...deepCloneObject(obj),
          x: obj.x + 20,
          y: obj.y + 20,
        }));
        const objects = getActiveSlideObjects(get());
        let nextZ = getNextZIndex(objects);
        cloned.forEach(obj => { obj.zIndex = nextZ++; });

        const { activeSlideId } = get();
        set({
          slides: updateActiveSlideObjects(get().slides, activeSlideId, objs => [...objs, ...cloned]),
          selectedIds: cloned.map(o => o.id),
        });
      },

      duplicateSelected: () => {
        get().copySelected();
        get().paste();
      },

      // ─── Araç & Zoom ────────────────────

      setActiveTool: (tool) => set({ activeTool: tool }),
      setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(3, zoom)) }),
    }),
    { name: 'canvas-store' }
  )
);
