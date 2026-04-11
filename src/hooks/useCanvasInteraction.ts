// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useCallback, useRef, useState } from 'react';
import { useCanvasStore } from '@/stores/canvasStore';
import { getUndoManager, createMoveCommand, createResizeCommand, createRotateCommand } from '@/lib/canvas/undo-manager';
import type { SlideObject } from '@/types/slide-object';

type InteractionMode = 'idle' | 'moving' | 'resizing' | 'rotating';
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface DragState {
  mode: InteractionMode;
  objectId: string;
  startMouseX: number;
  startMouseY: number;
  startObjX: number;
  startObjY: number;
  startObjW: number;
  startObjH: number;
  startAngle: number;
  resizeHandle?: ResizeHandle;
}

/**
 * useCanvasInteraction — Canvas üzerinde nesne etkileşim hook'u.
 * Seçim, taşıma, boyutlandırma ve döndürme işlemlerini yönetir.
 */
export function useCanvasInteraction(zoom: number = 1) {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const undoManager = getUndoManager();

  const {
    selectObject,
    addToSelection,
    deselectAll,
    moveObject,
    resizeObject,
    rotateObject,
  } = useCanvasStore.getState();

  const getSlideObjects = useCallback((): SlideObject[] => {
    const state = useCanvasStore.getState();
    const slide = state.slides.find(s => s.id === state.activeSlideId);
    return slide?.objects ?? [];
  }, []);

  /** Canvas üzerinde tıklama — nesne seçimi veya seçim kaldırma */
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent, canvasRect: DOMRect) => {
    const mouseX = (e.clientX - canvasRect.left) / zoom;
    const mouseY = (e.clientY - canvasRect.top) / zoom;

    const objects = getSlideObjects();
    // Z-index'e göre ters sırada (üstteki önce) nesne bul
    const sorted = [...objects].sort((a, b) => b.zIndex - a.zIndex);
    const hit = sorted.find(obj => {
      if (obj.type === 'line') return false; // Çizgi seçimi farklı
      return mouseX >= obj.x && mouseX <= obj.x + obj.width &&
             mouseY >= obj.y && mouseY <= obj.y + obj.height;
    });

    if (hit) {
      if (e.shiftKey) {
        addToSelection(hit.id);
      } else {
        selectObject(hit.id);
      }
      // Taşıma başlat
      dragRef.current = {
        mode: 'moving',
        objectId: hit.id,
        startMouseX: mouseX,
        startMouseY: mouseY,
        startObjX: hit.x,
        startObjY: hit.y,
        startObjW: hit.width,
        startObjH: hit.height,
        startAngle: hit.rotation,
      };
      setIsDragging(true);
    } else {
      deselectAll();
    }
  }, [zoom, getSlideObjects, selectObject, addToSelection, deselectAll]);

  /** Tutamak üzerinde mousedown — resize başlat */
  const handleHandleMouseDown = useCallback((e: React.MouseEvent, objectId: string, handle: ResizeHandle, canvasRect: DOMRect) => {
    e.stopPropagation();
    const obj = getSlideObjects().find(o => o.id === objectId);
    if (!obj) return;

    const mouseX = (e.clientX - canvasRect.left) / zoom;
    const mouseY = (e.clientY - canvasRect.top) / zoom;

    dragRef.current = {
      mode: 'resizing',
      objectId,
      startMouseX: mouseX,
      startMouseY: mouseY,
      startObjX: obj.x,
      startObjY: obj.y,
      startObjW: obj.width,
      startObjH: obj.height,
      startAngle: obj.rotation,
      resizeHandle: handle,
    };
    setIsDragging(true);
  }, [zoom, getSlideObjects]);

  /** Döndürme tutamağı üzerinde mousedown */
  const handleRotateMouseDown = useCallback((e: React.MouseEvent, objectId: string, canvasRect: DOMRect) => {
    e.stopPropagation();
    const obj = getSlideObjects().find(o => o.id === objectId);
    if (!obj) return;

    const mouseX = (e.clientX - canvasRect.left) / zoom;
    const mouseY = (e.clientY - canvasRect.top) / zoom;

    dragRef.current = {
      mode: 'rotating',
      objectId,
      startMouseX: mouseX,
      startMouseY: mouseY,
      startObjX: obj.x,
      startObjY: obj.y,
      startObjW: obj.width,
      startObjH: obj.height,
      startAngle: obj.rotation,
    };
    setIsDragging(true);
  }, [zoom, getSlideObjects]);

  /** Mouse move — sürükleme/resize/döndürme güncelle */
  const handleMouseMove = useCallback((e: React.MouseEvent, canvasRect: DOMRect) => {
    const drag = dragRef.current;
    if (!drag) return;

    const mouseX = (e.clientX - canvasRect.left) / zoom;
    const mouseY = (e.clientY - canvasRect.top) / zoom;
    const dx = mouseX - drag.startMouseX;
    const dy = mouseY - drag.startMouseY;

    if (drag.mode === 'moving') {
      moveObject(drag.objectId, drag.startObjX + dx, drag.startObjY + dy);
    } else if (drag.mode === 'resizing' && drag.resizeHandle) {
      const { newW, newH, newX, newY } = calculateResize(
        drag.startObjX, drag.startObjY, drag.startObjW, drag.startObjH,
        dx, dy, drag.resizeHandle, e.shiftKey
      );
      moveObject(drag.objectId, newX, newY);
      resizeObject(drag.objectId, newW, newH);
    } else if (drag.mode === 'rotating') {
      const centerX = drag.startObjX + drag.startObjW / 2;
      const centerY = drag.startObjY + drag.startObjH / 2;
      let angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;
      // Shift: 15° snap
      if (e.shiftKey) {
        angle = Math.round(angle / 15) * 15;
      }
      rotateObject(drag.objectId, angle);
    }
  }, [zoom, moveObject, resizeObject, rotateObject]);

  /** Mouse up — sürükleme bitir, undo command oluştur */
  const handleMouseUp = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;

    const obj = getSlideObjects().find(o => o.id === drag.objectId);
    if (!obj) { dragRef.current = null; setIsDragging(false); return; }

    // Undo command oluştur (sadece gerçekten değişiklik varsa)
    if (drag.mode === 'moving' && (obj.x !== drag.startObjX || obj.y !== drag.startObjY)) {
      undoManager.execute(createMoveCommand(drag.objectId, drag.startObjX, drag.startObjY, obj.x, obj.y));
    } else if (drag.mode === 'resizing' && (obj.width !== drag.startObjW || obj.height !== drag.startObjH)) {
      undoManager.execute(createResizeCommand(drag.objectId, drag.startObjW, drag.startObjH, obj.width, obj.height));
    } else if (drag.mode === 'rotating' && obj.rotation !== drag.startAngle) {
      undoManager.execute(createRotateCommand(drag.objectId, drag.startAngle, obj.rotation));
    }

    dragRef.current = null;
    setIsDragging(false);
  }, [getSlideObjects, undoManager]);

  return {
    isDragging,
    handleCanvasMouseDown,
    handleHandleMouseDown,
    handleRotateMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}

// ─── Resize Hesaplama ──────────────────────────────────

function calculateResize(
  x: number, y: number, w: number, h: number,
  dx: number, dy: number,
  handle: ResizeHandle,
  keepAspect: boolean
): { newX: number; newY: number; newW: number; newH: number } {
  let newX = x, newY = y, newW = w, newH = h;

  switch (handle) {
    case 'se': newW = w + dx; newH = h + dy; break;
    case 'e':  newW = w + dx; break;
    case 's':  newH = h + dy; break;
    case 'nw': newX = x + dx; newY = y + dy; newW = w - dx; newH = h - dy; break;
    case 'n':  newY = y + dy; newH = h - dy; break;
    case 'ne': newY = y + dy; newW = w + dx; newH = h - dy; break;
    case 'sw': newX = x + dx; newW = w - dx; newH = h + dy; break;
    case 'w':  newX = x + dx; newW = w - dx; break;
  }

  // Minimum boyut
  if (newW < 20) { newW = 20; if (handle.includes('w')) newX = x + w - 20; }
  if (newH < 20) { newH = 20; if (handle.includes('n')) newY = y + h - 20; }

  // Shift: en-boy oranını koru
  if (keepAspect && w > 0 && h > 0) {
    const ratio = w / h;
    if (Math.abs(dx) > Math.abs(dy)) {
      newH = newW / ratio;
    } else {
      newW = newH * ratio;
    }
  }

  return { newX, newY, newW, newH };
}
