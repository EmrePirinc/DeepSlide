// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export interface Presentation {
  id: string;
  title: string;
  description?: string;
  images: PresentationImage[];
  settings: PresentationSettings;
  createdAt: number;
  updatedAt: number;
  folderId?: string | null;
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;       // 0–100 (percent of image width)
  y: number;       // 0–100 (percent of image height)
  fontSize: number;
  color: string;
  bold: boolean;
}

export interface PresentationImage {
  id: string;
  presentationId: string;
  fileName: string;
  mimeType: string;
  blobKey: string;
  thumbnailDataUrl: string;
  width: number;
  height: number;
  order: number;
  keywords: Keyword[];
  analysisStatus: AnalysisStatus;
  analysisError?: string;
  createdAt: number;
  textOverlays?: TextOverlay[];
}

export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

export interface Keyword {
  id: string;
  text: string;
  confidence: number;
  category?: KeywordCategory;
  isUserEdited: boolean;
  synonyms: string[];
  /**
   * Türkçe ek varyasyonları — Gemini'nin ürettiği, kullanıcının söyleyebileceği
   * ek almış formlar: "yolu", "yolunda", "yoluna", "yolları" gibi.
   * Keyword matcher bu formları da index'e ekler.
   */
  forms?: string[];
  /**
   * Başka benzer sesli bir Türkçe kelimeye karışma olasılığı (0-1).
   * Gemini her keyword için değerlendirir:
   *   - Yüksek örnekler: "sis" (siz), "bal" (bel), "kar" (kır) → ~0.85
   *   - Düşük örnekler: "yürüyüş yolu", "bulut", "dağ"       → ~0.2
   * Match threshold bu değere göre dinamik olarak yükseltilir.
   */
  confusability?: number;
}

export type KeywordCategory =
  | 'object'
  | 'concept'
  | 'color'
  | 'action'
  | 'emotion'
  | 'text';

export type AnalysisLanguage = 'tr' | 'en' | 'de' | 'fr';

import type { TransitionType as ExtTransitionType } from '@/lib/animation/transitions/types';
import type { ThemeId as ExtThemeId } from '@/lib/themes/types';
export type TransitionType = ExtTransitionType;
export type ThemeId = ExtThemeId;

export interface PresentationSettings {
  columnCount: 3 | 4 | 5;
  zoomScale: number;
  transitionDuration: number;
  matchThreshold: number;
  language: string;
  analysisLanguage: AnalysisLanguage;
  showKeywordBadges: boolean;
  dimInactiveImages: boolean;
  imageAnalysisProvider: AIProviderType;
  speechProvider: SpeechProviderType;
  transitionType: TransitionType;
  selectedTheme: ThemeId;
  overviewReturnTimeout: number;
  // Privacy Shield (Faz 2)
  passwordProtected?: boolean;
  sharePassword?: string;
}

export type AIProviderType = 'gemini' | 'ollama';
export type SpeechProviderType = 'webSpeech' | 'gemini' | 'whisper' | 'deepgram';

export const DEFAULT_SETTINGS: PresentationSettings = {
  columnCount: 4,
  zoomScale: 1.8,
  transitionDuration: 500,
  matchThreshold: 0.7,
  language: 'tr-TR',
  analysisLanguage: 'tr',
  showKeywordBadges: true,
  dimInactiveImages: true,
  imageAnalysisProvider: 'gemini',
  speechProvider: 'webSpeech',
  transitionType: 'zoom',
  selectedTheme: 'dark',
  overviewReturnTimeout: 10,
};
