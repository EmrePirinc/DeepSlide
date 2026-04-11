// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import type { PresentationTheme, ThemeId } from './types';

export const THEMES: Record<ThemeId, PresentationTheme> = {
  // ─── 1. Sade Koyu ────────────────────────
  dark: {
    id: 'dark',
    name: 'Sade Koyu',
    category: 'dark',
    bg: '#0F172A',
    textColor: '#F8FAFC',
    headingColor: '#FFFFFF',
    accentColor: '#6366F1',
    badgeColor: '#334155',
    badgeTextColor: '#CBD5E1',
    overlayGradient: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 100%)',
    mutedColor: '#64748B',
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },

  // ─── 2. Sade Beyaz ───────────────────────
  light: {
    id: 'light',
    name: 'Sade Beyaz',
    category: 'minimal',
    bg: '#FFFFFF',
    textColor: '#1E293B',
    headingColor: '#0F172A',
    accentColor: '#6366F1',
    badgeColor: '#E2E8F0',
    badgeTextColor: '#475569',
    overlayGradient: 'linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 100%)',
    mutedColor: '#94A3B8',
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },

  // ─── 3. Kurumsal Mavi ────────────────────
  corporate: {
    id: 'corporate',
    name: 'Kurumsal Mavi',
    category: 'corporate',
    bg: '#1E3A5F',
    textColor: '#F0F9FF',
    headingColor: '#FFFFFF',
    accentColor: '#38BDF8',
    badgeColor: '#1E40AF',
    badgeTextColor: '#BFDBFE',
    overlayGradient: 'linear-gradient(to top, rgba(30,58,95,0.85) 0%, transparent 100%)',
    mutedColor: '#7DD3FC',
    headingFont: 'Roboto',
    bodyFont: 'Roboto',
  },

  // ─── 4. Kurumsal Yeşil ───────────────────
  corporateGreen: {
    id: 'corporateGreen',
    name: 'Kurumsal Yeşil',
    category: 'corporate',
    bg: '#1B4332',
    textColor: '#F0FDF4',
    headingColor: '#FFFFFF',
    accentColor: '#34D399',
    badgeColor: '#065F46',
    badgeTextColor: '#A7F3D0',
    overlayGradient: 'linear-gradient(to top, rgba(27,67,50,0.85) 0%, transparent 100%)',
    mutedColor: '#6EE7B7',
    headingFont: 'Source Sans 3',
    bodyFont: 'Source Sans 3',
  },

  // ─── 5. Minimal Gri ──────────────────────
  minimalGrey: {
    id: 'minimalGrey',
    name: 'Minimal Gri',
    category: 'minimal',
    bg: '#F5F5F5',
    textColor: '#333333',
    headingColor: '#1A1A1A',
    accentColor: '#6366F1',
    badgeColor: '#E5E5E5',
    badgeTextColor: '#525252',
    overlayGradient: 'linear-gradient(to top, rgba(245,245,245,0.9) 0%, transparent 100%)',
    mutedColor: '#A3A3A3',
    headingFont: 'Montserrat',
    bodyFont: 'Open Sans',
  },

  // ─── 6. Gradient Mor ─────────────────────
  gradientPurple: {
    id: 'gradientPurple',
    name: 'Gradient Mor',
    category: 'creative',
    bg: '#1E1B4B',
    bgGradient: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
    textColor: '#FFFFFF',
    headingColor: '#FFFFFF',
    accentColor: '#C084FC',
    badgeColor: 'rgba(255,255,255,0.15)',
    badgeTextColor: '#E9D5FF',
    overlayGradient: 'linear-gradient(to top, rgba(30,27,75,0.85) 0%, transparent 100%)',
    mutedColor: '#C4B5FD',
    headingFont: 'Poppins',
    bodyFont: 'Inter',
  },

  // ─── 7. Gradient Turuncu ─────────────────
  gradientOrange: {
    id: 'gradientOrange',
    name: 'Gradient Turuncu',
    category: 'creative',
    bg: '#431407',
    bgGradient: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
    textColor: '#FFFFFF',
    headingColor: '#FFFFFF',
    accentColor: '#FDBA74',
    badgeColor: 'rgba(255,255,255,0.15)',
    badgeTextColor: '#FED7AA',
    overlayGradient: 'linear-gradient(to top, rgba(67,20,7,0.85) 0%, transparent 100%)',
    mutedColor: '#FB923C',
    headingFont: 'Oswald',
    bodyFont: 'Inter',
  },

  // ─── 8. Odak Lacivert ────────────────────
  focusNavy: {
    id: 'focusNavy',
    name: 'Odak Lacivert',
    category: 'dark',
    bg: '#070D1F',
    textColor: '#F8FAFC',
    headingColor: '#FFFFFF',
    accentColor: '#6366F1',
    badgeColor: '#1E293B',
    badgeTextColor: '#94A3B8',
    overlayGradient: 'linear-gradient(to top, rgba(7,13,31,0.9) 0%, transparent 100%)',
    mutedColor: '#64748B',
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },

  // ─── 9. Doğa Yeşili ─────────────────────
  natureGreen: {
    id: 'natureGreen',
    name: 'Doğa Yeşili',
    category: 'creative',
    bg: '#ECFDF5',
    textColor: '#064E3B',
    headingColor: '#022C22',
    accentColor: '#10B981',
    badgeColor: '#D1FAE5',
    badgeTextColor: '#065F46',
    overlayGradient: 'linear-gradient(to top, rgba(236,253,245,0.9) 0%, transparent 100%)',
    mutedColor: '#6EE7B7',
    headingFont: 'Nunito',
    bodyFont: 'Nunito',
  },

  // ─── 10. Teknoloji Neon ──────────────────
  techNeon: {
    id: 'techNeon',
    name: 'Teknoloji Neon',
    category: 'dark',
    bg: '#000000',
    textColor: '#00FF88',
    headingColor: '#00FF88',
    accentColor: '#00FF88',
    badgeColor: 'rgba(0,255,136,0.1)',
    badgeTextColor: '#00FF88',
    overlayGradient: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
    mutedColor: '#00CC6A',
    headingFont: 'JetBrains Mono',
    bodyFont: 'JetBrains Mono',
  },

  // ─── 11. Eğitim Pastel ───────────────────
  eduPastel: {
    id: 'eduPastel',
    name: 'Eğitim Pastel',
    category: 'colorful',
    bg: '#FFF7ED',
    textColor: '#78350F',
    headingColor: '#92400E',
    accentColor: '#F59E0B',
    badgeColor: '#FDE68A',
    badgeTextColor: '#92400E',
    overlayGradient: 'linear-gradient(to top, rgba(255,247,237,0.9) 0%, transparent 100%)',
    mutedColor: '#D97706',
    headingFont: 'Quicksand',
    bodyFont: 'Quicksand',
  },

  // ─── 12. Startup Canlı ───────────────────
  startupVivid: {
    id: 'startupVivid',
    name: 'Startup Canlı',
    category: 'creative',
    bg: '#7C3AED',
    bgGradient: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)',
    textColor: '#FFFFFF',
    headingColor: '#FFFFFF',
    accentColor: '#FDE047',
    badgeColor: 'rgba(255,255,255,0.2)',
    badgeTextColor: '#FFFFFF',
    overlayGradient: 'linear-gradient(to top, rgba(124,58,237,0.85) 0%, transparent 100%)',
    mutedColor: '#DDD6FE',
    headingFont: 'Raleway',
    bodyFont: 'Inter',
  },

  // ─── 13. Akıcı Teal ──────────────────────
  fluidTeal: {
    id: 'fluidTeal',
    name: 'Akıcı Teal',
    category: 'creative',
    bg: '#0D9488',
    textColor: '#F0FDFA',
    headingColor: '#FFFFFF',
    accentColor: '#2DD4BF',
    badgeColor: 'rgba(255,255,255,0.15)',
    badgeTextColor: '#CCFBF1',
    overlayGradient: 'linear-gradient(to top, rgba(13,148,136,0.85) 0%, transparent 100%)',
    mutedColor: '#5EEAD4',
    headingFont: 'Lato',
    bodyFont: 'Lato',
  },

  // ─── 14. Retro Sıcak ─────────────────────
  retroWarm: {
    id: 'retroWarm',
    name: 'Retro Sıcak',
    category: 'colorful',
    bg: '#FEF3C7',
    textColor: '#78350F',
    headingColor: '#451A03',
    accentColor: '#D97706',
    badgeColor: '#FDE68A',
    badgeTextColor: '#92400E',
    overlayGradient: 'linear-gradient(to top, rgba(254,243,199,0.9) 0%, transparent 100%)',
    mutedColor: '#B45309',
    headingFont: 'Playfair Display',
    bodyFont: 'Merriweather',
  },

  // ─── 15. Monokrom ────────────────────────
  monochrome: {
    id: 'monochrome',
    name: 'Monokrom',
    category: 'minimal',
    bg: '#18181B',
    textColor: '#FAFAFA',
    headingColor: '#FFFFFF',
    accentColor: '#A1A1AA',
    badgeColor: '#27272A',
    badgeTextColor: '#A1A1AA',
    overlayGradient: 'linear-gradient(to top, rgba(24,24,27,0.9) 0%, transparent 100%)',
    mutedColor: '#71717A',
    headingFont: 'Work Sans',
    bodyFont: 'Work Sans',
  },
};

export const THEME_LIST = Object.values(THEMES);

export const DEFAULT_THEME: ThemeId = 'dark';

export function getTheme(id: ThemeId): PresentationTheme {
  return THEMES[id] ?? THEMES.dark;
}
