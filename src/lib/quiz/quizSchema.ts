// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

/**
 * Firebase Realtime Database Şeması
 *
 * /quiz/{sessionId}/
 *   questions/{questionId}: QuizQuestion
 *   responses/{userId}/{questionId}: QuizResponse
 *   leaderboard/{userId}: LeaderboardEntry
 *   meta: SessionMeta
 */

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correct: number;
  imageId: string;
  createdAt: number;
}

export interface QuizResponse {
  answer: number;
  timestamp: number;
  isCorrect: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
  lastAnsweredAt: number;
}

export interface SessionMeta {
  sessionId: string;
  presentationId: string;
  hostUid: string;
  status: 'waiting' | 'active' | 'ended';
  createdAt: number;
  currentQuestionId: string | null;
}

export type QuizDB = {
  quiz: Record<
    string,
    {
      questions: Record<string, QuizQuestion>;
      responses: Record<string, Record<string, QuizResponse>>;
      leaderboard: Record<string, LeaderboardEntry>;
      meta: SessionMeta;
    }
  >;
};

// Firebase Realtime DB path yardımcıları
export const quizPaths = {
  session: (sessionId: string) => `quiz/${sessionId}`,
  meta: (sessionId: string) => `quiz/${sessionId}/meta`,
  questions: (sessionId: string) => `quiz/${sessionId}/questions`,
  question: (sessionId: string, qId: string) => `quiz/${sessionId}/questions/${qId}`,
  responses: (sessionId: string) => `quiz/${sessionId}/responses`,
  userResponse: (sessionId: string, userId: string, qId: string) =>
    `quiz/${sessionId}/responses/${userId}/${qId}`,
  leaderboard: (sessionId: string) => `quiz/${sessionId}/leaderboard`,
  userScore: (sessionId: string, userId: string) => `quiz/${sessionId}/leaderboard/${userId}`,
};
