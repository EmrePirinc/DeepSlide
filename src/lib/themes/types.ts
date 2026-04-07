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
