'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1


import { THEMES } from '@/lib/themes/presets';
import type { ThemeId } from '@/lib/themes/types';

interface ThemeSelectorProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  const themes = Object.values(THEMES);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Sunum Teması</label>
      <div className="grid grid-cols-3 gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id as ThemeId)}
            className={`
              relative rounded-lg p-3 text-left transition-all border-2
              ${value === theme.id ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-muted-foreground/20'}
            `}
            style={{ backgroundColor: theme.bg }}
          >
            <div className="space-y-1">
              <div
                className="w-full h-8 rounded"
                style={{ backgroundColor: theme.badgeColor }}
              />
              <p
                className="text-xs font-medium"
                style={{ color: theme.textColor }}
              >
                {theme.name}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
