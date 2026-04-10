// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';

interface SummaryModalProps {
  summary: string[];
  actionItems: string[];
  onApprove: (edited: { summary: string[]; actionItems: string[] }) => void;
  onClose: () => void;
}

export function SummaryModal({ summary, actionItems, onApprove, onClose }: SummaryModalProps) {
  const [editedSummary, setEditedSummary] = useState(summary);
  const [editedActions, setEditedActions] = useState(actionItems);

  const updateSummary = (index: number, value: string) => {
    setEditedSummary((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const updateAction = (index: number, value: string) => {
    setEditedActions((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">AI Özet Önizleme</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 text-2xl leading-none">✕</button>
        </div>

        <p className="text-sm text-white/50">
          Özeti düzenleyip onaylayabilirsiniz. Onaylamadan e-posta gönderilmez.
        </p>

        <section>
          <h3 className="mb-2 text-sm font-medium text-white/70 uppercase tracking-wide">Özet</h3>
          <div className="flex flex-col gap-2">
            {editedSummary.map((item, i) => (
              <textarea
                key={i}
                value={item}
                onChange={(e) => updateSummary(i, e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-blue-400/50 transition"
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-medium text-white/70 uppercase tracking-wide">Aksiyon Listesi</h3>
          <div className="flex flex-col gap-2">
            {editedActions.map((item, i) => (
              <textarea
                key={i}
                value={item}
                onChange={(e) => updateAction(i, e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-blue-400/50 transition"
              />
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            İptal
          </button>
          <button
            onClick={() => onApprove({ summary: editedSummary, actionItems: editedActions })}
            className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-400 transition"
          >
            Onayla ve Gönder
          </button>
        </div>
      </div>
    </div>
  );
}
