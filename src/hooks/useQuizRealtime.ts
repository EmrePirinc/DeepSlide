// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set, get, off } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { quizPaths, type QuizQuestion, type LeaderboardEntry } from '@/lib/quiz/quizSchema';

interface UseQuizRealtimeReturn {
  questions: QuizQuestion[];
  leaderboard: LeaderboardEntry[];
  currentQuestionId: string | null;
  submitAnswer: (questionId: string, answer: number) => Promise<void>;
  myScore: number;
  isLoading: boolean;
  error: string | null;
}

export function useQuizRealtime(sessionId: string): UseQuizRealtimeReturn {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const db = getDatabase();
    const sessionRef = ref(db, quizPaths.session(sessionId));

    const unsubscribe = onValue(
      sessionRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setIsLoading(false);
          return;
        }

        // Questions
        const qs: QuizQuestion[] = data.questions
          ? Object.values(data.questions as Record<string, QuizQuestion>)
          : [];
        setQuestions(qs);

        // Leaderboard — sıralı
        const lb: LeaderboardEntry[] = data.leaderboard
          ? Object.values(data.leaderboard as Record<string, LeaderboardEntry>).sort(
              (a, b) => b.score - a.score
            )
          : [];
        lb.forEach((entry, i) => { entry.rank = i + 1; });
        setLeaderboard(lb);

        // Current question
        setCurrentQuestionId(data.meta?.currentQuestionId ?? null);

        // My score
        const uid = getAuth().currentUser?.uid;
        if (uid && data.leaderboard?.[uid]) {
          setMyScore(data.leaderboard[uid].score ?? 0);
        }

        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => off(sessionRef, 'value', unsubscribe as Parameters<typeof off>[2]);
  }, [sessionId]);

  const submitAnswer = useCallback(
    async (questionId: string, answer: number): Promise<void> => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('Oturum açmanız gerekiyor');

      const db = getDatabase();

      // Soruyu al, doğruluğu kontrol et
      const questionRef = ref(db, quizPaths.question(sessionId, questionId));
      const questionSnap = await get(questionRef);
      const question = questionSnap.val() as QuizQuestion | null;
      if (!question) throw new Error('Soru bulunamadı');

      const isCorrect = answer === question.correct;

      // Cevabı yaz
      await set(ref(db, quizPaths.userResponse(sessionId, user.uid, questionId)), {
        answer,
        timestamp: Date.now(),
        isCorrect,
      });

      // Skoru güncelle
      if (isCorrect) {
        const scoreRef = ref(db, quizPaths.userScore(sessionId, user.uid));
        const scoreSnap = await get(scoreRef);
        const current = (scoreSnap.val() as LeaderboardEntry | null) ?? {
          userId: user.uid,
          displayName: user.displayName ?? 'Katılımcı',
          score: 0,
          rank: 0,
          lastAnsweredAt: 0,
        };
        await set(scoreRef, {
          ...current,
          score: current.score + 1,
          lastAnsweredAt: Date.now(),
        });
      }
    },
    [sessionId]
  );

  return { questions, leaderboard, currentQuestionId, submitAnswer, myScore, isLoading, error };
}
