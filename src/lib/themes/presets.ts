import type { PresentationTheme, ThemeId } from './types';

export const THEMES: Record<ThemeId, PresentationTheme> = {
  dark: {
    id: 'dark',
    name: 'Koyu Profesyonel',
    bg: '#000000',
    textColor: '#ffffff',
    badgeColor: '#374151',
    badgeTextColor: '#d1d5db',
    overlayGradient: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
    mutedColor: '#6b7280',
  },
  light: {
    id: 'light',
    name: 'Açık Minimalist',
    bg: '#fafafa',
    textColor: '#111827',
    badgeColor: '#e5e7eb',
    badgeTextColor: '#374151',
    overlayGradient: 'linear-gradient(to top, rgba(250,250,250,0.9) 0%, transparent 100%)',
    mutedColor: '#9ca3af',
  },
  corporate: {
    id: 'corporate',
    name: 'Mavi Kurumsal',
    bg: '#0f172a',
    textColor: '#f1f5f9',
    badgeColor: '#1e40af',
    badgeTextColor: '#bfdbfe',
    overlayGradient: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 100%)',
    mutedColor: '#64748b',
  },
};

export const DEFAULT_THEME: ThemeId = 'dark';

export function getTheme(id: ThemeId): PresentationTheme {
  return THEMES[id] ?? THEMES.dark;
}
