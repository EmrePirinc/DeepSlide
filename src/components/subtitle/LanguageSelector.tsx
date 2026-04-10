// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

const LANGUAGES = [
  { code: 'tr', label: '🇹🇷 Türkçe' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'fr', label: '🇫🇷 Français' },
] as const;

export type SubtitleLanguage = 'tr' | 'en' | 'de' | 'fr';

interface LanguageSelectorProps {
  value: SubtitleLanguage;
  onChange: (lang: SubtitleLanguage) => void;
  disabled?: boolean;
}

export function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SubtitleLanguage)}
      disabled={disabled}
      className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-blue-400/50 disabled:opacity-50 transition"
      aria-label="Alt yazı dili"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code} className="bg-zinc-900">
          {lang.label}
        </option>
      ))}
    </select>
  );
}
