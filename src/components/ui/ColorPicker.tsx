// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState, useRef, useEffect } from 'react';

const THEME_COLORS = [
  '#6366F1', '#4F46E5', '#8B5CF6', '#EC4899',
  '#EF4444', '#F59E0B', '#10B981', '#06B6D4',
];

const BASIC_COLORS = [
  '#000000', '#FFFFFF', '#F8FAFC', '#94A3B8',
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#3B82F6', '#A855F7',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  showTransparent?: boolean;
}

export function ColorPicker({ value, onChange, label, showTransparent }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('ds-recent-colors') ?? '[]');
    } catch { return []; }
  });
  const ref = useRef<HTMLDivElement>(null);

  // Dışına tıklayınca kapat
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // value değişince hex input güncelle
  useEffect(() => {
    setHexInput(value);
  }, [value]);

  const selectColor = (color: string) => {
    onChange(color);
    setHexInput(color);
    // Son kullanılan renklere ekle
    const updated = [color, ...recentColors.filter(c => c !== color)].slice(0, 8);
    setRecentColors(updated);
    try { localStorage.setItem('ds-recent-colors', JSON.stringify(updated)); } catch {}
    setIsOpen(false);
  };

  const handleHexSubmit = () => {
    const hex = hexInput.startsWith('#') ? hexInput : `#${hexInput}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      selectColor(hex);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group"
        aria-label={label ?? 'Renk seç'}
      >
        <div
          className="w-6 h-6 rounded-md border border-white/20 group-hover:ring-2 ring-primary transition-all"
          style={{ backgroundColor: value === 'transparent' ? undefined : value }}
        >
          {value === 'transparent' && (
            <div className="w-full h-full rounded-md" style={{
              backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            }} />
          )}
        </div>
        {label && <span className="text-xs font-medium text-on-surface-variant">{label}</span>}
      </button>

      {/* Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 glass-card border border-white/10 rounded-2xl shadow-2xl p-4 w-56 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          {/* Tema renkleri */}
          <div>
            <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.15em] mb-2">Tema</p>
            <div className="flex flex-wrap gap-1.5">
              {THEME_COLORS.map(c => (
                <ColorSwatch key={c} color={c} isActive={value === c} onClick={() => selectColor(c)} />
              ))}
            </div>
          </div>

          {/* Temel renkler */}
          <div>
            <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.15em] mb-2">Temel</p>
            <div className="flex flex-wrap gap-1.5">
              {BASIC_COLORS.map(c => (
                <ColorSwatch key={c} color={c} isActive={value === c} onClick={() => selectColor(c)} />
              ))}
            </div>
          </div>

          {/* Şeffaf seçeneği */}
          {showTransparent && (
            <button
              onClick={() => selectColor('transparent')}
              className={`w-full text-xs py-1.5 rounded-lg border transition-colors ${
                value === 'transparent' ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-on-surface-variant hover:bg-white/5'
              }`}
            >
              Şeffaf
            </button>
          )}

          {/* Son kullanılan */}
          {recentColors.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.15em] mb-2">Son Kullanılan</p>
              <div className="flex flex-wrap gap-1.5">
                {recentColors.map(c => (
                  <ColorSwatch key={c} color={c} isActive={value === c} onClick={() => selectColor(c)} />
                ))}
              </div>
            </div>
          )}

          {/* Hex input */}
          <div className="flex gap-2">
            <input
              value={hexInput}
              onChange={e => setHexInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleHexSubmit()}
              onBlur={handleHexSubmit}
              placeholder="#6366F1"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-on-surface-variant/40 outline-none focus:ring-1 ring-primary font-mono"
              maxLength={7}
            />
            <div
              className="w-8 h-8 rounded-lg border border-white/10 shrink-0"
              style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(hexInput) ? hexInput : value }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ColorSwatch({ color, isActive, onClick }: { color: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-6 h-6 rounded-full transition-all hover:scale-110 ${
        isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:ring-1 ring-white/30'
      }`}
      style={{ backgroundColor: color }}
      aria-label={color}
    />
  );
}
