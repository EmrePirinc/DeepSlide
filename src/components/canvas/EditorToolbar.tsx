// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ShapeGallery } from './ShapeGallery';
import { useCanvasStore, type ActiveTool } from '@/stores/canvasStore';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import type { ShapeType } from '@/types/slide-object';

interface EditorToolbarProps {
  onShapeSelect?: (shapeType: ShapeType) => void;
  onImageUpload?: () => void;
}

const TOOLS: { id: ActiveTool; icon: string; label: string }[] = [
  { id: 'select', icon: 'arrow_selector_tool', label: 'Seçim' },
  { id: 'text', icon: 'title', label: 'Metin Kutusu' },
  { id: 'image', icon: 'image', label: 'Resim Ekle' },
];

export function EditorToolbar({ onShapeSelect, onImageUpload }: EditorToolbarProps) {
  const activeTool = useCanvasStore(s => s.activeTool);
  const setActiveTool = useCanvasStore(s => s.setActiveTool);
  const zoom = useCanvasStore(s => s.zoom);
  const setZoom = useCanvasStore(s => s.setZoom);
  const { canUndo, canRedo, undo, redo, lastUndoDescription, lastRedoDescription } = useUndoRedo();
  const [showShapeGallery, setShowShapeGallery] = useState(false);

  const handleToolClick = (toolId: ActiveTool) => {
    if (toolId === 'image') {
      onImageUpload?.();
      return;
    }
    setActiveTool(toolId);
  };

  const handleShapeSelect = (shapeType: ShapeType) => {
    setActiveTool('shape');
    onShapeSelect?.(shapeType);
    setShowShapeGallery(false);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-surface/60 backdrop-blur-xl border-b border-white/5">
      {/* Sol — Araçlar */}
      <div className="flex items-center gap-1">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`p-2 rounded-lg transition-all ${
              activeTool === tool.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:text-white hover:bg-white/5'
            }`}
            title={tool.label}
          >
            <MaterialIcon icon={tool.icon} size={20} />
          </button>
        ))}

        {/* Şekil butonu + galeri */}
        <div className="relative">
          <button
            onClick={() => setShowShapeGallery(!showShapeGallery)}
            className={`p-2 rounded-lg transition-all ${
              activeTool === 'shape'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:text-white hover:bg-white/5'
            }`}
            title="Şekil Ekle"
          >
            <MaterialIcon icon="hexagon" size={20} />
          </button>
          {showShapeGallery && (
            <div className="absolute top-full left-0 mt-2 z-50">
              <ShapeGallery
                onSelect={handleShapeSelect}
                onClose={() => setShowShapeGallery(false)}
              />
            </div>
          )}
        </div>

        {/* Çizgi butonu */}
        <button
          onClick={() => setActiveTool('line')}
          className={`p-2 rounded-lg transition-all ${
            activeTool === 'line'
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'text-on-surface-variant hover:text-white hover:bg-white/5'
          }`}
          title="Çizgi / Ok"
        >
          <MaterialIcon icon="pen_size_2" size={20} />
        </button>

        {/* Ayırıcı */}
        <div className="h-6 w-px bg-white/10 mx-1" />

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title={lastUndoDescription ? `Geri al: ${lastUndoDescription}` : 'Geri al (⌘Z)'}
        >
          <MaterialIcon icon="undo" size={20} />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          title={lastRedoDescription ? `Yinele: ${lastRedoDescription}` : 'Yinele (⌘⇧Z)'}
        >
          <MaterialIcon icon="redo" size={20} />
        </button>
      </div>

      {/* Sağ — Zoom */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          disabled={zoom <= 0.25}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
        >
          <MaterialIcon icon="remove" size={18} />
        </button>
        <span className="text-[11px] font-black text-white w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          disabled={zoom >= 3}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
        >
          <MaterialIcon icon="add" size={18} />
        </button>
      </div>
    </div>
  );
}
