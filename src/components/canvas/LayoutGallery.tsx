// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { SLIDE_LAYOUTS, type SlideLayout } from '@/lib/canvas/layouts';

interface LayoutGalleryProps {
  onSelect: (layout: SlideLayout) => void;
  onClose: () => void;
}

export function LayoutGallery({ onSelect, onClose }: LayoutGalleryProps) {
  return (
    <div className="glass-card border border-white/10 rounded-2xl shadow-2xl p-5 w-[480px] animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Slayt Düzeni Seç</h3>
        <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-white rounded-lg hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
        {SLIDE_LAYOUTS.map(layout => (
          <button
            key={layout.id}
            onClick={() => { onSelect(layout); onClose(); }}
            className="group flex flex-col items-center gap-2 p-2 rounded-xl border border-white/5 hover:border-primary/40 hover:bg-white/5 transition-all"
          >
            {/* Mini Önizleme */}
            <div className="w-full aspect-video bg-surface-variant rounded-lg relative overflow-hidden border border-white/10">
              {layout.placeholders.map(ph => (
                <div
                  key={ph.id}
                  className="absolute border border-dashed border-white/20"
                  style={{
                    left: `${(ph.x / 960) * 100}%`,
                    top: `${(ph.y / 540) * 100}%`,
                    width: `${(ph.width / 960) * 100}%`,
                    height: `${(ph.height / 540) * 100}%`,
                    backgroundColor: ph.type === 'image' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {ph.type === 'title' && <div className="w-3/4 h-1 bg-white/30 mt-1 mx-auto rounded" />}
                  {ph.type === 'text' && (
                    <div className="p-0.5 space-y-0.5">
                      <div className="w-full h-0.5 bg-white/15 rounded" />
                      <div className="w-4/5 h-0.5 bg-white/15 rounded" />
                      <div className="w-3/5 h-0.5 bg-white/15 rounded" />
                    </div>
                  )}
                  {ph.type === 'image' && (
                    <span className="material-symbols-outlined text-white/20 text-xs absolute inset-0 flex items-center justify-center">image</span>
                  )}
                </div>
              ))}
              {layout.placeholders.length === 0 && (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-[8px]">Boş</div>
              )}
            </div>
            {/* İsim */}
            <span className="text-[10px] font-bold text-on-surface-variant group-hover:text-white transition-colors truncate w-full text-center">
              {layout.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
