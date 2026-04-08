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
}

export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';

export interface Keyword {
  id: string;
  text: string;
  confidence: number;
  category?: KeywordCategory;
  isUserEdited: boolean;
  synonyms: string[];
}

export type KeywordCategory =
  | 'object'
  | 'concept'
  | 'color'
  | 'action'
  | 'emotion'
  | 'text';

export type AnalysisLanguage = 'tr' | 'en' | 'de' | 'fr';

export type TransitionType = 'zoom' | 'fade' | 'pan';
export type ThemeId = 'dark' | 'light' | 'corporate';

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
}

export type AIProviderType = 'gemini' | 'qwen' | 'gemma';
export type SpeechProviderType = 'webSpeech' | 'gemini' | 'whisper';

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
