// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { THEME_LIST } from '@/lib/themes/presets';
import type { PresentationTheme, ThemeId } from '@/lib/themes/types';

interface ThemeGalleryProps {
  activeThemeId: ThemeId;
  onSelect: (themeId: ThemeId) => void;
  onClose: () => void;
}

export function ThemeGallery({ activeThemeId, onSelect, onClose }: ThemeGalleryProps) {
  return (
    <div className="glass-card border border-white/10 rounded-2xl shadow-2xl p-5 w-80 max-h-[500px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.15em]">Tema Seç</h3>
        <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-white rounded-lg hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Theme Grid */}
      <div className="space-y-2">
        {THEME_LIST.map(theme => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={theme.id === activeThemeId}
            onSelect={() => onSelect(theme.id as ThemeId)}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeCard({ theme, isActive, onSelect }: {
  theme: PresentationTheme;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
        isActive
          ? 'bg-primary/10 border border-primary/30 ring-1 ring-primary/20'
          : 'border border-white/5 hover:border-primary/20 hover:bg-white/5'
      }`}
    >
      {/* Renk önizleme */}
      <div
        className="w-12 h-8 rounded-lg shrink-0 border border-white/10 flex items-center justify-center overflow-hidden"
        style={{ background: theme.bgGradient ?? theme.bg }}
      >
        <span
          className="text-[8px] font-black"
          style={{ color: theme.textColor }}
        >
          Aa
        </span>
      </div>
      {/* Bilgi */}
      <div className="flex-1 text-left min-w-0">
        <p className="text-xs font-bold text-white truncate">{theme.name}</p>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accentColor ?? theme.badgeColor }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.bg }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.textColor }} />
          <span className="text-[9px] text-on-surface-variant ml-1">{theme.headingFont ?? 'Inter'}</span>
        </div>
      </div>
      {/* Aktif işareti */}
      {isActive && (
        <span className="material-symbols-outlined text-primary text-lg shrink-0">check_circle</span>
      )}
    </button>
  );
}
