// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useEffect } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { getUndoManager, createDeleteObjectCommand } from '@/lib/canvas/undo-manager';
import type { SlideObject } from '@/types/slide-object';

/**
 * useEditorKeyboard — Canvas editor klavye kısayolları.
 * Delete, ⌘A, ⌘C, ⌘V, ⌘D, Escape
 */
export function useEditorKeyboard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Input/textarea/contentEditable içindeyken engelleme
      if (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      const state = useCanvasStore.getState();
      const { selectedIds } = state;

      // Delete / Backspace — seçili nesneleri sil
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        const slide = state.slides.find(s => s.id === state.activeSlideId);
        if (!slide) return;
        const undoManager = getUndoManager();
        selectedIds.forEach(id => {
          const obj = slide.objects.find(o => o.id === id);
          if (obj) {
            undoManager.execute(createDeleteObjectCommand(obj as SlideObject));
          }
        });
      }

      // ⌘A — tümünü seç
      if (mod && e.key === 'a') {
        e.preventDefault();
        state.selectAll();
      }

      // ⌘C — kopyala
      if (mod && e.key === 'c' && selectedIds.length > 0) {
        e.preventDefault();
        state.copySelected();
      }

      // ⌘V — yapıştır
      if (mod && e.key === 'v') {
        e.preventDefault();
        state.paste();
      }

      // ⌘D — çoğalt
      if (mod && e.key === 'd' && selectedIds.length > 0) {
        e.preventDefault();
        state.duplicateSelected();
      }

      // Escape — seçimi kaldır
      if (e.key === 'Escape') {
        state.deselectAll();
        state.setActiveTool('select');
      }

      // Arrow keys — seçili nesneleri 1px (veya Shift ile 10px) taşı
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedIds.length > 0) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const slide = state.slides.find(s => s.id === state.activeSlideId);
        if (!slide) return;
        selectedIds.forEach(id => {
          const obj = slide.objects.find(o => o.id === id);
          if (!obj) return;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          state.moveObject(id, obj.x + dx, obj.y + dy);
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
