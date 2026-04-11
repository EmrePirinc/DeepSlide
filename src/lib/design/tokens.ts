// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * DeepSlide "Cinematic Canvas" Design Tokens
 * Source: DESIGN.md + Stitch output
 *
 * Bu dosya programatik renk ihtiyaçları için tek kaynak.
 * CSS variable'ları globals.css'te tanımlanır.
 */

// Surface Hierarchy (Obsidian layering)
export const surfaces = {
  background: "#070D1F",           // Floor — en derin katman
  surface: "#0C1324",              // Foundation — ana yüzey
  surfaceContainer: "#191F31",     // Panels — sidebar, workspace
  surfaceContainerHigh: "#23293C", // Objects — sürüklenebilir elemanlar
  surfaceBright: "#33394C",        // Popovers/Modals — kullanıcıya en yakın
} as const;

// Primary & Accent
export const colors = {
  primary: "#6366F1",              // Indigo — laser, az kullan
  primaryContainer: "#4F46E5",     // Darker indigo — hover states
  secondary: "#C3C0FF",           // Light violet — muted secondary
  onSurface: "#F8FAFC",           // Ana metin
  onSurfaceVariant: "#94A3B8",    // İkincil metin
  outlineVariant: "rgba(144, 143, 160, 0.15)", // Ghost border
  destructive: "#F43F5E",         // Rose — danger
  success: "#10B981",             // Emerald — success
  warning: "#F59E0B",             // Amber — warning
} as const;

// Glass Effects
export const glass = {
  panel: {
    backdrop: "blur(24px)",
    background: "rgba(15, 23, 42, 0.65)",
  },
  card: {
    backdrop: "blur(16px)",
    background: "rgba(255, 255, 255, 0.03)",
  },
} as const;

// Border Radius
export const radius = {
  sm: "0.375rem",   // 6px
  md: "0.5rem",     // 8px — default
  lg: "0.75rem",    // 12px
  xl: "1rem",       // 16px
  "2xl": "1.25rem", // 20px
  full: "9999px",   // pill
} as const;

// Shadows
export const shadows = {
  premium: "0 20px 50px -12px rgba(0, 0, 0, 0.5)",
  primaryGlow: "0 0 0 2px #6366F1, 0 10px 25px -5px rgba(99, 102, 241, 0.4)",
  ambient: "0px 20px 40px rgba(7, 13, 31, 0.5)",
  progressGlow: "0 0 15px #6366F1",
} as const;

// Easing
export const easing = {
  easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

// Presentation Themes (runtime'da FocusedSlide tarafından kullanılır)
export const presentationThemes = {
  dark: {
    bg: surfaces.background,
    textColor: colors.onSurface,
    badgeColor: surfaces.surfaceContainerHigh,
    badgeTextColor: colors.onSurfaceVariant,
    overlayGradient: `linear-gradient(to top, rgba(7,13,31,0.8) 0%, transparent 100%)`,
    mutedColor: colors.onSurfaceVariant,
  },
  light: {
    bg: "#fafafa",
    textColor: "#111827",
    badgeColor: "#e5e7eb",
    badgeTextColor: "#374151",
    overlayGradient: `linear-gradient(to top, rgba(250,250,250,0.9) 0%, transparent 100%)`,
    mutedColor: "#9ca3af",
  },
  corporate: {
    bg: surfaces.surface,
    textColor: colors.onSurface,
    badgeColor: colors.primaryContainer,
    badgeTextColor: colors.secondary,
    overlayGradient: `linear-gradient(to top, rgba(12,19,36,0.85) 0%, transparent 100%)`,
    mutedColor: colors.onSurfaceVariant,
  },
} as const;
