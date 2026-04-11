// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';
import { ColorPicker } from '@/components/ui/ColorPicker';
import type { SlideBackground } from '@/types/slide-object';

interface BackgroundModalProps {
  background: SlideBackground;
  onChange: (bg: Partial<SlideBackground>) => void;
  onClose: () => void;
}

type BgTab = 'solid' | 'gradient' | 'image';

export function BackgroundModal({ background, onChange, onClose }: BackgroundModalProps) {
  const [activeTab, setActiveTab] = useState<BgTab>(background.type);

  return (
    <div className="glass-card border border-white/10 rounded-2xl shadow-2xl p-5 w-72 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Arka Plan</h3>
        <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-white rounded-lg hover:bg-white/5">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Tab */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-4">
        {(['solid', 'gradient', 'image'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); onChange({ type: tab }); }}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${
              activeTab === tab ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-white'
            }`}
          >
            {tab === 'solid' ? 'Renk' : tab === 'gradient' ? 'Gradient' : 'Görsel'}
          </button>
        ))}
      </div>

      {/* Solid */}
      {activeTab === 'solid' && (
        <div className="space-y-3">
          <ColorPicker
            value={background.color}
            onChange={(color) => onChange({ type: 'solid', color })}
            label="Arka plan rengi"
          />
        </div>
      )}

      {/* Gradient */}
      {activeTab === 'gradient' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <ColorPicker value={background.gradientStart ?? '#6366F1'} onChange={(c) => onChange({ gradientStart: c })} label="Başlangıç" />
            <span className="text-on-surface-variant">→</span>
            <ColorPicker value={background.gradientEnd ?? '#000000'} onChange={(c) => onChange({ gradientEnd: c })} label="Bitiş" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">Açı: {background.gradientAngle ?? 180}°</label>
            <input
              type="range"
              min={0}
              max={360}
              value={background.gradientAngle ?? 180}
              onChange={(e) => onChange({ gradientAngle: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onChange({ gradientType: 'linear' })}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                (background.gradientType ?? 'linear') === 'linear' ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-on-surface-variant'
              }`}
            >
              Linear
            </button>
            <button
              onClick={() => onChange({ gradientType: 'radial' })}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                background.gradientType === 'radial' ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-on-surface-variant'
              }`}
            >
              Radial
            </button>
          </div>
        </div>
      )}

      {/* Image */}
      {activeTab === 'image' && (
        <div className="space-y-3">
          <button className="w-full py-6 border-2 border-dashed border-white/10 rounded-xl text-on-surface-variant hover:border-primary/30 hover:bg-white/5 transition-all flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-2xl">upload</span>
            <span className="text-[10px] font-bold">Görsel Seç</span>
          </button>
          {background.imageUrl && (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => onChange({ imageFit: 'cover' })}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border ${
                    (background.imageFit ?? 'cover') === 'cover' ? 'border-primary text-primary' : 'border-white/10 text-on-surface-variant'
                  }`}
                >
                  Kapla
                </button>
                <button
                  onClick={() => onChange({ imageFit: 'contain' })}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border ${
                    background.imageFit === 'contain' ? 'border-primary text-primary' : 'border-white/10 text-on-surface-variant'
                  }`}
                >
                  Sığdır
                </button>
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 block">
                  Bulanıklık: {background.imageBlur ?? 0}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={background.imageBlur ?? 0}
                  onChange={(e) => onChange({ imageBlur: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
