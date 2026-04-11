// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';
import { SHAPE_DEFINITIONS, getShapesByCategory } from '@/lib/canvas/shapes';
import type { ShapeType } from '@/types/slide-object';

interface ShapeGalleryProps {
  onSelect: (shapeType: ShapeType) => void;
  onClose: () => void;
}

type Category = 'basic' | 'arrows' | 'callouts';

const TABS: { id: Category; label: string; icon: string }[] = [
  { id: 'basic', label: 'Temel', icon: 'category' },
  { id: 'arrows', label: 'Oklar', icon: 'arrow_forward' },
  { id: 'callouts', label: 'Belirtme', icon: 'chat_bubble' },
];

export function ShapeGallery({ onSelect, onClose }: ShapeGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<Category>('basic');
  const shapes = getShapesByCategory(activeCategory);

  return (
    <div className="glass-card border border-white/10 rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Şekil Ekle</h3>
        <button
          onClick={onClose}
          className="p-1 text-on-surface-variant hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-3">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
              activeCategory === tab.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Shape Grid */}
      <div className="grid grid-cols-4 gap-2">
        {shapes.map(shape => (
          <button
            key={shape.id}
            onClick={() => { onSelect(shape.id); onClose(); }}
            className="aspect-square flex items-center justify-center p-2 rounded-xl border border-white/5 hover:border-primary/40 hover:bg-white/5 hover:scale-110 transition-all group"
            title={shape.name}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-8 h-8 fill-on-surface-variant group-hover:fill-white transition-colors"
              stroke="none"
              dangerouslySetInnerHTML={{ __html: shape.svgContent }}
            />
          </button>
        ))}
      </div>

      {/* Shape count */}
      <p className="text-[10px] text-on-surface-variant text-center mt-3">
        {SHAPE_DEFINITIONS.length} şekil mevcut
      </p>
    </div>
  );
}
