// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export interface PresentationTheme {
  id: string;
  name: string;
  bg: string;
  textColor: string;
  badgeColor: string;
  badgeTextColor: string;
  overlayGradient: string;
  mutedColor: string;
}

export type ThemeId = 'dark' | 'light' | 'corporate';
