// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

export interface TranscriptResult {
  text: string;
  words: string[];
  isFinal: boolean;
  confidence: number;
}

export interface MatchResult {
  keyword: string;
  imageIds: string[];
  score: number;
}

export interface SpeechProviderInterface {
  name: string;
  isAvailable(): boolean;
  start(lang: string): void;
  stop(): void;
  onTranscript: ((result: TranscriptResult) => void) | null;
  onError: ((error: Error) => void) | null;
}
