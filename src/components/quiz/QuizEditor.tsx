// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';
import type { QuizQuestion } from '@/lib/quiz/quizSchema';

interface QuizEditorProps {
  questions: QuizQuestion[];
  onSave: (questions: QuizQuestion[]) => void;
  onClose: () => void;
}

export function QuizEditor({ questions: initial, onSave, onClose }: QuizEditorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initial);

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: unknown) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: q.options.map((o, oi) => (oi === optIndex ? value : o)) }
          : q
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 p-6 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Soruları Düzenle</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-2xl leading-none">✕</button>
        </div>

        {questions.map((q, qi) => (
          <div key={q.id} className="rounded-xl bg-white/5 p-4 flex flex-col gap-3">
            <div className="text-xs text-white/40 font-mono">Soru {qi + 1}</div>
            <textarea
              value={q.text}
              onChange={(e) => updateQuestion(qi, 'text', e.target.value)}
              rows={2}
              placeholder="Soru metni"
              className="w-full resize-none rounded-lg bg-white/5 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-blue-400/50"
            />
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correct === oi}
                    onChange={() => updateQuestion(qi, 'correct', oi)}
                    className="accent-green-500"
                    aria-label={`Soru ${qi + 1} doğru cevap ${oi + 1}`}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Seçenek ${String.fromCharCode(65 + oi)}`}
                    className="flex-1 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-blue-400/50"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            İptal
          </button>
          <button
            onClick={() => onSave(questions)}
            className="rounded-xl bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-500 transition"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
