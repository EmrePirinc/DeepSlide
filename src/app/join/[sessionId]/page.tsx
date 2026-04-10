// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { use, useState } from 'react';
import { useQuizRealtime } from '@/hooks/useQuizRealtime';
import { cn } from '@/lib/utils';

export default function JoinPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const { questions, currentQuestionId, submitAnswer, myScore, isLoading, error } = useQuizRealtime(sessionId);
  const [answered, setAnswered] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Record<string, boolean>>({});

  const currentQuestion = currentQuestionId
    ? questions.find((q) => q.id === currentQuestionId)
    : null;

  const handleAnswer = async (answer: number) => {
    if (!currentQuestionId || answered[currentQuestionId] !== undefined || submitting) return;
    setSubmitting(true);
    try {
      await submitAnswer(currentQuestionId, answer);
      const question = questions.find((q) => q.id === currentQuestionId);
      setAnswered((prev) => ({ ...prev, [currentQuestionId]: answer }));
      setFeedbacks((prev) => ({ ...prev, [currentQuestionId]: answer === question?.correct }));
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-6 gap-6">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">DeepSlide Quiz</h1>
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-300">
            {myScore} puan
          </span>
        </div>

        {!currentQuestion ? (
          <div className="rounded-2xl bg-white/5 p-8 text-center">
            <p className="text-white/60">Soru bekleniyor…</p>
            <p className="mt-2 text-sm text-white/30">Sunum başladığında sorular burada görünecek</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white/5 p-6 flex flex-col gap-4">
            <p className="text-base font-medium text-white leading-relaxed">{currentQuestion.text}</p>

            <div className="grid gap-2">
              {currentQuestion.options.map((option, i) => {
                // currentQuestionId is non-null here — we're inside the `currentQuestion` branch
                const qId = currentQuestionId!;
                const hasAnswered = answered[qId] !== undefined;
                const isSelected = answered[qId] === i;
                const isCorrect = currentQuestion.correct === i;
                const showFeedback = hasAnswered;

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={hasAnswered || submitting}
                    className={cn(
                      'rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200',
                      'ring-1 ring-white/10',
                      !hasAnswered && 'bg-white/5 text-white hover:bg-white/10',
                      showFeedback && isSelected && isCorrect && 'bg-green-500/20 text-green-300 ring-green-500/50',
                      showFeedback && isSelected && !isCorrect && 'bg-red-500/20 text-red-300 ring-red-500/50',
                      showFeedback && !isSelected && isCorrect && 'bg-green-500/10 text-green-400/70',
                      showFeedback && !isSelected && !isCorrect && 'opacity-40 text-white/50',
                    )}
                  >
                    <span className="mr-2 text-white/30">{String.fromCharCode(65 + i)}.</span>
                    {option}
                  </button>
                );
              })}
            </div>

            {(() => {
              const qId = currentQuestionId!;
              return answered[qId] !== undefined ? (
                <p className={cn(
                  'text-center text-sm font-semibold',
                  feedbacks[qId] ? 'text-green-400' : 'text-red-400'
                )}>
                  {feedbacks[qId] ? '✓ Doğru!' : '✗ Yanlış'}
                </p>
              ) : null;
            })()}
          </div>
        )}
      </div>
    </main>
  );
}
