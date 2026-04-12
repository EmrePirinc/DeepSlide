'use client';
// Copyright (c) 2026 Emre Pirinc. All rights reserved.
// Licensed under the Business Source License 1.1

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AppShell } from '@/components/layout/AppShell';
import { getDB } from '@/lib/db/index';
import type { PresentationSession } from '@/types/analytics';
import type { Presentation } from '@/types/presentation';

interface WrappedStats {
  totalSessions: number;
  totalDurationMs: number;
  totalSlides: number;
  totalMatches: number;
  topKeywords: { text: string; count: number }[];
  longestSession: { title: string; durationMs: number } | null;
  presentationCount: number;
  avgMatchRate: number;
}

function fmtMs(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}s ${m}d`;
  return `${m} dakika`;
}

const YEAR = new Date().getFullYear();

export default function WrappedPage() {
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    async function compute() {
      const db = await getDB();
      const allSessions: PresentationSession[] = await db.getAll('sessions');
      const allPresentations: Presentation[] = await db.getAll('presentations');

      const yearStart = new Date(`${YEAR}-01-01`).getTime();
      const sessions = allSessions.filter((s) => s.startedAt >= yearStart);

      if (sessions.length === 0) {
        setStats(null);
        setLoading(false);
        return;
      }

      const totalDurationMs = sessions.reduce((s, r) => s + r.durationMs, 0);
      const totalSlides = sessions.reduce((s, r) => s + r.totalSlides, 0);
      const totalMatches = sessions.reduce((s, r) => s + r.totalMatches, 0);
      const avgMatchRate = totalSlides > 0 ? totalMatches / totalSlides : 0;

      // Top keywords from all presentations used in sessions
      const presentationIds = [...new Set(sessions.map((s) => s.presentationId))];
      const keywordCounts = new Map<string, number>();
      for (const pid of presentationIds) {
        const pres = allPresentations.find((p) => p.id === pid);
        if (!pres) continue;
        for (const img of pres.images) {
          for (const kw of img.keywords) {
            keywordCounts.set(kw.text, (keywordCounts.get(kw.text) ?? 0) + 1);
          }
        }
      }
      const topKeywords = Array.from(keywordCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([text, count]) => ({ text, count }));

      // Longest session
      const longest = sessions.reduce<PresentationSession | null>((best, s) =>
        !best || s.durationMs > best.durationMs ? s : best, null);
      const longestTitle = longest
        ? (allPresentations.find((p) => p.id === longest.presentationId)?.title ?? 'Bilinmiyor')
        : null;

      setStats({
        totalSessions: sessions.length,
        totalDurationMs,
        totalSlides,
        totalMatches,
        topKeywords,
        longestSession: longestTitle ? { title: longestTitle, durationMs: longest!.durationMs } : null,
        presentationCount: presentationIds.length,
        avgMatchRate,
      });
      setLoading(false);
    }
    compute();
  }, []);

  // Auto-advance stat cards
  useEffect(() => {
    if (!stats || loading) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 6), 4000);
    return () => clearInterval(t);
  }, [stats, loading]);

  const CARDS = stats ? [
    { emoji: '🎤', value: stats.totalSessions, label: 'Sunum Yaptın', sub: `${YEAR} yılında` },
    { emoji: '⏱️', value: fmtMs(stats.totalDurationMs), label: 'Toplam Konuştun', sub: 'sahne ışıkları altında' },
    { emoji: '🖼️', value: stats.totalSlides, label: 'Slayt Gösterdin', sub: `${stats.presentationCount} farklı sunumda` },
    { emoji: '🎯', value: `${Math.round(stats.avgMatchRate * 100)}%`, label: 'Keyword Eşleşme', sub: 'ortalama başarı oranın' },
    {
      emoji: '🏆',
      value: stats.longestSession ? fmtMs(stats.longestSession.durationMs) : '—',
      label: 'En Uzun Sunum',
      sub: stats.longestSession?.title ?? '',
    },
    {
      emoji: '🔑',
      value: stats.topKeywords[0]?.text ?? '—',
      label: 'En Çok Konuştuğun Konu',
      sub: stats.topKeywords.slice(1, 4).map((k) => k.text).join(' · '),
    },
  ] : [];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{YEAR} Konuşmacı Raporu</h1>
          <p className="text-muted-foreground mt-1">Yılın sunumları, tek bakışta.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !stats ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-medium">{YEAR} için veri yok</p>
            <p className="text-sm mt-1">Sunum yaptıktan sonra buraya yıllık istatistikleriniz gelecek.</p>
          </div>
        ) : (
          <>
            {/* Hero stat card — auto-rotating */}
            <div className="relative h-64 mb-6">
              {CARDS.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: i === step ? 1 : 0, scale: i === step ? 1 : 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-8 text-center"
                  style={{ pointerEvents: i === step ? 'auto' : 'none' }}
                >
                  <span className="text-5xl mb-3">{card.emoji}</span>
                  <p className="text-4xl font-bold">{card.value}</p>
                  <p className="text-lg font-medium mt-1">{card.label}</p>
                  {card.sub && <p className="text-sm text-muted-foreground mt-0.5">{card.sub}</p>}
                </motion.div>
              ))}
            </div>

            {/* Step indicators */}
            <div className="flex gap-1.5 justify-center mb-8">
              {CARDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
                />
              ))}
            </div>

            {/* All stats grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {CARDS.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border bg-card p-4"
                >
                  <span className="text-2xl">{card.emoji}</span>
                  <p className="text-xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Top keywords */}
            {stats.topKeywords.length > 0 && (
              <div className="rounded-xl border p-5">
                <p className="font-semibold mb-3">En Çok Geçen Konular</p>
                <div className="flex flex-wrap gap-2">
                  {stats.topKeywords.map((kw, i) => (
                    <span
                      key={kw.text}
                      className="rounded-full px-3 py-1.5 text-sm font-medium"
                      style={{
                        fontSize: `${Math.max(11, 14 - i)}px`,
                        backgroundColor: `hsl(${(i * 45) % 360} 70% ${i < 3 ? '85%' : '92%'})`,
                        color: `hsl(${(i * 45) % 360} 60% 25%)`,
                      }}
                    >
                      {kw.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
