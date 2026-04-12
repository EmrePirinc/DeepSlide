// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import type { WizardSlide } from '@/app/api/wizard/generate/route';

interface AIWizardPanelProps {
  onAccept: (slides: WizardSlide[], title: string) => void;
  isCreating: boolean;
}

export function AIWizardPanel({ onAccept, isCreating }: AIWizardPanelProps) {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(6);
  const [slides, setSlides] = useState<WizardSlide[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError(null);
    setSlides(null);

    try {
      const res = await fetch('/api/wizard/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), slideCount }),
      });
      const data = await res.json() as { slides?: WizardSlide[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Üretim başarısız');
      setSlides(data.slides ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {!slides ? (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles size={15} className="text-primary" />
            <span>Konuyu girin — AI slayt taslağı ve konuşma keyword'lerini otomatik oluşturur.</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Sunum Konusu</label>
              <input
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 ring-primary/50"
                placeholder="Ör: Q2 Satış Sonuçları, Product Launch, Eğitim Programı..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Slayt Sayısı</label>
              <div className="flex gap-2">
                {[4, 5, 6, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSlideCount(n)}
                    className={`rounded-lg px-3 py-1.5 text-sm border transition-colors ${
                      slideCount === n
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'hover:bg-muted border-border'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || loading}
              className="flex items-center gap-2 w-full justify-center rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Oluşturuluyor…</>
              ) : (
                <><Sparkles size={15} /> AI ile Taslak Oluştur</>
              )}
            </button>
          </div>
        </>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{slides.length} slayt oluşturuldu</p>
              <button
                onClick={() => setSlides(null)}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Yeniden Dene
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {slides.map((s) => (
                <motion.div
                  key={s.order}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: s.order * 0.05 }}
                  className="rounded-lg border bg-muted/30 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">
                        <span className="text-xs text-muted-foreground mr-1.5">#{s.order + 1}</span>
                        {s.title}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {s.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="inline-block rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {s.speakerNote && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.speakerNote}</p>
                  )}
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => onAccept(slides, topic.trim())}
              disabled={isCreating}
              className="flex items-center gap-2 w-full justify-center rounded-xl bg-green-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-green-500 disabled:opacity-50 transition-colors"
            >
              {isCreating ? (
                <><Loader2 size={15} className="animate-spin" /> Sunum Oluşturuluyor…</>
              ) : (
                <>Bu Taslağı Kullan <ChevronRight size={15} /></>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Sunum oluşturulduktan sonra görselleri yükleyebilirsiniz.
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
