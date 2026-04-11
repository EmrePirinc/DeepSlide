// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useEffect, useCallback, useSyncExternalStore } from 'react';
import { getUndoManager } from '@/lib/canvas/undo-manager';
import type { CanvasCommand } from '@/lib/canvas/undo-manager';

/**
 * useUndoRedo — Canvas düzenleme geçmişi hook'u.
 * ⌘Z ile geri al, ⌘⇧Z ile yeniden yap.
 * Toolbar butonları için canUndo/canRedo state'i sağlar.
 */
export function useUndoRedo() {
  const manager = getUndoManager();

  // Reactive state — manager değiştiğinde UI güncellenir
  const state = useSyncExternalStore(
    useCallback((cb: () => void) => manager.subscribe(cb), [manager]),
    () => ({
      canUndo: manager.canUndo,
      canRedo: manager.canRedo,
      undoCount: manager.undoCount,
      redoCount: manager.redoCount,
      lastUndoDescription: manager.lastUndoDescription,
      lastRedoDescription: manager.lastRedoDescription,
    }),
    () => ({
      canUndo: false,
      canRedo: false,
      undoCount: 0,
      redoCount: 0,
      lastUndoDescription: null,
      lastRedoDescription: null,
    })
  );

  // Klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // contentEditable içindeyken kısayolları engelleme
      const target = e.target as HTMLElement;
      if (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        manager.undo();
      } else if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        manager.redo();
      } else if (mod && e.key === 'y') {
        // Windows: Ctrl+Y = Redo
        e.preventDefault();
        manager.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manager]);

  const execute = useCallback((command: CanvasCommand) => {
    manager.execute(command);
  }, [manager]);

  const undo = useCallback(() => manager.undo(), [manager]);
  const redo = useCallback(() => manager.redo(), [manager]);
  const clear = useCallback(() => manager.clear(), [manager]);

  return {
    ...state,
    execute,
    undo,
    redo,
    clear,
  };
}
