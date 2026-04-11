// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export interface PresentationTheme {
  id: string;
  name: string;
  category: ThemeCategory;
  bg: string;
  bgGradient?: string;
  textColor: string;
  headingColor?: string;
  accentColor?: string;
  badgeColor: string;
  badgeTextColor: string;
  overlayGradient: string;
  mutedColor: string;
  headingFont?: string;
  bodyFont?: string;
}

export type ThemeCategory = 'minimal' | 'corporate' | 'creative' | 'dark' | 'colorful';

export type ThemeId =
  | 'dark'
  | 'light'
  | 'corporate'
  | 'corporateGreen'
  | 'minimalGrey'
  | 'gradientPurple'
  | 'gradientOrange'
  | 'focusNavy'
  | 'natureGreen'
  | 'techNeon'
  | 'eduPastel'
  | 'startupVivid'
  | 'fluidTeal'
  | 'retroWarm'
  | 'monochrome';
